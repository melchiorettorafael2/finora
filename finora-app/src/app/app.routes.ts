import { Routes } from '@angular/router';
import { Template } from './layout/template/template';
import { CARTOES_ROUTES } from './features/cartoes/cartoes.routes';
import { CATEGORIAS_ROUTES } from './features/categorias/categorias.routes';
import { CADASTROLANCAMENTO_ROUTES } from './lancamentos/cadastroLancamento.routes';
import { LISTAGEMLANCAMENTO_ROUTES } from './lancamentos/listagem-lancamentos/listagemLancamento.routes';
import { DASHBOARD_ROUTES } from './dashboard/dashboard-page/dashboard-page.routes';
import { INDEX_ROUTES } from './dashboard/dashboard-page/index.routes';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'paginas/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'paginas',
        component: Template,
        children: [
            ...INDEX_ROUTES,
            ...CARTOES_ROUTES,
            ...CATEGORIAS_ROUTES, 
            ...CADASTROLANCAMENTO_ROUTES,
            ...LISTAGEMLANCAMENTO_ROUTES,
            ...DASHBOARD_ROUTES
        ]
    }
];
