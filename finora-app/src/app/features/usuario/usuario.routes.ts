import { Routes } from '@angular/router';

export const USUARIO_ROUTES: Routes = [
    {
        // Configurações virou modal (menu lateral e menu do usuário); o endereço antigo leva ao dashboard
        path: 'configuracoes',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        // A verificação em duas etapas também virou modal (aberto por Configurações)
        path: 'configuracoes/dois-fatores',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];
