import { Routes } from '@angular/router';

export const USUARIO_ROUTES: Routes = [
    {
        // Configurações virou modal (menu lateral e menu do usuário); o endereço antigo leva ao dashboard
        path: 'configuracoes',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        // Carregada sob demanda: assim a lib de QR code fica fora do bundle inicial
        path: 'configuracoes/dois-fatores',
        loadComponent: () => import('./pages/dois-fatores/dois-fatores').then(m => m.DoisFatores)
    }
];
