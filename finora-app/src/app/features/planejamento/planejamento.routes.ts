import { Routes } from '@angular/router';
import { PlanejamentoPage } from './pages/planejamento/planejamento';
import { CadastroOrcamento } from './pages/cadastro-orcamento/cadastro-orcamento';
import { CadastroMeta } from './pages/cadastro-meta/cadastro-meta';

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
        path: 'planejamento/metas/nova',
        component: CadastroMeta
    },
    {
        path: 'planejamento/metas/:id',
        component: CadastroMeta
    }
];
