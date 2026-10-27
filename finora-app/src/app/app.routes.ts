import { Routes } from '@angular/router';
import { Template } from './layout/template/template';
import { CARTOES_ROUTES } from './features/cartoes/cartoes.routes';
import { CATEGORIAS_ROUTES } from './features/categorias/categorias.routes';
import { CADASTROLANCAMENTO_ROUTES } from './lancamentos/cadastroLancamento.route';

export const routes: Routes = [
    {
        path: 'paginas',
        component: Template,
        children: [
            ...CARTOES_ROUTES,
            ...CATEGORIAS_ROUTES, 
            ...CADASTROLANCAMENTO_ROUTES
        ]
    }
];
