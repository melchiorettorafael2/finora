import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service/auth-service';

/** Só deixa abrir a tela do código quem acabou de passar pela senha (desafio de 2FA válido). */
export const desafioDoisFatoresGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/paginas/dashboard']);
    }
    if (authService.getDesafioDoisFatores()) {
        return true;
    }
    return router.createUrlTree(['/login']);
}
