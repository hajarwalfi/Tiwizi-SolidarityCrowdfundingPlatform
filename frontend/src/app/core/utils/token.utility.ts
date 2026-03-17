import { Injectable } from '@angular/core';

export interface DecodedToken {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenUtility {

  /**
   * Decodes a JWT token and returns the payload
   * @param token The JWT token string
   * @returns The decoded token payload or null if invalid
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Checks if a JWT token is expired
   * @param token The JWT token string
   * @returns true if token is expired or invalid, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp * 1000 < Date.now();
  }

  /**
   * Gets the expiration date of a token
   * @param token The JWT token string
   * @returns Date object or null if invalid
   */
  getTokenExpirationDate(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  }

  /**
   * Gets the time remaining until token expiration in milliseconds
   * @param token The JWT token string
   * @returns milliseconds until expiration, or 0 if expired/invalid
   */
  getTokenTimeRemaining(token: string): number {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      return 0;
    }
    const remaining = expirationDate.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}
