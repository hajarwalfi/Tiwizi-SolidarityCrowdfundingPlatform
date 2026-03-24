import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserProfile } from './auth.service';
import { TokenUtility } from '../utils/token.utility';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: UserProfile = {
    id: 'user-1',
    email: 'user@tiwizi.com',
    fullName: 'Youssef Hajji',
    firstName: 'Youssef',
    lastName: 'Hajji',
    profilePictureUrl: '',
    role: 'USER',
    createdAt: '2026-01-01T00:00:00',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, TokenUtility],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    // Flush any HTTP calls triggered by the constructor (refresh / loadCurrentUser)
    httpMock.match(() => true).forEach(r => r.flush(null, { status: 401, statusText: 'Unauthorized' }));
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── initial state ────────────────────────────────────────────────────────

  it('should be unauthenticated on startup when no token is stored', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('getToken should return null when nothing is stored', () => {
    expect(service.getToken()).toBeNull();
  });

  // ── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should POST to /api/auth/login with credentials', () => {
      service.login('user@tiwizi.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'user@tiwizi.com', password: 'password123' });
      req.flush({ accessToken: 'a.b.c', refreshToken: 'r.b.c' });

      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(mockUser);
    });

    it('should store accessToken in localStorage on success', () => {
      service.login('user@tiwizi.com', 'password123').subscribe();

      httpMock.expectOne(`${environment.apiUrl}/auth/login`)
        .flush({ accessToken: 'access.token', refreshToken: 'refresh.token' });
      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(mockUser);

      expect(localStorage.getItem('auth_token')).toBe('access.token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh.token');
    });

    it('should mark isAuthenticated as true on success', () => {
      service.login('user@tiwizi.com', 'password123').subscribe();

      httpMock.expectOne(`${environment.apiUrl}/auth/login`)
        .flush({ accessToken: 'a.b.c', refreshToken: 'r.b.c' });
      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(mockUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should clear auth state and rethrow on 401', () => {
      let errorCaught = false;
      service.login('user@tiwizi.com', 'wrong').subscribe({
        error: () => (errorCaught = true),
      });

      httpMock.expectOne(`${environment.apiUrl}/auth/login`)
        .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorCaught).toBe(true);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should POST to /api/auth/logout', () => {
      service.logout();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should clear tokens from localStorage after logout', () => {
      localStorage.setItem('auth_token', 'some-token');
      localStorage.setItem('refresh_token', 'some-refresh');

      service.logout();
      httpMock.expectOne(`${environment.apiUrl}/auth/logout`).flush({});

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  // ── isAuthenticated$ observable ──────────────────────────────────────────

  describe('isAuthenticated$', () => {
    it('should emit false initially', async () => {
      const v = await firstValueFrom(service.isAuthenticated$);
      expect(v).toBe(false);
    });
  });

  // ── currentUser$ observable ──────────────────────────────────────────────

  describe('currentUser$', () => {
    it('should emit null initially', async () => {
      const user = await firstValueFrom(service.currentUser$);
      expect(user).toBeNull();
    });
  });
});
