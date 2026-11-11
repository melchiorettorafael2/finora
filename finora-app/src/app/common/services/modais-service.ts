import { Injectable, signal } from '@angular/core';

/**
 * Modais globais do app (abertos de qualquer tela). Hoje: Configurações, que pode ser aberta
 * pelo menu lateral e pelo menu do usuário no header. O modal é desenhado no layout (Template).
 */
@Injectable({
  providedIn: 'root',
})
export class ModaisService {

  readonly configuracoesAberta = signal(false);

  abrirConfiguracoes(): void {
    this.configuracoesAberta.set(true);
  }

  fecharConfiguracoes(): void {
    this.configuracoesAberta.set(false);
  }
}
