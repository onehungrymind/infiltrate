import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { formatErrorMessage } from '../utils/error-messages';

/**
 * HTTP Error Interceptor
 * Formats API error responses for consistent error handling
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = formatErrorMessage(error);
      
      // Create a formatted error object
      const formattedError = {
        ...error,
        formattedMessage: errorMessage,
        timestamp: new Date().toISOString(),
      };
      
      return throwError(() => formattedError);
    })
  );
};

