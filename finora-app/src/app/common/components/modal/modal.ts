import { AfterViewInit, Component, ElementRef, inject, input, output } from '@angular/core';

/**
 * Janela modal reutilizável: fundo escurecido, cabeçalho com ícone, título e o botão X
 * para fechar. O conteúdo (formulário, configurações...) entra por <ng-content>.
 * Fecha pelo X ou pela tecla Esc; clicar fora não fecha, para não perder um formulário pela metade.
 */
@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  host: {
    '(document:keydown.escape)': 'fechar.emit()',
    '(mousedown)': 'manterFocoNoCampo($event)',
  },
})
export class Modal implements AfterViewInit {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  icone = input<string>('fa-pen');
  largura = input<'normal' | 'media' | 'grande'>('normal');
  fechar = output<void>();

  private elementRef = inject(ElementRef<HTMLElement>);

  /**
   * Ao pressionar o X, Cancelar (ou outro botão comum do modal), o campo em foco perdia o foco
   * antes do clique terminar: o Angular o marcava como "tocado" e o alerta de "obrigatório"
   * aparecia enquanto o modal fechava. Impedir a troca de foco no mousedown evita isso;
   * o clique continua funcionando normalmente. O botão Salvar (submit) não entra aqui.
   */
  manterFocoNoCampo(evento: MouseEvent): void {
    const alvo = evento.target as HTMLElement | null;
    if (alvo?.closest('button[type="button"]')) {
      evento.preventDefault();
    }
  }

  // Leva o foco para o primeiro campo do formulário ao abrir
  ngAfterViewInit(): void {
    setTimeout(() => {
      const campo = this.elementRef.nativeElement.querySelector(
        '.modal-corpo input:not([disabled]), .modal-corpo select, .modal-corpo textarea'
      ) as HTMLElement | null;
      (campo ?? this.elementRef.nativeElement.querySelector('.modal-fechar'))?.focus();
    });
  }
}
