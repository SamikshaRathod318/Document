import { inject } from '@angular/core';
import { CanActivateFn, Router, type UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page with the return URL
  return router.createUrlTree(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
};
