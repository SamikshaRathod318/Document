import { inject } from '@angular/core';
import { CanActivateFn, Router, type UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the required roles from the route data
  const requiredRoles = (route.data?.['roles'] as string[] | undefined)?.map(r => r?.toString().trim().toLowerCase()) as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement, allow access
  }
  
  // Check if user has any of the required roles
  return authService.currentUser$.pipe(
    map(user => {
      console.log('=== ROLE GUARD DEBUG ===');
      console.log('Role Guard - Current user:', user);
      console.log('Role Guard - Required roles:', requiredRoles);
      console.log('Role Guard - User roles:', user?.roles);
      console.log('Role Guard - User activeRole:', user?.activeRole);
      
      if (user) {
        // Check both roles array and activeRole
        const userRolesNormalized = (user.roles || []).map(r => r?.toString().trim().toLowerCase());
        const activeRoleNorm = user.activeRole?.toString().trim().toLowerCase();
        const hasRequiredRole = requiredRoles.some(role => {
          const roleMatch = userRolesNormalized.includes(role) || activeRoleNorm === role;
          console.log(`Checking role '${role}': ${roleMatch}`);
          return roleMatch;
        });
        
        if (hasRequiredRole) {
          console.log('Role Guard - Access granted!');
          return true;
        }
      }
      
      // Redirect to unauthorized page without alert popup
      console.log('Role Guard - Access denied, redirecting to unauthorized');
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
