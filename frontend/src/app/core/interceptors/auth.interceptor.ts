import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TokenUtility } from '../utils/token.utility';

const TOKEN_KEY = 'auth_token';

// List of endpoints where 401 errors are expected (user not authenticated)
const EXPECTED_401_ENDPOINTS = [
  '/auth/me',
  '/user/profile'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenUtility = inject(TokenUtility);

  // Only intercept requests to our API
  if (req.url.startsWith(environment.apiUrl)) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && !tokenUtility.isTokenExpired(token)) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Suppress console errors for expected auth errors (401, 404)
          if ((error.status === 401 || error.status === 404) && isExpected401Endpoint(req.url)) {
            // This is expected - user not authenticated or endpoint requires auth
            return throwError(() => error);
          }
          return throwError(() => error);
        })
      );
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Suppress console errors for expected auth errors (401, 404) on protected endpoints
      if ((error.status === 401 || error.status === 404) && isExpected401Endpoint(req.url)) {
        // This is expected - user not authenticated or endpoint requires auth
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};

function isExpected401Endpoint(url: string): boolean {
  return EXPECTED_401_ENDPOINTS.some(endpoint => url.includes(endpoint));
}
