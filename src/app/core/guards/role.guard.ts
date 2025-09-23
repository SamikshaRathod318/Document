import { inject } from '@angular/core';
import { CanActivateFn, Router, type UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the required roles from the route data
  const requiredRoles = route.data?.['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement, allow access
  }
  
  // Check if user has any of the required roles
  return authService.currentUser$.pipe(
    map(user => {
      if (user && requiredRoles.some(role => user.roles?.includes(role))) {
        return true;
      }
      
      // Redirect to unauthorized or home page
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
