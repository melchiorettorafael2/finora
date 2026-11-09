import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth-service/auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor : HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Rotas públicas da API (/auth/**: login, cadastro, 2FA, redefinir senha): não levam token
    const ehRequisicaoDeAutenticacao = request.url.includes('/auth/');

    if(!ehRequisicaoDeAutenticacao && authService.isTokenExpired()) {
        authService.logout(false);
        router.navigate(['/login']);
        return throwError(() => new Error('Token expirado. Redirecionando para a página de login.') );
    }

    const token = authService.getToken();
    const requestModificada = !ehRequisicaoDeAutenticacao && token ? request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    }) : request;   

    return next(requestModificada).pipe(catchError((erro) => {
        if(erro.status === 401 && !ehRequisicaoDeAutenticacao) {
            authService.logout(false);
            router.navigate(['/login']);
        } 
        return throwError(() => erro);
    }));
} 