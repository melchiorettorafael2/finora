import { Component, ElementRef, OnDestroy, OnInit, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { toDataURL } from 'qrcode';
import { Observable } from 'rxjs';
import { AuthService } from '../auth-service/auth-service';
import { AuthResponse } from '../dados-auth';
import { ConfiguracaoDoisFatores } from '../../features/usuario/models/dados-usuario';

/**
 * Tela do Google Authenticator: 2ª etapa obrigatória do login e do cadastro.
 * - modo 'codigo': o app já está configurado, só digita o código.
 * - modo 'configuracao': primeiro acesso, escaneia o QR code e confirma o primeiro código.
 */
@Component({
  selector: 'app-verificacao',
  imports: [ReactiveFormsModule, NgTemplateOutlet],
  templateUrl: './verificacao.html',
  // Mesmo visual da tela de login (fundo, painel, marca, campo do código e botões)
  styleUrls: ['../login/login.scss', './verificacao.scss'],
})
export class Verificacao implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  anoAtual = new Date().getFullYear();
  modo = signal(this.authService.getModoDesafioDoisFatores());

  verificando = signal(false);
  erroCodigo = signal<string | null>(null);
  codigoControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
  });
  private inputCodigo = viewChild<ElementRef<HTMLInputElement>>('inputCodigo');

  // ===== Primeiro acesso: QR code =====
  carregandoQrCode = signal(false);
  configuracao = signal<ConfiguracaoDoisFatores | null>(null);
  qrCodeUrl = signal<string | null>(null);
  chaveCopiada = signal(false);
  private timerCopia?: ReturnType<typeof setTimeout>;
  // Chave em blocos de 4 para facilitar a digitação manual no app
  chaveFormatada = computed(() => this.configuracao()?.segredo.match(/.{1,4}/g)?.join(' ') ?? '');

  readonly linkPlayStore = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';
  readonly linkAppStore = 'https://apps.apple.com/app/google-authenticator/id388497605';

  constructor() {
    afterNextRender(() => this.focarCodigo());
  }

  ngOnInit(): void {
    if (this.modo() === 'configuracao') {
      this.gerarQrCode();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerCopia);
  }

  gerarQrCode(): void {
    const tokenDesafio = this.authService.getDesafioDoisFatores();
    if (!tokenDesafio) {
      this.sessaoExpirada();
      return;
    }

    this.carregandoQrCode.set(true);
    this.authService.configurarDoisFatoresNoLogin(tokenDesafio).subscribe({
      next: async configuracao => {
        try {
          // QR code gerado no navegador: o segredo não passa por nenhum serviço externo
          this.qrCodeUrl.set(await toDataURL(configuracao.otpauthUri, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#0e1622', light: '#ffffff' },
          }));
        } catch (erro) {
          // Sem QR code ainda dá para usar a chave manual
          this.qrCodeUrl.set(null);
          console.error(erro);
        }
        this.configuracao.set(configuracao);
        this.carregandoQrCode.set(false);
      },
      error: erro => {
        this.carregandoQrCode.set(false);
        if (erro.status === 401) {
          this.sessaoExpirada();
          return;
        }
        this.toast.error('Não foi possível gerar o QR code. Tente novamente.', 'Erro');
        console.error(erro);
      },
    });
  }

  async copiarChave(): Promise<void> {
    const segredo = this.configuracao()?.segredo;
    if (!segredo) {
      return;
    }
    try {
      await navigator.clipboard.writeText(segredo);
      this.chaveCopiada.set(true);
      clearTimeout(this.timerCopia);
      this.timerCopia = setTimeout(() => this.chaveCopiada.set(false), 2000);
    } catch {
      this.toast.error('Não foi possível copiar. Selecione a chave e copie manualmente.', 'Erro');
    }
  }

  // ===== Código =====

  // Aceita só dígitos (inclusive ao colar "123 456") e envia sozinho ao completar 6
  onCodigoInput(): void {
    const somenteDigitos = this.codigoControl.value.replace(/\D/g, '').slice(0, 6);
    if (somenteDigitos !== this.codigoControl.value) {
      this.codigoControl.setValue(somenteDigitos);
    }
    this.erroCodigo.set(null);
    if (somenteDigitos.length === 6) {
      this.verificar();
    }
  }

  verificar(): void {
    if (this.verificando()) {
      return;
    }
    if (this.codigoControl.invalid) {
      this.erroCodigo.set('Digite os 6 dígitos do aplicativo autenticador.');
      return;
    }

    const tokenDesafio = this.authService.getDesafioDoisFatores();
    if (!tokenDesafio) {
      this.sessaoExpirada();
      return;
    }

    const dados = { tokenDesafio, codigo: this.codigoControl.value };
    const requisicao: Observable<AuthResponse> = this.modo() === 'configuracao'
      ? this.authService.ativarDoisFatoresNoLogin(dados)
      : this.authService.verificarDoisFatores(dados);

    this.verificando.set(true);
    requisicao.subscribe({
      next: () => {
        this.verificando.set(false);
        this.toast.success(
          this.modo() === 'configuracao' ? 'Google Authenticator configurado! Bem-vindo ao Finora.' : 'Login realizado com sucesso!',
          'Sucesso'
        );
        this.router.navigate(['/paginas/dashboard']);
      },
      error: (erro) => {
        this.verificando.set(false);
        // O token de desafio expirou ou é inválido: precisa digitar a senha de novo
        if (erro.status === 401) {
          this.sessaoExpirada();
          return;
        }
        if (erro.status === 422) {
          this.erroCodigo.set(erro.error?.camposInvalidos?.[0]?.erro ?? 'Código inválido.');
        } else {
          this.toast.error('Erro ao verificar o código. Tente novamente.', 'Erro');
          console.error(erro);
        }
        this.codigoControl.reset();
        this.focarCodigo();
      },
    });
  }

  voltarParaLogin(): void {
    this.authService.limparDesafioDoisFatores();
    this.router.navigate(['/login']);
  }

  private sessaoExpirada(): void {
    this.toast.error('A verificação expirou. Faça login novamente.', 'Erro');
    this.voltarParaLogin();
  }

  private focarCodigo(): void {
    this.inputCodigo()?.nativeElement.focus();
  }
}
