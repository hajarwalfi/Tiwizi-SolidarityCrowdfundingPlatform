import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DonationService } from '../../../../core/services/donation.service';
import { Campaign } from '../../../../core/models/campaign.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { StripeService } from '../../../../core/services/stripe.service';
import {
  PaymentApiService,
  SavedCardResponse,
} from '../../../../core/services/payment-api.service';
import { StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-donation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donation-modal.component.html',
})
export class DonationModalComponent implements OnDestroy {
  @Input() campaign!: Campaign;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() donationSuccess = new EventEmitter<void>();

  donationForm: FormGroup;
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isProcessingPayment = signal<boolean>(false);
  isCardReady = signal<boolean>(false); // New: Card form is displayed and ready for input
  hasSavedCard = signal<boolean>(false); // User has a saved card in their profile
  savedCard = signal<SavedCardResponse | null>(null);
  saveCardEnabled = false; // User wants to save card for future payments

  predefinedAmounts = [50, 100, 200, 500, 1000];

  private cardElement: StripeCardElement | null = null;
  private clientSecret: string | null = null;
  private donationId: string | null = null; // Store donation ID for payment confirmation

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private authService: AuthService,
    private router: Router,
    private stripeService: StripeService,
    private paymentApiService: PaymentApiService,
  ) {
    this.donationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(10)]],
      isAnonymous: [false],
      paymentMethod: ['CARD'],
    });

    // Check if user has a saved card
    this.paymentApiService.getSavedCard().subscribe({
      next: (card) => {
        if (card && card.paymentMethodId) {
          this.savedCard.set(card);
          this.hasSavedCard.set(true);
        } else {
          this.savedCard.set(null);
          this.hasSavedCard.set(false);
        }
      },
      error: () => {
        this.savedCard.set(null);
        this.hasSavedCard.set(false);
      },
    });
  }

  selectAmount(amount: number): void {
    this.donationForm.patchValue({ amount });
  }

  onClose(): void {
    this.cleanupStripe();
    this.close.emit();
    this.donationForm.reset();
    this.error.set(null);
    this.successMessage.set(null);
    this.isProcessingPayment.set(false);
    this.isCardReady.set(false);
    this.saveCardEnabled = false;
    this.donationId = null;
  }

  async onSubmit(): Promise<void> {
    // If card is ready, this is the second click - confirm the payment
    if (this.isCardReady()) {
      await this.confirmPayment();
      return;
    }

    // First click - validate form and show card input
    if (this.donationForm.invalid) {
      Object.keys(this.donationForm.controls).forEach((key) => {
        const control = this.donationForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    // Check if user is authenticated
    if (!this.authService.hasValidToken()) {
      this.error.set('You must be logged in to make a donation');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      // Step 1: Create donation on backend (PENDING status)
      const donationData = {
        campaignId: this.campaign.id,
        amount: this.donationForm.value.amount,
        isAnonymous: this.donationForm.value.isAnonymous || false,
        paymentMethod: this.donationForm.value.paymentMethod,
      };

      console.log('Creating donation...', donationData);
      const donation = await this.donationService.createDonation(donationData).toPromise();

      if (!donation) {
        throw new Error('Failed to create donation');
      }

      console.log('✅ Donation created:', donation);
      this.donationId = donation.id;

      // Check if the backend auto-confirmed via saved card
      if ((donation as any).paidWithSavedCard) {
        console.log('✅ Payment auto-confirmed with saved card!');
        this.isSubmitting.set(false);
        this.successMessage.set(
          'Payment completed with your saved card! Thank you for your generosity.',
        );
        this.donationSuccess.emit();
        setTimeout(() => {
          this.onClose();
        }, 2500);
        return;
      }

      console.log('Transaction ID from backend:', (donation as any).transactionId);

      // Step 2: Mount Stripe card element with client secret
      this.isProcessingPayment.set(true);
      this.clientSecret = (donation as any).transactionId; // This is the Payment Intent client secret

      if (!this.clientSecret) {
        console.error('No client secret received from backend!');
        throw new Error('No client secret received from backend');
      }

      if (!this.clientSecret.startsWith('pi_')) {
        console.error('Invalid client secret format:', this.clientSecret);
        throw new Error('Invalid payment intent format: ' + this.clientSecret);
      }

      // If the user has a saved card, confirm directly without showing the card form
      if (this.hasSavedCard() && this.savedCard()) {
        this.isSubmitting.set(true);
        await this.confirmPaymentWithMethod(this.clientSecret, this.savedCard()!.paymentMethodId);
        return;
      }

      // No saved card — mount the Stripe card element for manual entry.
      // The div is always in the DOM (hidden via [hidden]), so getElementById is always reliable.
      const mountTarget = document.getElementById('stripe-card-element');
      if (!mountTarget) {
        throw new Error('Unable to create the payment form. Please refresh the page and try again.');
      }

      try {
        this.cardElement = await this.stripeService.createCardElement(this.clientSecret);
      } catch (stripeErr: any) {
        console.error('Stripe initialization error:', stripeErr);
        throw new Error('Stripe initialization error: ' + stripeErr.message);
      }

      this.cardElement!.mount(mountTarget);
      console.log('✅ Card element mounted - waiting for user input');
      this.isCardReady.set(true);
      this.isSubmitting.set(false);
    } catch (err: any) {
      this.isSubmitting.set(false);
      this.isProcessingPayment.set(false);
      this.isCardReady.set(false);
      console.error('Error processing donation:', err);

      if (err.status === 401) {
        this.error.set('Session expired. Please log in again.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else if (err.type === 'card_error') {
        this.error.set(`Payment error: ${err.message}`);
      } else if (err.error?.message) {
        this.error.set(err.error.message);
      } else if (err.message) {
        this.error.set(err.message);
      } else {
        this.error.set('An error occurred while processing your donation. Please try again.');
      }
    }
  }

  // Confirm payment using a specific saved payment method ID (no card form needed)
  async confirmPaymentWithMethod(clientSecret: string, paymentMethodId: string): Promise<void> {
    try {
      const stripe = this.stripeService.getStripe();
      if (!stripe) throw new Error('Stripe not initialized');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (error) throw error;

      if (paymentIntent?.id) {
        try {
          await this.paymentApiService.verifyPayment(paymentIntent.id).toPromise();
        } catch { /* webhook will handle it */ }
      }

      this.isSubmitting.set(false);
      this.isProcessingPayment.set(false);
      this.successMessage.set('Thank you for your generosity! Your donation has been successfully processed.');
      this.donationSuccess.emit();
      setTimeout(() => this.onClose(), 2000);
    } catch (err: any) {
      this.isSubmitting.set(false);
      this.isProcessingPayment.set(false);
      if (err.type === 'card_error' || err.type === 'validation_error') {
        this.error.set(this.translateStripeError(err.code, err.message));
      } else {
        this.error.set('Payment failed. Please try again or use a different card.');
      }
    }
  }

  // Confirm payment after user enters card details
  async confirmPayment(): Promise<void> {
    if (!this.clientSecret) {
      this.error.set('Error: Payment secret missing');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      // If user wants to save card, update the PaymentIntent BEFORE confirming
      // Stripe requires setup_future_usage + customer to be set prior to confirmation
      if (this.saveCardEnabled) {
        try {
          const piId = this.clientSecret!.split('_secret_')[0];
          await this.paymentApiService.enableFutureUsage(piId).toPromise();
          console.log('✅ PaymentIntent configured for future usage');
        } catch (fuErr) {
          console.warn('⚠️ Could not configure future usage (non-blocking):', fuErr);
        }
      }

      console.log('Confirming payment with Stripe...');
      const paymentIntent = await this.stripeService.confirmPayment(this.clientSecret);

      console.log('✅ Payment confirmed:', paymentIntent);

      // Verify payment on backend to update donation status to SUCCESS
      if (paymentIntent?.id) {
        try {
          await this.paymentApiService.verifyPayment(paymentIntent.id).toPromise();
          console.log('✅ Backend donation status updated');
        } catch (verifyErr) {
          console.warn(
            '⚠️ Backend verify call failed (donation may stay PENDING until webhook):',
            verifyErr,
          );
        }
      }

      // Show success
      this.isSubmitting.set(false);
      this.isProcessingPayment.set(false);
      this.isCardReady.set(false);
      this.successMessage.set(
        'Thank you for your generosity! Your donation has been successfully processed.',
      );

      // Emit success event
      this.donationSuccess.emit();

      // Close modal after 2 seconds
      setTimeout(() => {
        this.onClose();
      }, 2000);
    } catch (err: any) {
      this.isSubmitting.set(false);
      console.error('Error confirming payment:', err);

      if (err.type === 'card_error' || err.type === 'validation_error') {
        // Translate common Stripe validation errors to French
        const errorMessage = this.translateStripeError(err.code, err.message);
        this.error.set(errorMessage);
      } else {
        this.error.set('Error confirming payment. Please try again.');
      }
    }
  }

  // Translate Stripe error codes to English
  private translateStripeError(code: string, defaultMessage: string): string {
    const translations: { [key: string]: string } = {
      incomplete_number: 'Please enter a complete card number.',
      incomplete_expiry: 'Please enter a complete expiration date.',
      incomplete_cvc: 'Please enter the security code (CVC).',
      invalid_number: 'The card number is invalid.',
      invalid_expiry_year_past: 'The expiration year is in the past.',
      invalid_expiry_month_past: 'The expiration date is in the past.',
      invalid_cvc: 'The security code is invalid.',
      card_declined: 'The card was declined.',
      expired_card: 'The card has expired.',
      insufficient_funds: 'Insufficient funds.',
      processing_error: 'Processing error. Please try again.',
    };
    return translations[code] || `Payment error: ${defaultMessage}`;
  }

  private cleanupStripe(): void {
    if (this.cardElement) {
      this.stripeService.destroyCardElement();
      this.cardElement = null;
    }
    this.clientSecret = null;
  }

  ngOnDestroy(): void {
    this.cleanupStripe();
  }

  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
