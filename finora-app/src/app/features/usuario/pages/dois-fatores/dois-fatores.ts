import { Component, ElementRef, Injector, OnDestroy, OnInit, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { toDataURL } from 'qrcode';
import { Header } from '../../../../common/components/header/header';
import { ModaisService } from '../../../../common/services/modais-service';
import { ConfiguracaoDoisFatores } from '../../models/dados-usuario';
import { DoisFatoresService } from '../../services/dois-fatores-service';

type Estado = 'carregando' | 'inativo' | 'configurando' | 'ativo' | 'erro';

@Component({
  selector: 'app-dois-fatores',
  imports: [ReactiveFormsModule, NgTemplateOutlet, Header],
  templateUrl: './dois-fatores.html',
  styleUrl: './dois-fatores.scss',
})
export class DoisFatores implements OnInit, OnDestroy {
  private service = inject(DoisFatoresService);
  private toast = inject(ToastrService);
  private injector = inject(Injector);
  private router = inject(Router);
  private modais = inject(ModaisService);

  estado = signal<Estado>('carregando');
  processando = signal(false);

  // Configuração em andamento (QR code + chave manual)
  configuracao = signal<ConfiguracaoDoisFatores | null>(null);
  qrCodeUrl = signal<string | null>(null);
  chaveCopiada = signal(false);
  private timerCopia?: ReturnType<typeof setTimeout>;

  // Chave em blocos de 4 para facilitar a digitação manual no app
  chaveFormatada = computed(() => this.configuracao()?.segredo.match(/.{1,4}/g)?.join(' ') ?? '');

  // Desativação pede um código para confirmar
  confirmandoDesativacao = signal(false);

  codigoControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
  });
  erroCodigo = signal<string | null>(null);
  private inputCodigo = viewChild<ElementRef<HTMLInputElement>>('inputCodigo');

  readonly linkPlayStore = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';
  readonly linkAppStore = 'https://apps.apple.com/app/google-authenticator/id388497605';

  ngOnInit(): void {
    this.carregarStatus();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timerCopia);
  }

  carregarStatus(): void {
    this.estado.set('carregando');
    this.service.status().subscribe({
      next: status => this.estado.set(status.ativo ? 'ativo' : 'inativo'),
      error: erro => {
        this.estado.set('erro');
        console.error(erro);
      },
    });
  }

  // ===== Ativação =====

  iniciarConfiguracao(): void {
    this.processando.set(true);
    this.service.configurar().subscribe({
      next: async configuracao => {
        try {
          // QR code gerado no navegador: o segredo não passa por nenhum serviço externo
          const qrCode = await toDataURL(configuracao.otpauthUri, {
            width: 220,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#0e1622', light: '#ffffff' },
          });
          this.qrCodeUrl.set(qrCode);
        } catch (erro) {
          // Sem QR code ainda dá para usar a chave manual
          this.qrCodeUrl.set(null);
          console.error(erro);
        }
        this.configuracao.set(configuracao);
        this.limparCodigo();
        this.processando.set(false);
        this.estado.set('configurando');
      },
      error: erro => {
        this.processando.set(false);
        this.tratarErro(erro);
      },
    });
  }

  cancelarConfiguracao(): void {
    this.descartarConfiguracao();
    this.estado.set('inativo');
  }

  ativar(): void {
    if (!this.codigoValido()) {
      return;
    }

    this.processando.set(true);
    this.service.ativar(this.codigoControl.value).subscribe({
      next: () => {
        this.processando.set(false);
        this.descartarConfiguracao();
        this.estado.set('ativo');
        this.toast.success('Verificação em duas etapas ativada!', 'Sucesso');
      },
      error: erro => {
        this.processando.set(false);
        this.tratarErro(erro);
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

  // ===== Desativação =====

  abrirDesativacao(): void {
    this.limparCodigo();
    this.confirmandoDesativacao.set(true);
  }

  cancelarDesativacao(): void {
    this.confirmandoDesativacao.set(false);
    this.limparCodigo();
  }

  desativar(): void {
    if (!this.codigoValido()) {
      return;
    }

    this.processando.set(true);
    this.service.desativar(this.codigoControl.value).subscribe({
      next: () => {
        this.processando.set(false);
        this.confirmandoDesativacao.set(false);
        this.limparCodigo();
        this.estado.set('inativo');
        this.toast.success('Aplicativo desconectado. Configure o novo celular abaixo ou no próximo login.', 'Sucesso');
      },
      error: erro => {
        this.processando.set(false);
        this.tratarErro(erro);
      },
    });
  }

  // ===== Campo do código =====

  // Aceita só dígitos, inclusive ao colar "123 456"
  onCodigoInput(): void {
    const somenteDigitos = this.codigoControl.value.replace(/\D/g, '').slice(0, 6);
    if (somenteDigitos !== this.codigoControl.value) {
      this.codigoControl.setValue(somenteDigitos);
    }
    this.erroCodigo.set(null);
  }

  // Configurações é um modal: volta para o Dashboard já com ele aberto
  voltarParaConfiguracoes(): void {
    this.router.navigate(['/paginas/dashboard']).then(() => this.modais.abrirConfiguracoes());
  }

  private codigoValido(): boolean {
    if (this.codigoControl.invalid) {
      this.erroCodigo.set('Digite os 6 dígitos do aplicativo.');
      this.focarCodigo();
      return false;
    }
    return true;
  }

  private limparCodigo(): void {
    this.codigoControl.reset();
    this.erroCodigo.set(null);
    this.focarCodigo();
  }

  // O input só existe depois que o Angular renderiza o novo estado
  private focarCodigo(): void {
    afterNextRender(() => this.inputCodigo()?.nativeElement.focus(), { injector: this.injector });
  }

  private descartarConfiguracao(): void {
    this.configuracao.set(null);
    this.qrCodeUrl.set(null);
    this.chaveCopiada.set(false);
    this.codigoControl.reset();
    this.erroCodigo.set(null);
  }

  private tratarErro(erro: any): void {
    if (erro.status === 422 && erro.error?.camposInvalidos?.length) {
      this.erroCodigo.set(erro.error.camposInvalidos[0].erro);
      this.codigoControl.reset();
      this.focarCodigo();
      return;
    }
    this.toast.error('Erro ao Processar a Requisição!', 'Erro');
    console.error(erro);
  }
}
