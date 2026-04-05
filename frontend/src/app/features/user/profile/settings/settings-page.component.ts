import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfileResponse, UpdateUserProfileRequest } from '../../../../core/models/user.model';
import { StripeService } from '../../../../core/services/stripe.service';
import {
  PaymentApiService,
  SavedCardResponse,
} from '../../../../core/services/payment-api.service';
import { StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  profile = signal<UserProfileResponse | null>(null);
  isLoading = signal(true);
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Tabs
  activeTab: 'info' | 'social' | 'payment' | 'security' = 'info';

  // Security tab
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordLoading = signal(false);
  passwordSuccessMessage = signal('');
  passwordErrorMessage = signal('');

  // Account linking
  linkLoading = signal('');

  uploading = signal(false);
  uploadProgress = signal('');
  isDragOver = signal(false);

  // Card management
  @ViewChild('setupCardElement', { read: ElementRef }) setupCardElementRef!: ElementRef;
  savedCard = signal<SavedCardResponse | null>(null);
  showCardForm = signal(false);
  cardLoading = signal(false);
  cardSuccessMessage = signal('');
  cardErrorMessage = signal('');
  private setupCardElement: StripeCardElement | null = null;
  private setupClientSecret: string | null = null;

  bioLength = computed(() => {
    return this.profileForm.get('bio')?.value?.length || 0;
  });

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private paymentApiService: PaymentApiService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      displayName: [''],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      profilePictureUrl: [''],
      bio: [''],
      isProfilePublic: [true],
      facebookUrl: [
        '',
        [Validators.pattern(/^$|^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(facebook|fb)\.com(\/.*)?$/)],
      ],
      linkedinUrl: [
        '',
        [Validators.pattern(/^$|^(https?:\/\/)?([a-zA-Z0-9-]+\.)*linkedin\.com(\/.*)?$/)],
      ],
      instagramUrl: [
        '',
        [Validators.pattern(/^$|^(https?:\/\/)?([a-zA-Z0-9-]+\.)*instagram\.com(\/.*)?$/)],
      ],
      twitterUrl: [
        '',
        [Validators.pattern(/^$|^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(twitter|x)\.com(\/.*)?$/)],
      ],
      websiteUrl: [
        '',
        [Validators.pattern(/^$|^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadSavedCard();

    // Handle account linking redirect
    this.route.queryParams.subscribe((params) => {
      if (params['linked']) {
        this.activeTab = 'security';
        this.successMessage.set(`Google account connected successfully`);
        this.loadProfile();
        setTimeout(() => this.successMessage.set(''), 5000);
      }
    });
  }

  private loadSavedCard(): void {
    this.paymentApiService.getSavedCard().subscribe({
      next: (card) => {
        this.savedCard.set(card);
      },
      error: (err) => {
        console.error('Error loading saved card:', err);
        this.savedCard.set(null);
      },
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName,
          displayName: profile.displayName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          profilePictureUrl: profile.profilePictureUrl || '',
          bio: profile.bio || '',
          isProfilePublic: profile.isProfilePublic,
          facebookUrl: profile.facebookUrl || '',
          linkedinUrl: profile.linkedinUrl || '',
          instagramUrl: profile.instagramUrl || '',
          twitterUrl: profile.twitterUrl || '',
          websiteUrl: profile.websiteUrl || '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.errorMessage.set('Failed to load profile. Please refresh the page.');
        this.isLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.uploadFile(file);
      } else {
        this.errorMessage.set('Please upload an image file (JPG, PNG, GIF, WebP)');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    }
  }

  private uploadFile(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('Image must be less than 5 MB.');
      setTimeout(() => this.errorMessage.set(''), 4000);
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select an image file.');
      setTimeout(() => this.errorMessage.set(''), 4000);
      return;
    }
    this.uploading.set(true);
    this.uploadProgress.set('Uploading...');

    const uploadTimeout = setTimeout(() => {
      if (this.uploading()) {
        this.uploading.set(false);
        this.uploadProgress.set('');
        this.errorMessage.set('Upload took too long. Please try again.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    }, 30000);

    this.profileService.uploadProfilePicture(file).subscribe({
      next: (response) => {
        clearTimeout(uploadTimeout);
        this.uploading.set(false);
        this.uploadProgress.set('');
        this.profileForm.patchValue({ profilePictureUrl: response.url });
        this.successMessage.set('Profile picture uploaded!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        clearTimeout(uploadTimeout);
        this.uploading.set(false);
        this.uploadProgress.set('');
        this.errorMessage.set('Upload failed. Please try again.');
        console.error('Upload error:', err);
        setTimeout(() => this.errorMessage.set(''), 4000);
      },
    });
  }

  removeProfilePicture(): void {
    this.profileForm.patchValue({ profilePictureUrl: '' });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;
    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    const raw = this.profileForm.value;
    const request: UpdateUserProfileRequest = Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, value === '' ? null : value]),
    ) as UpdateUserProfileRequest;
    this.profileService.updateMyProfile(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set('Profile updated successfully!');
        this.profile.set(response.body!);

        const newToken = response.headers.get('X-New-Token');
        if (newToken) {
          localStorage.setItem('auth_token', newToken);
        }

        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400 && err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('An error occurred. Please try again.');
        }
        console.error(err);
        setTimeout(() => this.errorMessage.set(''), 6000);
      },
    });
  }

  // ── Card management methods ──────────────────────────────

  async showCardSetupForm(): Promise<void> {
    this.showCardForm.set(true);
    this.cardErrorMessage.set('');
    this.cardSuccessMessage.set('');
    this.cardLoading.set(true);

    try {
      // Destroy any existing card element
      this.stripeService.destroySetupCardElement();

      // Create setup intent
      const response = await this.paymentApiService.createSetupIntent().toPromise();
      if (!response || !response.clientSecret) {
        throw new Error('No client secret returned from setup-intent');
      }
      this.setupClientSecret = response.clientSecret;

      // Wait for DOM to fully render the card element container
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Verify the element exists
      if (!this.setupCardElementRef || !this.setupCardElementRef.nativeElement) {
        throw new Error('Card element container not found in DOM');
      }

      // Create and mount the card element
      this.setupCardElement = await this.stripeService.createSetupCardElement();
      if (!this.setupCardElement) {
        throw new Error('Failed to create Stripe card element');
      }

      this.setupCardElement.mount(this.setupCardElementRef.nativeElement);
      this.cardLoading.set(false);
    } catch (err: any) {
      this.cardLoading.set(false);
      this.showCardForm.set(false);
      console.error('Setup intent error:', err);
      this.cardErrorMessage.set(err.message || 'Initialization error. Please try again.');
      setTimeout(() => this.cardErrorMessage.set(''), 5000);
    }
  }

  async saveCard(): Promise<void> {
    if (!this.setupClientSecret) {
      this.cardErrorMessage.set('Error: missing setup secret');
      return;
    }

    if (!this.setupCardElement) {
      this.cardErrorMessage.set('Error: card element not initialized');
      return;
    }

    this.cardLoading.set(true);
    this.cardErrorMessage.set('');

    try {
      await this.stripeService.confirmSetupIntent(this.setupClientSecret);

      this.cardSuccessMessage.set('Card saved successfully!');
      this.cardLoading.set(false);

      this.stripeService.destroySetupCardElement();
      this.setupCardElement = null;
      this.setupClientSecret = null;
      this.showCardForm.set(false);

      this.loadSavedCard();

      setTimeout(() => this.cardSuccessMessage.set(''), 4000);
    } catch (err: any) {
      this.cardLoading.set(false);
      this.cardErrorMessage.set(err.message || 'Error saving card.');
      console.error('Save card error:', err);
    }
  }

  cancelCardSetup(): void {
    this.showCardForm.set(false);
    this.cardErrorMessage.set('');
    this.cardSuccessMessage.set('');
    this.stripeService.destroySetupCardElement();
    this.setupCardElement = null;
    this.setupClientSecret = null;
  }

  removeSavedCard(): void {
    this.cardLoading.set(true);
    this.paymentApiService.deleteSavedCard().subscribe({
      next: () => {
        this.savedCard.set(null);
        this.cardLoading.set(false);
        this.cardSuccessMessage.set('Card removed.');
        setTimeout(() => this.cardSuccessMessage.set(''), 3000);
      },
      error: () => {
        this.cardLoading.set(false);
        this.cardErrorMessage.set('Error removing card.');
        setTimeout(() => this.cardErrorMessage.set(''), 4000);
      },
    });
  }

  // ── Password change ──────────────────────────────

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) return;
    if (this.newPassword !== this.confirmPassword) return;
    if (this.newPassword.length < 8) return;

    this.passwordLoading.set(true);
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');

    this.profileService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.passwordLoading.set(false);
          this.passwordSuccessMessage.set('Password changed successfully!');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => this.passwordSuccessMessage.set(''), 4000);
        },
        error: (err) => {
          this.passwordLoading.set(false);
          if (err.status === 401) {
            this.passwordErrorMessage.set('Current password is incorrect.');
          } else {
            this.passwordErrorMessage.set(
              err.error?.message || 'An error occurred. Please try again.',
            );
          }
          setTimeout(() => this.passwordErrorMessage.set(''), 4000);
        },
      });
  }

  // ── Account linking ──────────────────────────────

  linkAccount(provider: 'google'): void {
    this.authService.linkWithGoogle();
  }

  unlinkAccount(provider: 'google'): void {
    this.linkLoading.set(provider);
    this.profileService.unlinkAccount(provider.toUpperCase()).subscribe({
      next: () => {
        this.linkLoading.set('');
        this.successMessage.set(`Google account disconnected`);
        this.loadProfile();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.linkLoading.set('');
        this.errorMessage.set(err.error?.message || 'Error disconnecting account.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      },
    });
  }

  isProviderConnected(provider: string): boolean {
    const p = this.profile();
    if (!p) return false;
    if (provider === 'GOOGLE') return p.authProvider === 'GOOGLE' || p.googleLinked;
    if (provider === 'LOCAL') return p.authProvider === 'LOCAL';
    return false;
  }

  canUnlink(provider: string): boolean {
    const p = this.profile();
    if (!p) return false;
    // Can only unlink if it's linked but NOT the primary auth provider
    if (provider === 'GOOGLE') return p.googleLinked && p.authProvider !== 'GOOGLE';
    return false;
  }

  ngOnDestroy(): void {
    this.stripeService.destroySetupCardElement();
  }
}
