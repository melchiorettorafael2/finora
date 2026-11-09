import { Component, ElementRef, Injector, OnDestroy, afterNextRender, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth-service/auth-service';

interface IdentidadeForm {
  login: FormControl<string>;
  codigo: FormControl<string>;
}

interface NovaSenhaForm {
  novaSenha: FormControl<string>;
  confirmarSenha: FormControl<string>;
}

type Etapa = 'identidade' | 'nova-senha' | 'concluido';

const senhasIguais: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const nova = grupo.get('novaSenha')?.value;
  const confirmacao = grupo.get('confirmarSenha')?.value;
  return nova && confirmacao && nova !== confirmacao ? { senhasDiferentes: true } : null;
};

/**
 * "Esqueci minha senha" em duas etapas, cada uma com seu formulário:
 * 1. nome/email + código do Google Authenticator, conferidos pela API;
 * 2. só depois disso, nova senha + confirmação (com o token devolvido na etapa 1).
 */
@Component({
  selector: 'app-recuperar-senha',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-senha.html',
  // Mesmo visual da tela de login (fundo, painel, marca, campos e botões)
  styleUrls: ['../login/login.scss', './recuperar-senha.scss'],
})
export class RecuperarSenha implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private injector = inject(Injector);

  anoAtual = new Date().getFullYear();
  etapa = signal<Etapa>('identidade');
  enviando = signal(false);
  erroIdentidade = signal<string | null>(null);
  mostrarSenha = signal(false);

  // Fica só em memória: recarregar a página recomeça pela etapa 1
  private tokenRedefinicao: string | null = null;
  loginConfirmado = signal('');
  private timerRedirecionamento?: ReturnType<typeof setTimeout>;

  private inputNovaSenha = viewChild<ElementRef<HTMLInputElement>>('inputNovaSenha');

  identidadeForm = new FormGroup<IdentidadeForm>({
    login: new FormControl('', { nonNullable: true, validators: Validators.required }),
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] }),
  });

  novaSenhaForm = new FormGroup<NovaSenhaForm>(
    {
      novaSenha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmarSenha: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: senhasIguais }
  );

  ngOnDestroy(): void {
    clearTimeout(this.timerRedirecionamento);
  }

  campoInvalido(form: FormGroup, campo: string): boolean {
    const controle = form.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  // ===== Etapa 1: identidade =====

  // Aceita só dígitos no código (inclusive ao colar "123 456")
  onCodigoInput(): void {
    const controle = this.identidadeForm.controls.codigo;
    const somenteDigitos = controle.value.replace(/\D/g, '').slice(0, 6);
    if (somenteDigitos !== controle.value) {
      controle.setValue(somenteDigitos);
    }
    this.erroIdentidade.set(null);
  }

  verificarIdentidade(): void {
    if (this.enviando()) {
      return;
    }
    if (this.identidadeForm.invalid) {
      this.identidadeForm.markAllAsTouched();
      return;
    }

    const login = this.identidadeForm.controls.login.value.trim();
    const codigo = this.identidadeForm.controls.codigo.value;
    this.enviando.set(true);
    this.authService.verificarIdentidadeParaSenha({ login, codigo }).subscribe({
      next: resposta => {
        this.enviando.set(false);
        this.tokenRedefinicao = resposta.tokenRedefinicao;
        this.loginConfirmado.set(login);
        this.etapa.set('nova-senha');
        afterNextRender(() => this.inputNovaSenha()?.nativeElement.focus(), { injector: this.injector });
      },
      error: erro => {
        this.enviando.set(false);
        if (erro.status === 422 && erro.error?.camposInvalidos?.length) {
          this.erroIdentidade.set(erro.error.camposInvalidos[0].erro);
          // O código não pode ser reaproveitado: limpa para digitar o próximo do app
          this.identidadeForm.controls.codigo.reset();
          return;
        }
        this.toast.error('Não foi possível verificar. Tente novamente.', 'Erro');
        console.error(erro);
      },
    });
  }

  // ===== Etapa 2: nova senha =====

  redefinir(): void {
    if (this.enviando()) {
      return;
    }
    if (this.novaSenhaForm.invalid) {
      this.novaSenhaForm.markAllAsTouched();
      return;
    }
    if (!this.tokenRedefinicao) {
      this.recomecar();
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
        this.toast.success('Senha redefinida! Entre com a nova senha.', 'Sucesso');
        this.timerRedirecionamento = setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: erro => {
        this.enviando.set(false);
        // Token de redefinição expirou (10 min) ou já foi usado
        if (erro.status === 401) {
          this.toast.error('A confirmação de identidade expirou. Comece novamente.', 'Erro');
          this.recomecar();
          return;
        }
        if (erro.status === 422 && erro.error?.camposInvalidos?.length) {
          this.toast.error(erro.error.camposInvalidos[0].erro, 'Erro de Validação');
          return;
        }
        this.toast.error('Não foi possível redefinir a senha. Tente novamente.', 'Erro');
        console.error(erro);
      },
    });
  }

  /** Volta para a etapa 1 descartando a confirmação de identidade. */
  recomecar(): void {
    this.tokenRedefinicao = null;
    this.loginConfirmado.set('');
    this.identidadeForm.controls.codigo.reset();
    this.novaSenhaForm.reset();
    this.mostrarSenha.set(false);
    this.erroIdentidade.set(null);
    this.etapa.set('identidade');
  }
}
