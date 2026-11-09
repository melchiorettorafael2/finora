import { Routes } from '@angular/router';
import { Configuracoes } from './pages/configuracoes/configuracoes';

export const USUARIO_ROUTES: Routes = [
    {
        path: 'configuracoes',
        component: Configuracoes
    },
    {
        // Carregada sob demanda: assim a lib de QR code fica fora do bundle inicial
        path: 'configuracoes/dois-fatores',
        loadComponent: () => import('./pages/dois-fatores/dois-fatores').then(m => m.DoisFatores)
    }
];
