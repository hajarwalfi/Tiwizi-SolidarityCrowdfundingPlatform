import { TokenUtility } from './token.utility';

// Builds a minimal JWT-shaped token: header.payload.signature
// The payload is base64url-encoded JSON with the given fields
function makeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.fakesignature`;
}

describe('TokenUtility', () => {
  let tokenUtility: TokenUtility;

  beforeEach(() => {
    tokenUtility = new TokenUtility();
  });

  // ── decodeToken ──────────────────────────────────────────────────────────

  describe('decodeToken', () => {
    it('should decode a valid token and return the payload', () => {
      const token = makeToken({ sub: 'test@tiwizi.com', exp: 9999999999 });
      const decoded = tokenUtility.decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.['sub']).toBe('test@tiwizi.com');
    });

    it('should return null for a completely invalid token string', () => {
      expect(tokenUtility.decodeToken('not-a-jwt')).toBeNull();
    });

    it('should return null for an empty string', () => {
      expect(tokenUtility.decodeToken('')).toBeNull();
    });

    it('should return null when the payload segment is not valid base64', () => {
      expect(tokenUtility.decodeToken('header.!!!invalid!!!.sig')).toBeNull();
    });
  });

  // ── isTokenExpired ───────────────────────────────────────────────────────

  describe('isTokenExpired', () => {
    it('should return false for a token expiring in the future', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // +1 hour
      const token = makeToken({ sub: 'user@tiwizi.com', exp: futureExp });
      expect(tokenUtility.isTokenExpired(token)).toBe(false);
    });

    it('should return true for a token that expired in the past', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 1; // 1 second ago
      const token = makeToken({ sub: 'user@tiwizi.com', exp: pastExp });
      expect(tokenUtility.isTokenExpired(token)).toBe(true);
    });

    it('should return true when the token has no exp claim', () => {
      const token = makeToken({ sub: 'user@tiwizi.com' });
      expect(tokenUtility.isTokenExpired(token)).toBe(true);
    });

    it('should return true for a completely invalid token', () => {
      expect(tokenUtility.isTokenExpired('garbage')).toBe(true);
    });
  });

  // ── getTokenExpirationDate ───────────────────────────────────────────────

  describe('getTokenExpirationDate', () => {
    it('should return a Date matching the exp claim', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const token = makeToken({ sub: 'user@tiwizi.com', exp });
      const date = tokenUtility.getTokenExpirationDate(token);
      expect(date).not.toBeNull();
      expect(date!.getTime()).toBe(exp * 1000);
    });

    it('should return null for an invalid token', () => {
      expect(tokenUtility.getTokenExpirationDate('bad-token')).toBeNull();
    });
  });

  // ── getTokenTimeRemaining ────────────────────────────────────────────────

  describe('getTokenTimeRemaining', () => {
    it('should return a positive number for a non-expired token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const token = makeToken({ sub: 'user@tiwizi.com', exp });
      expect(tokenUtility.getTokenTimeRemaining(token)).toBeGreaterThan(0);
    });

    it('should return 0 for an expired token', () => {
      const exp = Math.floor(Date.now() / 1000) - 1;
      const token = makeToken({ sub: 'user@tiwizi.com', exp });
      expect(tokenUtility.getTokenTimeRemaining(token)).toBe(0);
    });

    it('should return 0 for an invalid token', () => {
      expect(tokenUtility.getTokenTimeRemaining('invalid')).toBe(0);
    });
  });
});
