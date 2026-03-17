import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Custom global error handler that filters out expected errors
 * from being logged to the console.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Check if this is an HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      // Don't log expected auth errors (401, 404) for authentication endpoints
      if ((error.status === 401 || error.status === 404) && this.isExpectedAuthError(error.url || '')) {
        // Silently ignore - this is expected when user is not authenticated or endpoint requires auth
        return;
      }
    }

    // Check if error was already handled by the auth interceptor
    // (errors that passed through the interceptor but are still expected)
    if (error?.rejection instanceof HttpErrorResponse) {
      const httpError = error.rejection as HttpErrorResponse;
      if ((httpError.status === 401 || httpError.status === 404) && this.isExpectedAuthError(httpError.url || '')) {
        return;
      }
    }

    // For all other errors, log them to console
    console.error('ERROR:', error);
  }

  private isExpectedAuthError(url: string): boolean {
    const expectedEndpoints = [
      '/auth/me',
      '/user/profile',
      '/auth/refresh'
    ];
    return expectedEndpoints.some(endpoint => url.includes(endpoint));
  }
}
