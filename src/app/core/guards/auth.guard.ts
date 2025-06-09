import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      return true; // User is authenticated
    } else {
      return router.createUrlTree(['/auth/sign-in']); // User is not authenticated, redirect to sign-in
    }
  } catch (error) {
    console.error('AuthGuard: Error checking authentication status', error);
    return router.createUrlTree(['/auth/sign-in']); // Handle errors by redirecting to sign-in
  }
};
