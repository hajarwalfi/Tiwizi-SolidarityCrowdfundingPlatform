import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SetupIntentResponse {
  clientSecret: string;
  customerId: string;
}

export interface SavedCardResponse {
  paymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentApiService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /** Create a SetupIntent to save a card for future payments */
  createSetupIntent(): Observable<SetupIntentResponse> {
    return this.http.post<SetupIntentResponse>(`${this.baseUrl}/setup-intent`, {});
  }

  /** Get the user's saved card info - returns null if no card saved (204 NO_CONTENT) */
  getSavedCard(): Observable<SavedCardResponse | null> {
    return this.http.get<SavedCardResponse>(`${this.baseUrl}/saved-card`).pipe(
      catchError((error) => {
        // 204 NO_CONTENT is normal when no card exists - treat as null
        if (error.status === 204) {
          return of(null);
        }
        // For 404 or other errors, also treat as no card
        if (error.status === 404) {
          return of(null);
        }
        // For actual errors, throw
        return throwError(() => error);
      }),
    );
  }

  /** Delete/detach the user's saved card */
  deleteSavedCard(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/saved-card`);
  }

  /** Verify a payment intent and update donation status */
  verifyPayment(transactionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/verify/${transactionId}`);
  }

  /** Attach a payment method to the user's Stripe customer to save it for future payments */
  attachPaymentMethod(paymentMethodId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/attach-payment-method`, { paymentMethodId });
  }

  /** Update a PaymentIntent with setup_future_usage=off_session BEFORE confirming, so Stripe saves the card */
  enableFutureUsage(paymentIntentId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/enable-future-usage`, { paymentIntentId });
  }
}
