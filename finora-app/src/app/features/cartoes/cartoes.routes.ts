import { Routes } from '@angular/router';
import { ListagemCartoes } from './pages/listagem-cartoes/listagem-cartoes';

export const CARTOES_ROUTES: Routes = [
    {
        // O cadastro virou modal na listagem; o endereço antigo leva para lá
        path: 'cadastro-cartoes',
        redirectTo: 'listagem-cartoes',
        pathMatch: 'full'
    },
    {
        path: 'listagem-cartoes',
        component: ListagemCartoes
    }
];
