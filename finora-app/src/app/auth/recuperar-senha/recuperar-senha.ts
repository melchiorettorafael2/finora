import { Component, ElementRef, Injector, OnDestroy, OnInit, afterNextRender, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../auth-service/auth-service';

interface NovaSenhaForm {
  novaSenha: FormControl<string>;
  confirmarSenha: FormControl<string>;
}

type Etapa = 'email' | 'enviado' | 'nova-senha' | 'link-invalido' | 'concluido';

const senhasIguais: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const nova = grupo.get('novaSenha')?.value;
  const confirmacao = grupo.get('confirmarSenha')?.value;
  return nova && confirmacao && nova !== confirmacao ? { senhasDiferentes: true } : null;
};

/**
 * "Esqueci minha senha" por e-mail:
 * 1. a pessoa informa o email e a API envia um link (/recuperar-senha?token=...);
 * 2. o link abre esta mesma tela já na etapa da nova senha.
 */
@Component({
  selector: 'app-recuperar-senha',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-senha.html',
  // Mesmo visual da tela de login (fundo, painel, marca, campos e botões)
  styleUrls: ['../login/login.scss', './recuperar-senha.scss'],
})
export class RecuperarSenha implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastrService);
  private injector = inject(Injector);

  anoAtual = new Date().getFullYear();
  etapa = signal<Etapa>('email');
  enviando = signal(false);
  mostrarSenha = signal(false);
  emailEnviado = signal('');
  // Erro vindo da API (ex.: email sem conta), mostrado embaixo do campo
  erroEmail = signal<string | null>(null);

  // Reenviar só depois de alguns segundos (a API também limita a um e-mail por minuto)
  private static readonly ESPERA_REENVIO_S = 60;
  esperaReenvio = signal(0);
  private timerReenvio?: ReturnType<typeof setInterval>;

  private tokenRedefinicao: string | null = null;
  private timerRedirecionamento?: ReturnType<typeof setTimeout>;
  private inputNovaSenha = viewChild<ElementRef<HTMLInputElement>>('inputNovaSenha');

  emailControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });

  constructor() {
    // Digitou de novo: some o aviso da API
    this.emailControl.valueChanges.subscribe(() => this.erroEmail.set(null));
  }

  novaSenhaForm = new FormGroup<NovaSenhaForm>(
    {
      novaSenha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmarSenha: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: senhasIguais }
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      return;
    }
    // Tira o token da barra de endereço (histórico, prints, compartilhar a tela)
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });

    if (this.tokenExpirado(token)) {
      this.etapa.set('link-invalido');
      return;
    }
    this.tokenRedefinicao = token;
    this.etapa.set('nova-senha');
    afterNextRender(() => this.inputNovaSenha()?.nativeElement.focus(), { injector: this.injector });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerRedirecionamento);
    clearInterval(this.timerReenvio);
  }

  campoInvalido(controle: AbstractControl | null): boolean {
    return !!controle && controle.invalid && controle.touched;
  }

  // ===== Etapa 1: pedir o link =====

  enviarLink(): void {
    if (this.enviando() || this.esperaReenvio() > 0) {
      return;
    }
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    const email = this.emailControl.value.trim();
    this.enviando.set(true);
    this.authService.solicitarRedefinicaoSenha(email).subscribe({
      next: () => {
        this.enviando.set(false);
        this.emailEnviado.set(email);
        this.etapa.set('enviado');
        this.iniciarEsperaReenvio();
      },
      error: erro => {
        this.enviando.set(false);
        if (erro.status === 422 && erro.error?.camposInvalidos?.length) {
          // Email sem conta (ou inválido): volta para o campo com o aviso
          this.erroEmail.set(erro.error.camposInvalidos[0].erro);
          this.etapa.set('email');
          return;
        }
        this.toast.error('Não foi possível enviar o link. Tente de novo.', 'Erro');
        console.error(erro);
      },
    });
  }

  private iniciarEsperaReenvio(): void {
    clearInterval(this.timerReenvio);
    this.esperaReenvio.set(RecuperarSenha.ESPERA_REENVIO_S);
    this.timerReenvio = setInterval(() => {
      this.esperaReenvio.update(s => s - 1);
      if (this.esperaReenvio() <= 0) {
        clearInterval(this.timerReenvio);
      }
    }, 1000);
  }

  // ===== Etapa 2: nova senha (aberta pelo link) =====

  redefinir(): void {
    if (this.enviando()) {
      return;
    }
    if (this.novaSenhaForm.invalid) {
      this.novaSenhaForm.markAllAsTouched();
      return;
    }
    if (!this.tokenRedefinicao) {
      this.etapa.set('link-invalido');
      return;
    }

    this.enviando.set(true);
    this.authService.redefinirSenha({
      tokenRedefinicao: this.tokenRedefinicao,
      novaSenha: this.novaSenhaForm.controls.novaSenha.value,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.tokenRedefinicao = null;
        this.etapa.set('concluido');
        this.toast.success('Senha alterada. Já pode entrar com ela.', 'Sucesso');
        this.timerRedirecionamento = setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: erro => {
        this.enviando.set(false);
        // Link expirou ou já foi usado
        if (erro.status === 401) {
          this.tokenRedefinicao = null;
          this.etapa.set('link-invalido');
          return;
        }
        if (erro.status === 422 && erro.error?.camposInvalidos?.length) {
          this.toast.error(erro.error.camposInvalidos[0].erro, 'Erro');
          return;
        }
        this.toast.error('Não foi possível trocar a senha. Tente de novo.', 'Erro');
        console.error(erro);
      },
    });
  }

  /** Volta para o pedido do link (outro email ou link vencido). */
  pedirOutroLink(): void {
    this.tokenRedefinicao = null;
    this.novaSenhaForm.reset();
    this.mostrarSenha.set(false);
    this.etapa.set('email');
  }

  // Só para mostrar a mensagem certa sem esperar a API; quem decide de verdade é o servidor
  private tokenExpirado(token: string): boolean {
    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      return !!exp && Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }
}
