import { inject } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map, take, type Observable } from 'rxjs';

export const clerkGuard = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Check if user is logged in and has clerk roles (support both adm_* and plain names)
      if (
        user && (
          user.roles?.includes('adm_clerk') ||
          user.roles?.includes('adm_sr_clerk') ||
          user.roles?.includes('clerk') ||
          user.roles?.includes('senior_clerk')
        )
      ) {
        return true;
      }
      
      // Redirect to login if not authenticated
      if (!user) {
        return router.createUrlTree(['/login']);
      }
      
      // Redirect to unauthorized if not a clerk
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
