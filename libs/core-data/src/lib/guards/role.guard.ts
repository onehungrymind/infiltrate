import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type UserRole = 'guest' | 'user' | 'mentor' | 'manager' | 'admin';

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  mentor: 2,
  manager: 3,
  admin: 4,
};

export function hasMinimumRole(minimumRole: UserRole): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const user = authService.getCurrentUser();
    const userRole = (user?.role || 'user') as UserRole;

    if (roleHierarchy[userRole] >= roleHierarchy[minimumRole]) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
}

export const adminGuard: CanActivateFn = hasMinimumRole('mentor');
export const studentGuard: CanActivateFn = hasMinimumRole('user');
