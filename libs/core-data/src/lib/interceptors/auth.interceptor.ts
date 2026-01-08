import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error) => {
      // Only log out on 401 from auth endpoints or if it's a clear authentication failure
      // Don't log out on 401 from other endpoints (might be permission issues)
      if (error.status === 401) {
        const url = req.url;
        // Only handle auth-related endpoints or if there's no token (clear auth failure)
        if (url.includes('/auth/') || !token) {
          // Token is invalid or expired - clear auth state
          localStorage.removeItem('authToken');
          // Only navigate if we're not already on the login page
          if (!router.url.includes('/login')) {
            router.navigate(['/login']);
          }
        }
        // For other 401s, just throw the error (might be permission issues, not auth)
      }
      return throwError(() => error);
    })
  );
};

