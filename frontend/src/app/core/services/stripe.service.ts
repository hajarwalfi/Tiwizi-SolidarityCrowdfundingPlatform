import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private stripeInitPromise: Promise<Stripe | null> | null = null;
  private clientSecret: string | null = null;

  // Separate elements/card for setup intent (settings page)
  private setupElements: StripeElements | null = null;
  private setupCardElement: StripeCardElement | null = null;

  constructor() {
    this.stripeInitPromise = this.initializeStripe();
  }

  private async initializeStripe(): Promise<Stripe | null> {
    try {
      this.stripe = await loadStripe(environment.stripe.publishableKey);
      console.log('✅ Stripe initialized successfully');
      return this.stripe;
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
      return null;
    }
  }

  async ensureStripeLoaded(): Promise<Stripe | null> {
    if (this.stripe) {
      return this.stripe;
    }
    if (this.stripeInitPromise) {
      return await this.stripeInitPromise;
    }
    return null;
  }

  async createCardElement(clientSecret: string): Promise<StripeCardElement | null> {
    // Wait for Stripe to be fully initialized
    await this.ensureStripeLoaded();

    if (!this.stripe) {
      console.error('Stripe not initialized - publishableKey may be invalid');
      throw new Error('Stripe not initialized. Please check your Stripe publishable key.');
    }

    // Store client secret for later use
    this.clientSecret = clientSecret;

    // Create elements instance (without clientSecret for Card Element)
    this.elements = this.stripe.elements();

    // Create card element
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a2e',
          fontFamily: 'Inter, sans-serif',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      },
    });

    return this.cardElement;
  }

  async confirmPayment(clientSecret: string): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe not properly initialized');
    }

    // Use confirmCardPayment for Card Element (not confirmPayment which is for Payment Element)
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }

    return paymentIntent;
  }

  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
    this.clientSecret = null;
  }

  getStripe(): Stripe | null {
    return this.stripe;
  }

  // ── Setup Intent methods (for saving cards in Settings) ──────────────

  async createSetupCardElement(): Promise<StripeCardElement | null> {
    await this.ensureStripeLoaded();

    if (!this.stripe) {
      throw new Error('Stripe not initialized.');
    }

    this.setupElements = this.stripe.elements();
    this.setupCardElement = this.setupElements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a2e',
          fontFamily: 'Inter, sans-serif',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      },
    });

    return this.setupCardElement;
  }

  async confirmSetupIntent(clientSecret: string): Promise<any> {
    if (!this.stripe || !this.setupCardElement) {
      throw new Error('Stripe not properly initialized for setup');
    }

    const { error, setupIntent } = await this.stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: this.setupCardElement,
      },
    });

    if (error) {
      console.error('Setup confirmation error:', error);
      throw error;
    }

    return setupIntent;
  }

  destroySetupCardElement(): void {
    if (this.setupCardElement) {
      this.setupCardElement.destroy();
      this.setupCardElement = null;
    }
    this.setupElements = null;
  }
}
