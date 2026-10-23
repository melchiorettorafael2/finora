import { Routes } from '@angular/router';
import { CadastroCategoria } from './pages/cadastro-categoria/cadastro-categoria';
import { ListagemCategorias } from './pages/listagem-categorias/listagem-categorias';

export const CATEGORIAS_ROUTES: Routes = [
    {
        path: 'cadastro-categorias',
        component: CadastroCategoria
    },
    {
        path: 'listagem-categorias',
        component: ListagemCategorias
    }
];


