import { Component, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DadosLancamentoForm, TipoLancamento } from '../dados-lancamentos';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
import { LancamentoService } from '../lancamento-service';
import { DetalhesCategoria } from '../../features/categorias/models/dados-categoria';
import { DetalhesCartao } from '../../features/cartoes/models/dados-cartao';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { ValidationErroResponse } from '../../shared/models/validation-error-models';



interface CadastroLancamentoForm {
  categoriaId: FormControl<string>;
  descricao: FormControl<string>;
  data: FormControl<string>;
  valor: FormControl<string>;
  tipo: FormControl<TipoLancamento | ''>;
  cartaoId: FormControl<string>;
}

/** Formulário de lançamento, aberto em modal (listagem de lançamentos e dashboard). */
@Component({
  selector: 'app-cadastro-lancamento',
  imports: [ReactiveFormsModule, CommonModule, NgxMaskDirective],
  templateUrl: './cadastro-lancamento.html',
  styleUrl: './cadastro-lancamento.scss',
})
export class CadastroLancamento implements OnInit {

  salvo = output<void>();
  cancelado = output<void>();

  form!: FormGroup<CadastroLancamentoForm>;
  toast = inject(ToastrService);
  service = inject(LancamentoService);

  categoriasAtivas = signal<DetalhesCategoria[]>([]);
  cartoesAtivos = signal<DetalhesCartao[]>([]);

  ngOnInit(): void {
    this.form = new FormGroup<CadastroLancamentoForm>({
      categoriaId: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      descricao: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      data: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      valor: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      tipo: new FormControl<TipoLancamento | ''>('', { nonNullable: true, validators: Validators.required }),
      cartaoId: new FormControl<string>('', { nonNullable: true }),
    });
    this.inicializarDropDowns();
  }


  inicializarDropDowns() {
    forkJoin({
      categorias: this.service.listarCategoriaDisponiveis(),
      cartoes: this.service.listarCartoesDisponiveis()
    }).subscribe({
      next: (resultado) => {
        this.categoriasAtivas.set(resultado.categorias);
        this.cartoesAtivos.set(resultado.cartoes);
      },
      error: () => this.toast.error('Erro ao carregar categorias e cartões.')
    })
  }

  isDespesa(): boolean {
    return this.form.controls.tipo.value === 'DESPESA';
  }

  handleTipoChange(): void {
    if (!this.isDespesa()) {
      this.form.controls.cartaoId.setValue('');
      this.form.controls.cartaoId.setErrors(null);
    }
  }

  isFormInvalid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Erro de Validação. Verifique os valores informados!', 'Erro');
      return true;
    }
    return false;
  }


  handleSubmit() {
    if (this.isFormInvalid()) {
      return;
    }

    const dados = this.form.value as DadosLancamentoForm;
    dados.valor = this.parseValor(dados.valor);
    dados.cartaoId = dados.cartaoId || null;
    this.service.criar(dados).subscribe({
      next: () => {
        this.toast.success('Lançamento cadastrado com sucesso!', 'Sucesso');
        this.salvo.emit();
      },
      error: (error) => this.onApiError(error)
    })
  }

  private aplicarErrosValidacao(error: ValidationErroResponse) {
    error.camposInvalidos.forEach(ci => {
      const control = this.form.get(ci.campo);
      if (control) {
        control.setErrors({ apiError: ci.erro });
        control.markAsTouched();
      }
    })
  }

  private onApiError(error: any): void {
    if (error.status === 422 && error.error) {
      const validationError: ValidationErroResponse = error.error;
      this.aplicarErrosValidacao(validationError);
      validationError.camposInvalidos.forEach(ci => {
        this.toast.error(`${ci.campo}: ${ci.erro}`, 'Erro de Validação');
      });
      return;
    } else {
      this.toast.error('Erro ao Processar a Requisição!', 'Erro');
      console.error(error.error)
    }
  }

  private parseValor(valorMascarado: string) : string {
      if(!valorMascarado){
        return '';
      }

      const valorNormalizado = valorMascarado.replace(/\./g, '').replace(',', '.');
      return valorNormalizado;
  }
}


