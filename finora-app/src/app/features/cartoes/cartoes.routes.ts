import { Routes } from '@angular/router';
import { CadastroCartao } from './pages/cadastro-cartao/cadastro-cartao';
import { ListagemCartoes } from './pages/listagem-cartoes/listagem-cartoes';

export const CARTOES_ROUTES: Routes = [
    {
        path: 'cadastro-cartoes',
        component: CadastroCartao
    },
    {
        path: 'listagem-cartoes',
        component: ListagemCartoes
    }
];
