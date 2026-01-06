import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // HTTP error
      if (!navigator.onLine) {
        console.error('No Internet Connection');
        // Could show a toast notification here
      } else {
        // Server error
        const message = this.getErrorMessage(error);
        console.error(`HTTP Error: ${error.status} - ${message}`);
        // Could show a toast notification here
      }
    } else {
      // Client-side error
      console.error('Client Error:', error);
      // Could show a toast notification here
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.error) {
      return error.error.error;
    }
    if (error.message) {
      return error.message;
    }
    return `An error occurred: ${error.status} ${error.statusText}`;
  }
}

