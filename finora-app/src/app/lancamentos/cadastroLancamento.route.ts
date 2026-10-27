import { Routes } from '@angular/router';
import { CadastroLancamento } from './cadastro-lancamento/cadastro-lancamento';

export const CADASTROLANCAMENTO_ROUTES: Routes = [
    {
        path: 'cadastro-lancamentos',
        component: CadastroLancamento
    }
];