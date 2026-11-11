import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'escuro' | 'claro';

const CHAVE_TEMA = 'finora_tema';
const CHAVE_MENU = 'finora_menu_recolhido';

/**
 * Preferências visuais do usuário (tema e menu lateral recolhido), guardadas no
 * navegador para continuarem iguais ao recarregar a página ou entrar de novo.
 */
@Injectable({
  providedIn: 'root',
})
export class PreferenciasService {

  readonly tema = signal<Tema>(this.ler(CHAVE_TEMA) === 'claro' ? 'claro' : 'escuro');
  readonly menuRecolhido = signal(this.ler(CHAVE_MENU) === 'true');

  constructor() {
    effect(() => this.gravar(CHAVE_TEMA, this.tema()));
    effect(() => this.gravar(CHAVE_MENU, String(this.menuRecolhido())));
  }

  alternarTema(): void {
    this.tema.update(tema => (tema === 'claro' ? 'escuro' : 'claro'));
  }

  alternarMenu(): void {
    this.menuRecolhido.update(recolhido => !recolhido);
  }

  // localStorage pode estar indisponível (aba anônima, bloqueio de cookies): aí só não persiste
  private ler(chave: string): string | null {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  private gravar(chave: string, valor: string): void {
    try {
      localStorage.setItem(chave, valor);
    } catch {
      // segue funcionando sem guardar a preferência
    }
  }
}
