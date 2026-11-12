import { AbstractControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ValidationErroResponse } from '../models/validation-error-models';

/** "1.234,56" (máscara do ngx-mask) -> "1234.56" (formato aceito pela API) */
export function valorParaApi(valorMascarado: string): string {
  return valorMascarado ? valorMascarado.replace(/\./g, '').replace(',', '.') : '';
}

/** 1234.5 (valor vindo da API) -> "1234,50" (texto que o ngx-mask exibe como "1.234,50") */
export function valorParaMascara(valor: number | null | undefined): string {
  return valor == null ? '' : valor.toFixed(2).replace('.', ',');
}

/** Valida o formulário no submit: marca os campos e avisa o usuário. */
export function formularioInvalido(form: FormGroup, toast: ToastrService): boolean {
  if (form.invalid) {
    form.markAllAsTouched();
    toast.error('Confira os campos destacados.', 'Erro');
    return true;
  }
  return false;
}

/** Erro 422 da API: mostra a mensagem de cada campo no próprio campo e em um toast. */
export function tratarErroApi(error: any, form: FormGroup, toast: ToastrService): void {
  if (error.status === 422 && error.error?.camposInvalidos) {
    const validacao: ValidationErroResponse = error.error;
    validacao.camposInvalidos.forEach(ci => {
      const control: AbstractControl | null = form.get(ci.campo);
      if (control) {
        control.setErrors({ apiError: ci.erro });
        control.markAsTouched();
      }
      toast.error(ci.erro, 'Erro');
    });
    return;
  }
  toast.error('Algo deu errado. Tente de novo.', 'Erro');
  console.error(error);
}
