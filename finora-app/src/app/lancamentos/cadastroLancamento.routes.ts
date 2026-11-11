import { Routes } from '@angular/router';

export const CADASTROLANCAMENTO_ROUTES: Routes = [
    {
        // O cadastro virou modal (listagem e dashboard); o endereço antigo leva para a listagem
        path: 'cadastro-lancamentos',
        redirectTo: 'listagem-lancamentos',
        pathMatch: 'full'
    }
];
