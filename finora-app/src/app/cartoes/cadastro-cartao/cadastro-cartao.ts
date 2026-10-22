import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartaoService } from '../cartao-service';
import { DadosCartaoForm, DetalhesCartao } from '../dados-cartao';
import { ValidationErroResponse } from '../../commons/validation/validation-error-models';
import {CommonModule} from '@angular/common';
import { ToastrService } from 'ngx-toastr';

interface CadastroCartaoForm{
  nome: FormControl<string>;
  bandeira: FormControl<string>;
}

@Component({
  selector: 'app-cadastro-cartao',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-cartao.html',
  styleUrl: './cadastro-cartao.scss',
})
export class CadastroCartao {

  form!: FormGroup<CadastroCartaoForm>;
  service = inject(CartaoService);
  toast = inject(ToastrService);

  ngOnInit(): void {
    this.form = new FormGroup<CadastroCartaoForm>({
      nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
      bandeira: new FormControl('', { nonNullable: true, validators: Validators.required }),
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
    this.service
      .criar(dadosCartao)
      .subscribe({
        next: (response: DetalhesCartao) => { 
          console.log('Cartão criado com sucesso:', response);
          this.toast.success('Cartão cadastrado/atualizado com sucesso!', 'Sucesso');
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