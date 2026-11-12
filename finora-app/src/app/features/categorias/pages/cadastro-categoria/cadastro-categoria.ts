import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria-service';
import { DadosCategoriaForm, DetalhesCategoria } from '../../models/dados-categoria';
import { ValidationErroResponse } from '../../../../shared/models/validation-error-models';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ICONES_CATEGORIA, ICONE_CATEGORIA_PADRAO } from '../../models/icones-categoria';

interface CadastroCategoriaForm{
  nome: FormControl<string>;
  icone: FormControl<string>;
}

/** Formulário de categoria, aberto em modal pela listagem. */
@Component({
  selector: 'app-cadastro-categoria',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-categoria.html',
  styleUrl: './cadastro-categoria.scss',

})
export class CadastroCategoria implements OnInit {

  /** Id da categoria a editar; vazio para uma categoria nova */
  idCategoria = input<string | null>(null);
  salvo = output<void>();
  cancelado = output<void>();

  form!: FormGroup<CadastroCategoriaForm>;
  service = inject(CategoriaService);
  toast = inject(ToastrService);
  readonly icones = ICONES_CATEGORIA;


  ngOnInit(): void {
    this.form = new FormGroup<CadastroCategoriaForm>({
      nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
      icone: new FormControl(ICONE_CATEGORIA_PADRAO, { nonNullable: true }),
    });

    this.carregarDadosParaEdicao();
  }

  carregarDadosParaEdicao() {
    const id = this.idCategoria();
    if(!id){
      return;
    }

    this.service.obterPorId(id).subscribe({
      next: (categoria) => {
        this.form.patchValue({
          nome: categoria.nome,
          icone: categoria.icone || ICONE_CATEGORIA_PADRAO,
        });
      },
      error: (error) => {
        this.toast.error('Não foi possível abrir a categoria.', 'Erro');
        console.error(error);
      }
    });
  }

  escolherIcone(classe: string): void {
    this.form.controls.icone.setValue(classe);
  }

  isFormInvalid() : boolean {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.toast.error('Confira os campos destacados.', 'Erro');
      return true;
     }
    return false;
  }

  handleSubmit() {
    if(this.isFormInvalid()){
      return;
    }

    const dadosCategoria : DadosCategoriaForm = this.form.value as DadosCategoriaForm;

    const id = this.idCategoria();
    const requisicao: Observable<DetalhesCategoria | void> = id
      ? this.service.atualizar(id, dadosCategoria)
      : this.service.criar(dadosCategoria);

    requisicao
      .subscribe({
        next: () => {
          this.toast.success(id ? 'Categoria atualizada.' : 'Categoria cadastrada.', 'Sucesso');
          this.salvo.emit();
      },
        error: (error) => this.onApiError(error)

      });
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

  private onApiError(error: any) : void {
    if (error.status === 422 && error.error) {
      const validationError: ValidationErroResponse = error.error;
      this.aplicarErrosValidacao(validationError);
      validationError.camposInvalidos.forEach(ci => {
        this.toast.error(ci.erro, 'Erro');
      });
      return;
    } else {
      this.toast.error('Algo deu errado. Tente de novo.', 'Erro');
      console.error(error.error)
    }
  }
}
