import { Routes } from '@angular/router';
import { ListagemCategorias } from './pages/listagem-categorias/listagem-categorias';

export const CATEGORIAS_ROUTES: Routes = [
    {
        // O cadastro virou modal na listagem; o endereço antigo leva para lá
        path: 'cadastro-categorias',
        redirectTo: 'listagem-categorias',
        pathMatch: 'full'
    },
    {
        path: 'listagem-categorias',
        component: ListagemCategorias
    }
];
