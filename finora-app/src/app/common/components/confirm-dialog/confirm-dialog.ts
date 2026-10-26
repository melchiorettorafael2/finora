import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  titulo = input.required<string>();
  mensagem = input.required<string>();
  destaque = input<string>('');
  aviso = input<string>('');
  textoConfirmar = input<string>('Confirmar');
  textoCancelar = input<string>('Cancelar');
  icone = input<string>('fa-trash');
  confirmar = output<void>();
  cancelar = output<void>();

  @HostListener('document:keydown.escape')
  aoPressionarEsc(){
    this.cancelar.emit();
  }
}
