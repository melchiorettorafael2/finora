import { Routes } from '@angular/router';
import { Template } from './layout/template/template';
import { CARTOES_ROUTES } from './features/cartoes/cartoes.routes';
import { CATEGORIAS_ROUTES } from './features/categorias/categorias.routes';
import { CADASTROLANCAMENTO_ROUTES } from './lancamentos/cadastroLancamento.routes';
import { LISTAGEMLANCAMENTO_ROUTES } from './lancamentos/listagem-lancamentos/listagemLancamento.routes';
import { DASHBOARD_ROUTES } from './dashboard/dashboard-page/dashboard-page.routes';
import { INDEX_ROUTES } from './dashboard/dashboard-page/index.routes';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth-guard';
import { desafioDoisFatoresGuard } from './auth/desafio-dois-fatores-guard';
import { USUARIO_ROUTES } from './features/usuario/usuario.routes';


export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        // Tela do Google Authenticator: 2ª etapa obrigatória do login/cadastro (código ou QR code).
        // Carregada sob demanda para a lib de QR code não pesar na tela de login
        path: 'verificacao',
        loadComponent: () => import('./auth/verificacao/verificacao').then(m => m.Verificacao),
        canActivate: [desafioDoisFatoresGuard],
    },
    {
        // "Esqueci minha senha": redefine com o código do Google Authenticator
        path: 'recuperar-senha',
        loadComponent: () => import('./auth/recuperar-senha/recuperar-senha').then(m => m.RecuperarSenha),
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'paginas',
        component: Template,
        canActivate: [authGuard],
        children: [
            ...INDEX_ROUTES,
            ...CARTOES_ROUTES,
            ...CATEGORIAS_ROUTES, 
            ...CADASTROLANCAMENTO_ROUTES,
            ...LISTAGEMLANCAMENTO_ROUTES,
            ...DASHBOARD_ROUTES,
            ...USUARIO_ROUTES
        ]
    }
];
