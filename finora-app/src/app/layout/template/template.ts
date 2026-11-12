import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PreferenciasService } from '../../common/services/preferencias-service';
import { ModaisService } from '../../common/services/modais-service';
import { Modal } from '../../common/components/modal/modal';
import { Configuracoes } from '../../features/usuario/pages/configuracoes/configuracoes';
import { DoisFatores } from '../../features/usuario/pages/dois-fatores/dois-fatores';
import { AuthService } from '../../auth/auth-service/auth-service';

interface ItemMenu {
  rota: string;
  icone: string;
  rotulo: string;
  exato: boolean; // destaca só na rota exata (senão também nas sub-rotas, ex.: cadastro)
}

@Component({
  selector: 'app-template',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, Modal, Configuracoes, DoisFatores],
  templateUrl: './template.html',
  styleUrl: './template.scss',
  host: {
    '(document:keydown.escape)': 'maisAberto.set(false)',
  },
})
export class Template {
  preferencias = inject(PreferenciasService);
  modais = inject(ModaisService);
  private authService = inject(AuthService);

  anoAtual = new Date().getFullYear();

  private router = inject(Router);
  // URL atual, para destacar "Mais" na barra do celular quando a página está dentro dele
  private urlAtual = signal(this.router.url);
  // Painel "Mais" do celular (desliza de baixo)
  maisAberto = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Com Configurações aberta o menu continua clicável: ir para outra página fecha esses modais
    this.router.events.pipe(
      filter(evento => evento instanceof NavigationStart),
      takeUntilDestroyed(destroyRef),
    ).subscribe(() => {
      this.modais.fecharConfiguracoes();
      this.modais.fecharDoisFatores();
      this.maisAberto.set(false);
    });
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      takeUntilDestroyed(destroyRef),
    ).subscribe(evento => this.urlAtual.set(evento.urlAfterRedirects));
  }

  // Configurações não é rota: abre em modal (botão separado no template)
  itensMenu: ItemMenu[] = [
    { rota: '/paginas/dashboard', icone: 'fa-chart-line', rotulo: 'Dashboard', exato: true },
    { rota: '/paginas/listagem-cartoes', icone: 'fa-credit-card', rotulo: 'Meus Cartões', exato: true },
    { rota: '/paginas/listagem-categorias', icone: 'fa-tags', rotulo: 'Categorias', exato: false },
    { rota: '/paginas/listagem-lancamentos', icone: 'fa-money-bill-transfer', rotulo: 'Lançamentos', exato: false },
    { rota: '/paginas/planejamento', icone: 'fa-calendar-check', rotulo: 'Planejamento', exato: false },
    { rota: '/paginas/relatorios', icone: 'fa-file-lines', rotulo: 'Relatórios', exato: false },
  ];

  // ===== Celular: barra inferior com as 4 telas mais usadas + "Mais" =====
  private readonly rotasBarra = ['/paginas/dashboard', '/paginas/listagem-lancamentos', '/paginas/planejamento', '/paginas/relatorios'];
  itensBarra = this.itensMenu.filter(item => this.rotasBarra.includes(item.rota));
  itensMais = this.itensMenu.filter(item => !this.rotasBarra.includes(item.rota));

  // "Mais" fica destacado quando a tela atual (ou Configurações) está dentro dele
  maisAtivo = computed(() => this.maisAberto() || this.modais.areaConfiguracoes()
    || this.itensMais.some(item => this.urlAtual().startsWith(item.rota)));

  abrirConfiguracoesDoMais(): void {
    this.maisAberto.set(false);
    this.modais.abrirConfiguracoes();
  }

  sair(): void {
    this.maisAberto.set(false);
    this.modais.fecharConfiguracoes();
    this.modais.fecharDoisFatores();
    this.authService.logout();
  }
}
