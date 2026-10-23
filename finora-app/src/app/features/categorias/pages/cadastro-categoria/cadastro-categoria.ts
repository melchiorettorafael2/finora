import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria-service';
import { DadosCategoriaForm, DetalhesCategoria } from '../../models/dados-categoria';
import { ValidationErroResponse } from '../../../../shared/models/validation-error-models';
import {CommonModule} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Header } from '../../../../common/components/header/header';

interface CadastroCategoriaForm{
  nome: FormControl<string>;
}

@Component({
  selector: 'app-cadastro-categoria',
  imports: [ReactiveFormsModule, RouterLink, Header],
  templateUrl: './cadastro-categoria.html',
  styleUrl: './cadastro-categoria.scss',

})
export class CadastroCategoria {

  form!: FormGroup<CadastroCategoriaForm>;
  rotaAtiva = inject(ActivatedRoute);
  router = inject(Router);
  service = inject(CategoriaService);
  toast = inject(ToastrService);
  idCategoriaParaEdicao?: string | null;


  ngOnInit(): void {
    this.form = new FormGroup<CadastroCategoriaForm>({
      nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
    });

    this.carregarDadosParaEdicao();
  }

  carregarDadosParaEdicao() {
    this.idCategoriaParaEdicao = this.rotaAtiva.snapshot.queryParamMap.get('id') || undefined;

    if(!this.idCategoriaParaEdicao){
      return;
    }

    this.service.obterPorId(this.idCategoriaParaEdicao).subscribe({
      next: (categoria) => {
        this.form.patchValue({
          nome: categoria.nome
        });
      },
      error: (error) => {
        this.toast.error('Erro ao carregar dados da categoria para edição!', 'Erro');
        console.error(error);
      }
    }); 
  }

  isFormInvalid() : boolean {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.toast.error('Erro de Validação. Verifique os valores informados!', 'Erro');
      return true;
     }
    return false;
  }

  handleSubmit() {
    if(this.isFormInvalid()){
      return;
    }

    console.log(this.form.value) 
    const dadosCategoria : DadosCategoriaForm = this.form.value as DadosCategoriaForm;

    const requisicao: Observable<DetalhesCategoria | void> = this.idCategoriaParaEdicao
      ? this.service.atualizar(this.idCategoriaParaEdicao, dadosCategoria)
      : this.service.criar(dadosCategoria);

    requisicao
      .subscribe({
        next: (response: DetalhesCategoria | void) => { 
          console.log('Categoria criada com sucesso:', response);
          this.toast.success('Categoria cadastrada/atualizada com sucesso!', 'Sucesso');
          this.form.reset();
          this.idCategoriaParaEdicao = null;
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
        this.toast.error(`${ci.campo}: ${ci.erro}`, 'Erro de Validação');
      });
      return;
    } else {
      this.toast.error('Erro ao Processar a Requisição!', 'Erro');
      console.error(error.error)
    }
  } 
}