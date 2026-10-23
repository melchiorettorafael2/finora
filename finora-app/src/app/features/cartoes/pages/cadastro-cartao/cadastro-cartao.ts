import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartaoService } from '../../services/cartao-service';
import { DadosCartaoForm, DetalhesCartao } from '../../models/dados-cartao';
import { ValidationErroResponse } from '../../../../shared/models/validation-error-models';
import {CommonModule} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Header } from '../../../../common/components/header/header';

interface CadastroCartaoForm{
  nome: FormControl<string>;
  bandeira: FormControl<string>;
}

@Component({
  selector: 'app-cadastro-cartao',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './cadastro-cartao.html',
  styleUrl: './cadastro-cartao.scss',

})
export class CadastroCartao {

  form!: FormGroup<CadastroCartaoForm>;
  rotaAtiva = inject(ActivatedRoute);
  router = inject(Router);
  service = inject(CartaoService);
  toast = inject(ToastrService);
  idCartaoParaEdicao?: string | null;


  ngOnInit(): void {
    this.form = new FormGroup<CadastroCartaoForm>({
      nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
      bandeira: new FormControl('', { nonNullable: true, validators: Validators.required }),
    });

    this.carregarDadosParaEdicao();
  }

  carregarDadosParaEdicao() {
    this.idCartaoParaEdicao = this.rotaAtiva.snapshot.queryParamMap.get('id') || undefined;

    if(!this.idCartaoParaEdicao){
      return;
    }

    this.service.obterPorId(this.idCartaoParaEdicao).subscribe({
      next: (cartao) => {
        this.form.patchValue({
          nome: cartao.nome,
          bandeira: cartao.bandeira
        });
      },
      error: (error) => {
        this.toast.error('Erro ao carregar dados do cartão para edição!', 'Erro');
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
    const dadosCartao : DadosCartaoForm = this.form.value as DadosCartaoForm;

    const requisicao: Observable<DetalhesCartao | void> = this.idCartaoParaEdicao
      ? this.service.atualizar(this.idCartaoParaEdicao, dadosCartao)
      : this.service.criar(dadosCartao);

    requisicao
      .subscribe({
        next: (response: DetalhesCartao | void) => { 
          console.log('Cartão criado com sucesso:', response);
          this.toast.success('Cartão cadastrado/atualizado com sucesso!', 'Sucesso');
          this.form.reset();
          this.idCartaoParaEdicao = null;
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