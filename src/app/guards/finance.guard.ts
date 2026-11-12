import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';

export const FinanceGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasFinanceReadAccess() ? true : inject(Router).createUrlTree(['/dashboard']);
};
