import { Routes } from '@angular/router';
import { Template } from './layout/template/template';
import { CARTOES_ROUTES } from './features/cartoes/cartoes.routes';

export const routes: Routes = [
    {
        path: 'paginas',
        component: Template,
        children: [
            ...CARTOES_ROUTES
        ]
    }
];
