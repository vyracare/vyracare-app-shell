import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  debugger;
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Se não estiver logado, redireciona para login
    router.navigate(['/login']);
    return false;
  }
};
