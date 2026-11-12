import { Injectable, computed, signal } from '@angular/core';

/**
 * Modais globais do app (abertos de qualquer tela), desenhados no layout (Template):
 * - Configurações: pelo menu lateral e pelo menu do usuário no header;
 * - Verificação em duas etapas: pelo botão "Gerenciar" dentro de Configurações.
 * Um substitui o outro (nunca ficam empilhados).
 */
@Injectable({
  providedIn: 'root',
})
export class ModaisService {

  readonly configuracoesAberta = signal(false);
  readonly doisFatoresAberta = signal(false);
  /** Ação pedida pelo switch de Configurações: o modal do 2FA já abre nela (e limpa o pedido) */
  readonly acaoDoisFatores = signal<'ativar' | 'desativar' | null>(null);

  /** Algum modal da área de Configurações aberto (destaca o item no menu lateral) */
  readonly areaConfiguracoes = computed(() => this.configuracoesAberta() || this.doisFatoresAberta());

  abrirConfiguracoes(): void {
    this.doisFatoresAberta.set(false);
    this.configuracoesAberta.set(true);
  }

  fecharConfiguracoes(): void {
    this.configuracoesAberta.set(false);
  }

  abrirDoisFatores(acao: 'ativar' | 'desativar' | null = null): void {
    this.acaoDoisFatores.set(acao);
    this.configuracoesAberta.set(false);
    this.doisFatoresAberta.set(true);
  }

  fecharDoisFatores(): void {
    this.doisFatoresAberta.set(false);
  }

  voltarParaConfiguracoes(): void {
    this.abrirConfiguracoes();
  }
}
