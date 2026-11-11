import { Routes } from '@angular/router';
import { PlanejamentoPage } from './pages/planejamento/planejamento';
import { CadastroOrcamento } from './pages/cadastro-orcamento/cadastro-orcamento';

export const PLANEJAMENTO_ROUTES: Routes = [
    {
        path: 'planejamento',
        component: PlanejamentoPage
    },
    {
        // ?categoriaId=...&limite=... preenche o formulário para alterar um limite existente
        path: 'planejamento/orcamento',
        component: CadastroOrcamento
    },
    {
        // Nova meta e edição de meta viraram modal no Planejamento; os endereços antigos levam para lá
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
