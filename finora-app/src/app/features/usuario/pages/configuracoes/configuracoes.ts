import {
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModaisService } from '../../../../common/services/modais-service';
import { ValidationErroResponse } from '../../../../shared/models/validation-error-models';
import { UsuarioService } from '../../services/usuario-service';
import { AlterarSenhaForm, DadosUsuarioForm } from '../../models/dados-usuario';

interface DadosForm {
  nome: FormControl<string>;
  email: FormControl<string>;
}

interface SenhaForm {
  senhaAtual: FormControl<string>;
  novaSenha: FormControl<string>;
  confirmarSenha: FormControl<string>;
}

const TIPOS_FOTO_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB, mesmo limite da API

const senhasIguais: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const nova = grupo.get('novaSenha')?.value;
  const confirmacao = grupo.get('confirmarSenha')?.value;
  return nova && confirmacao && nova !== confirmacao ? { senhasDiferentes: true } : null;
};

@Component({
  selector: 'app-configuracoes',
  imports: [ReactiveFormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit, OnDestroy {
  /** Configurações abre em modal (ver ModaisService e o layout Template) */
  modais = inject(ModaisService);

  private service = inject(UsuarioService);
  private toast = inject(ToastrService);
  private injector = inject(Injector);

  private formDadosRef = viewChild<ElementRef<HTMLElement>>('formDados');
  private formSenhaRef = viewChild<ElementRef<HTMLElement>>('formSenha');

  dadosForm = new FormGroup<DadosForm>({
    nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  senhaForm = new FormGroup<SenhaForm>(
    {
      senhaAtual: new FormControl('', { nonNullable: true, validators: Validators.required }),
      novaSenha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmarSenha: new FormControl('', { nonNullable: true, validators: Validators.required }),
    },
    { validators: senhasIguais }
  );

  // Os campos ficam bloqueados até o usuário clicar em "Editar"
  editandoDados = signal(false);
  editandoSenha = signal(false);
  private dadosOriginais: DadosUsuarioForm = { nome: '', email: '' };

  // null enquanto carrega
  doisFatoresAtivo = signal<boolean | null>(null);
  // Conta de demonstração: a API bloqueia perfil, senha, foto e 2FA; aqui só avisamos e desabilitamos
  demo = signal(false);

  carregando = signal(true);
  salvandoDados = signal(false);
  salvandoSenha = signal(false);
  salvandoFoto = signal(false);
  mostrarSenhas = signal(false);

  // Foto escolhida mas ainda não enviada
  arquivoSelecionado = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  erroFoto = signal<string | null>(null);

  fotoAtual = this.service.fotoUrl;
  fotoExibida = computed(() => this.previewUrl() ?? this.fotoAtual());

  ngOnInit(): void {
    this.dadosForm.disable();
    this.senhaForm.disable();

    this.service.carregarFoto();
    this.service.obterDados().subscribe({
      next: usuario => {
        this.doisFatoresAtivo.set(usuario.doisFatoresAtivo);
        this.demo.set(!!usuario.demo);
        this.dadosOriginais = { nome: usuario.nome, email: usuario.email };
        this.dadosForm.reset(this.dadosOriginais);
        this.carregando.set(false);
      },
      error: erro => {
        this.carregando.set(false);
        this.toast.error('Não foi possível carregar seus dados.', 'Erro');
        console.error(erro);
      },
    });
  }

  ngOnDestroy(): void {
    this.limparPreview();
  }

  // ===== Foto =====

  selecionarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    input.value = ''; // permite escolher o mesmo arquivo de novo

    if (!arquivo) {
      return;
    }
    if (!TIPOS_FOTO_PERMITIDOS.includes(arquivo.type)) {
      this.erroFoto.set('Formato inválido. Use JPG, PNG ou WEBP.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      this.erroFoto.set('A imagem deve ter no máximo 2 MB.');
      return;
    }

    this.erroFoto.set(null);
    this.limparPreview();
    this.arquivoSelecionado.set(arquivo);
    this.previewUrl.set(URL.createObjectURL(arquivo));
  }

  cancelarFoto(): void {
    this.limparPreview();
    this.erroFoto.set(null);
  }

  salvarFoto(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) {
      return;
    }

    this.salvandoFoto.set(true);
    this.service.salvarFoto(arquivo).subscribe({
      next: () => {
        this.salvandoFoto.set(false);
        this.limparPreview();
        this.toast.success('Foto atualizada.', 'Sucesso');
      },
      error: erro => {
        this.salvandoFoto.set(false);
        this.erroFoto.set(this.primeiraMensagemDeValidacao(erro) ?? 'Não foi possível salvar a foto.');
        this.onApiError(erro);
      },
    });
  }

  removerFoto(): void {
    this.salvandoFoto.set(true);
    this.service.removerFoto().subscribe({
      next: () => {
        this.salvandoFoto.set(false);
        this.toast.success('Foto removida.', 'Sucesso');
      },
      error: erro => {
        this.salvandoFoto.set(false);
        this.onApiError(erro);
      },
    });
  }

  private limparPreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.previewUrl.set(null);
    this.arquivoSelecionado.set(null);
  }

  // ===== Dados pessoais =====

  editarDados(): void {
    this.dadosForm.enable();
    this.editandoDados.set(true);
    this.rolarAteFormulario(this.formDadosRef, 'nearest');
  }

  // Descarta o que foi digitado e volta aos dados salvos
  cancelarEdicaoDados(): void {
    this.dadosForm.reset(this.dadosOriginais);
    this.dadosForm.disable();
    this.editandoDados.set(false);
  }

  salvarDados(): void {
    if (this.formInvalido(this.dadosForm)) {
      return;
    }

    const dados: DadosUsuarioForm = this.dadosForm.getRawValue();
    this.salvandoDados.set(true);
    this.service.atualizarDados(dados).subscribe({
      next: () => {
        this.salvandoDados.set(false);
        this.dadosOriginais = { nome: dados.nome.trim(), email: dados.email.trim() };
        this.dadosForm.reset(this.dadosOriginais);
        this.dadosForm.disable();
        this.editandoDados.set(false);
        this.toast.success('Dados atualizados.', 'Sucesso');
      },
      error: erro => {
        this.salvandoDados.set(false);
        this.onApiError(erro, this.dadosForm);
      },
    });
  }

  // ===== Senha =====

  editarSenha(): void {
    this.senhaForm.enable();
    this.editandoSenha.set(true);
    // O form de senha é o último da página: rola até o final para mostrá-lo inteiro
    this.rolarAteFormulario(this.formSenhaRef, 'end');
  }

  cancelarEdicaoSenha(): void {
    this.senhaForm.reset();
    this.senhaForm.disable();
    this.mostrarSenhas.set(false);
    this.editandoSenha.set(false);
  }

  alterarSenha(): void {
    if (this.formInvalido(this.senhaForm)) {
      return;
    }

    const { senhaAtual, novaSenha } = this.senhaForm.getRawValue();
    const dados: AlterarSenhaForm = { senhaAtual, novaSenha };
    this.salvandoSenha.set(true);
    this.service.alterarSenha(dados).subscribe({
      next: () => {
        this.salvandoSenha.set(false);
        this.cancelarEdicaoSenha();
        this.toast.success('Senha alterada.', 'Sucesso');
      },
      error: erro => {
        this.salvandoSenha.set(false);
        this.onApiError(erro, this.senhaForm);
      },
    });
  }

  // ===== Helpers =====

  // Espera o Angular renderizar o form (o de senha só existe em modo de edição) e então
  // rola até ele e foca o primeiro campo. scrollIntoView rola o container certo
  // (.main-content), que é quem tem a barra de rolagem, e não a janela.
  private rolarAteFormulario(ref: () => ElementRef<HTMLElement> | undefined, posicao: ScrollLogicalPosition): void {
    afterNextRender(
      () => {
        const form = ref()?.nativeElement;
        if (!form) {
          return;
        }
        form.scrollIntoView({ behavior: 'smooth', block: posicao });
        form.querySelector<HTMLInputElement>('input:not([type="checkbox"])')?.focus({ preventScroll: true });
      },
      { injector: this.injector }
    );
  }

  campoInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  erroApi(form: FormGroup, campo: string): string | null {
    return form.get(campo)?.getError('apiError') ?? null;
  }

  private formInvalido(form: FormGroup): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      this.toast.error('Confira os campos destacados.', 'Erro');
      return true;
    }
    return false;
  }

  private primeiraMensagemDeValidacao(erro: any): string | null {
    const validacao: ValidationErroResponse | undefined = erro?.status === 422 ? erro.error : undefined;
    return validacao?.camposInvalidos?.[0]?.erro ?? null;
  }

  private onApiError(erro: any, form?: FormGroup): void {
    if (erro.status === 422 && erro.error?.camposInvalidos) {
      const validacao: ValidationErroResponse = erro.error;
      validacao.camposInvalidos.forEach(ci => {
        const control = form?.get(ci.campo);
        if (control) {
          control.setErrors({ apiError: ci.erro });
          control.markAsTouched();
        }
        this.toast.error(ci.erro, 'Erro');
      });
      return;
    }
    if (erro.status === 409 && erro.error?.message) {
      this.toast.error(erro.error.message, 'Erro');
      return;
    }
    this.toast.error('Algo deu errado. Tente de novo.', 'Erro');
    console.error(erro.error);
  }
}
