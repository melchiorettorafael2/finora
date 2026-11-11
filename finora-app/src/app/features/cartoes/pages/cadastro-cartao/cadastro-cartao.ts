import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartaoService } from '../../services/cartao-service';
import { DadosCartaoForm, DetalhesCartao } from '../../models/dados-cartao';
import { ValidationErroResponse } from '../../../../shared/models/validation-error-models';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

interface CadastroCartaoForm{
  nome: FormControl<string>;
  bandeira: FormControl<string>;
}

/** Formulário de cartão, aberto em modal pela listagem (cadastro e edição). */
@Component({
  selector: 'app-cadastro-cartao',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-cartao.html',
  styleUrl: './cadastro-cartao.scss',

})
export class CadastroCartao implements OnInit {

  /** Id do cartão a editar; vazio para um cartão novo */
  idCartao = input<string | null>(null);
  salvo = output<void>();
  cancelado = output<void>();

  form!: FormGroup<CadastroCartaoForm>;
  service = inject(CartaoService);
  toast = inject(ToastrService);


  ngOnInit(): void {
    this.form = new FormGroup<CadastroCartaoForm>({
      nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
      bandeira: new FormControl('', { nonNullable: true, validators: Validators.required }),
    });

    this.carregarDadosParaEdicao();
  }

  carregarDadosParaEdicao() {
    const id = this.idCartao();
    if(!id){
      return;
    }

    this.service.obterPorId(id).subscribe({
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

    const dadosCartao : DadosCartaoForm = this.form.value as DadosCartaoForm;

    const id = this.idCartao();
    const requisicao: Observable<DetalhesCartao | void> = id
      ? this.service.atualizar(id, dadosCartao)
      : this.service.criar(dadosCartao);

    requisicao
      .subscribe({
        next: () => {
          this.toast.success(id ? 'Cartão atualizado com sucesso!' : 'Cartão cadastrado com sucesso!', 'Sucesso');
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
        this.toast.error(`${ci.campo}: ${ci.erro}`, 'Erro de Validação');
      });
      return;
    } else {
      this.toast.error('Erro ao Processar a Requisição!', 'Erro');
      console.error(error.error)
    }
  }
}
