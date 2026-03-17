import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { TokenUtility } from '../utils/token.utility';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
  role: string;
  createdAt: string;
}

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenUtility: TokenUtility,
  ) {
    const token = this.getToken();
    if (token && !this.tokenUtility.isTokenExpired(token)) {
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser().subscribe();
    } else if (token) {
      this.tryRefreshToken();
    }
  }

  private get backendBaseUrl(): string {
    return environment.apiUrl.replace('/api', '');
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && !this.tokenUtility.isTokenExpired(token);
  }

  login(email: string, password: string): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((tokens) => {
          this.setToken(tokens.accessToken);
          this.setRefreshToken(tokens.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap((tokens) => this.loadCurrentUser().pipe(switchMap(() => of(tokens)))),
        catchError((error) => {
          this.clearAuthState();
          throw error;
        }),
      );
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((tokens) => {
        this.setToken(tokens.accessToken);
        this.setRefreshToken(tokens.refreshToken);
        this.isAuthenticatedSubject.next(true);
      }),
      switchMap((tokens) => this.loadCurrentUser().pipe(switchMap(() => of(tokens)))),
      catchError((error) => {
        this.clearAuthState();
        throw error;
      }),
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.backendBaseUrl}/oauth2/authorization/google`;
  }

  linkWithGoogle(): void {
    window.location.href = `${this.backendBaseUrl}/oauth2/authorization/google?action=link`;
  }

  exchangeCodeForTokens(code: string): Observable<UserProfile | null> {
    return this.http.post<AuthTokenResponse>(`${environment.apiUrl}/auth/exchange`, { code }).pipe(
      tap((tokens) => {
        this.setToken(tokens.accessToken);
        this.setRefreshToken(tokens.refreshToken);
        this.isAuthenticatedSubject.next(true);
      }),
      switchMap(() => this.loadCurrentUser()),
      catchError((error) => {
        console.error('Code exchange failed:', error);
        this.clearTokens();
        this.isAuthenticatedSubject.next(false);
        return of(null);
      }),
    );
  }

  tryRefreshToken(): void {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken || this.tokenUtility.isTokenExpired(refreshToken)) {
      this.clearAuthState();
      return;
    }

    this.http
      .post<AuthTokenResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((tokens) => {
          this.setToken(tokens.accessToken);
          this.setRefreshToken(tokens.refreshToken);
          this.isAuthenticatedSubject.next(true);
        }),
        switchMap(() => this.loadCurrentUser()),
        catchError((error) => {
          // Expected if refresh token is invalid or expired
          if (error.status !== 401 && error.status !== 403) {
            console.error('Unexpected error refreshing token:', error);
          }
          this.clearAuthState();
          return of(null);
        }),
      )
      .subscribe();
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.clearTokens();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        window.location.href = '/';
      });
  }

  loadCurrentUser(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        if (error.status === 401) {
          // Expected - user not authenticated or token expired
          this.clearAuthState();
        } else {
          // Unexpected error - log it
          console.error('Unexpected error loading user profile:', error);
        }
        return of(null);
      }),
    );
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private clearAuthState(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
