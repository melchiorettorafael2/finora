import { Component, ElementRef, OnDestroy, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth-service/auth-service';

/**
 * Tela do Google Authenticator: 2ª etapa do login para quem ativou a verificação
 * em duas etapas em Configurações (é opcional).
 */
@Component({
  selector: 'app-verificacao',
  imports: [ReactiveFormsModule, NgTemplateOutlet],
  templateUrl: './verificacao.html',
  // Mesmo visual da tela de login (fundo, painel, marca, campo do código e botões)
  styleUrls: ['../login/login.scss', './verificacao.scss'],
})
export class Verificacao implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastrService);

  anoAtual = new Date().getFullYear();

  verificando = signal(false);
  erroCodigo = signal<string | null>(null);

  // Depois do código aceito: mostra a confirmação por um instante antes de abrir o Dashboard
  private static readonly ATRASO_REDIRECIONAMENTO_MS = 2000;
  autenticado = signal(false);
  private timerRedirecionamento?: ReturnType<typeof setTimeout>;
  codigoControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
  });
  private inputCodigo = viewChild<ElementRef<HTMLInputElement>>('inputCodigo');

  constructor() {
    afterNextRender(() => this.focarCodigo());
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerRedirecionamento);
  }

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
    if (this.verificando() || this.autenticado()) {
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
    this.verificando.set(true);
    this.authService.verificarDoisFatores(dados).subscribe({
      next: () => {
        this.verificando.set(false);
        this.autenticado.set(true);
        this.toast.success('Login realizado com sucesso!', 'Sucesso');
        // Pausa para o usuário ver a confirmação antes de trocar de tela
        this.timerRedirecionamento = setTimeout(
          () => this.router.navigate(['/paginas/dashboard']),
          Verificacao.ATRASO_REDIRECIONAMENTO_MS
        );
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
