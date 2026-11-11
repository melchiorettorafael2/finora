import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'escuro' | 'claro';

const CHAVE_TEMA = 'finora_tema';
// Preferência de menu recolhido, que deixou de existir (o menu agora expande ao passar o mouse)
const CHAVE_MENU_ANTIGA = 'finora_menu_recolhido';

/**
 * Preferências visuais do usuário, guardadas no navegador para continuarem
 * iguais ao recarregar a página ou entrar de novo.
 */
@Injectable({
  providedIn: 'root',
})
export class PreferenciasService {

  readonly tema = signal<Tema>(this.ler(CHAVE_TEMA) === 'claro' ? 'claro' : 'escuro');

  constructor() {
    this.remover(CHAVE_MENU_ANTIGA);
    effect(() => this.gravar(CHAVE_TEMA, this.tema()));
  }

  alternarTema(): void {
    this.tema.update(tema => (tema === 'claro' ? 'escuro' : 'claro'));
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

  private remover(chave: string): void {
    try {
      localStorage.removeItem(chave);
    } catch {
      // nada a limpar
    }
  }
}
