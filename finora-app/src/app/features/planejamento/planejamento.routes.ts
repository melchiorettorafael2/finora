import { Routes } from '@angular/router';
import { PlanejamentoPage } from './pages/planejamento/planejamento';

export const PLANEJAMENTO_ROUTES: Routes = [
    {
        path: 'planejamento',
        component: PlanejamentoPage
    },
    {
        // Orçamento, nova meta e edição de meta viraram modais no Planejamento; os endereços antigos levam para lá
        path: 'planejamento/orcamento',
        redirectTo: 'planejamento',
        pathMatch: 'full'
    },
    {
        path: 'planejamento/metas/nova',
        redirectTo: 'planejamento',
        pathMatch: 'full'
    },
    {
        path: 'planejamento/metas/:id',
        redirectTo: 'planejamento',
        pathMatch: 'full'
    }
];
