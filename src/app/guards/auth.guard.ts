import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Pas de token → connexion automatique avec le compte admin
  return authService.autoLogin().pipe(
    map(() => true),
    catchError(() => of(false))
  );
};
