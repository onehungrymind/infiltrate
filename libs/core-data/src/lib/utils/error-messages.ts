import { HttpErrorResponse } from '@angular/common/http';

interface FormattedError {
  formattedMessage?: string;
}

interface ErrorWithMessage {
  message?: string;
  error?: {
    message?: string;
    error?: string | Record<string, unknown>;
  };
}

/**
 * Formats error messages to be user-friendly
 */
export function formatErrorMessage(error: unknown): string {
  // If it's already a formatted error from our interceptor
  if (error && typeof error === 'object' && 'formattedMessage' in error) {
    const formatted = error as FormattedError;
    if (formatted.formattedMessage) {
      return formatted.formattedMessage;
    }
  }

  // If it's an HttpErrorResponse
  if (error instanceof HttpErrorResponse) {
    return formatHttpError(error);
  }

  // If it's a plain error object
  if (error && typeof error === 'object' && 'error' in error) {
    const err = error as ErrorWithMessage;
    if (err.error) {
      if (typeof err.error === 'object' && 'message' in err.error) {
        return String(err.error.message);
      }
      if (typeof err.error === 'object' && 'error' in err.error) {
        return String(err.error.error);
      }
    }
  }

  // If it has a message property
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as ErrorWithMessage;
    if (err.message) {
      return err.message;
    }
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Formats HTTP errors with user-friendly messages
 */
function formatHttpError(error: HttpErrorResponse): string {
  const status = error.status;
  const errorBody = error.error;

  // Try to get message from error body
  if (errorBody?.message) {
    return errorBody.message;
  }

  if (errorBody?.error) {
    // Handle validation errors
    if (typeof errorBody.error === 'object') {
      const validationErrors = Object.values(errorBody.error).flat();
      if (validationErrors.length > 0) {
        return validationErrors.join(', ');
      }
    }
    return errorBody.error;
  }

  // Status code based messages
  switch (status) {
    case 0:
      return 'Unable to connect to the server. Please check your internet connection.';
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may have been modified by another user.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return `An error occurred (${status}). Please try again.`;
  }
}

