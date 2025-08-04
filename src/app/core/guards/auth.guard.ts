import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth/auth';
import { lastValueFrom } from 'rxjs';

/**
 * Authentication guard that protects routes from unauthorized access
 * Optimized with caching and better error handling
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  // Create URL tree once for better performance
  const signInUrlTree = router.createUrlTree(['/auth/sign-in']);
  
  // Use a static cache for the last authentication result to avoid repeated API calls
  // within a short time period (useful for route changes)
  if ((authGuard as any).cachedResult && (authGuard as any).cacheExpiry > Date.now()) {
    return (authGuard as any).cachedResult;
  }

  try {
    // Use the observable pattern for better performance
    const currentUser = await lastValueFrom(authService.getCurrentUserObservable());
    
    const result = currentUser ? true : signInUrlTree;
    
    // Cache the result for 10 seconds
    (authGuard as any).cachedResult = result;
    (authGuard as any).cacheExpiry = Date.now() + 10000; // 10 seconds cache
    
    return result;
  } catch (error) {
    console.error('AuthGuard: Error checking authentication status', error);
    return signInUrlTree; // Handle errors by redirecting to sign-in
  }
};
