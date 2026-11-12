import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
})
export class Template {
  preferencias = inject(PreferenciasService);
  modais = inject(ModaisService);
  private authService = inject(AuthService);

  anoAtual = new Date().getFullYear();

  constructor() {
    // Com Configurações aberta o menu continua clicável: ir para outra página fecha esses modais
    inject(Router).events.pipe(
      filter(evento => evento instanceof NavigationStart),
      takeUntilDestroyed(inject(DestroyRef)),
    ).subscribe(() => {
      this.modais.fecharConfiguracoes();
      this.modais.fecharDoisFatores();
    });
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

  sair(): void {
    this.modais.fecharConfiguracoes();
    this.modais.fecharDoisFatores();
    this.authService.logout();
  }
}
