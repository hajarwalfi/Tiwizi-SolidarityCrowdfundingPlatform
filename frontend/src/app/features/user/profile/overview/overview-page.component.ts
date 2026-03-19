import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BeneficiaryService } from '../../../../core/services/beneficiary.service';
import { DonationService } from '../../../../core/services/donation.service';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { BeneficiaryCampaignResponse } from '../../../../core/models/beneficiary.model';
import { Donation } from '../../../../core/models/donation.model';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfileActivityComponent } from '../profile-activity/profile-activity.component';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileCardComponent,
    ProfileActivityComponent,
  ],
  templateUrl: './overview-page.component.html',
})
export class OverviewPageComponent implements OnInit {
  profile = signal<UserProfileResponse | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  viewMode = signal<'public' | 'donor' | 'beneficiary'>('donor');

  myCampaigns = signal<BeneficiaryCampaignResponse[]>([]);
  isLoadingCampaigns = signal<boolean>(false);
  previewCampaigns = signal<BeneficiaryCampaignResponse[]>([]);
  totalCampaignCount = signal<number>(0);

  myDonations = signal<Donation[]>([]);
  isLoadingDonations = signal<boolean>(false);
  previewDonations = signal<Donation[]>([]);
  previewPayments = signal<Donation[]>([]);
  totalDonationCount = signal<number>(0);
  donorLoaded = signal<boolean>(false);

  profileForm: FormGroup;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private beneficiaryService: BeneficiaryService,
    private donationService: DonationService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.maxLength(100)]],
      bio: ['', [Validators.maxLength(500)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      isProfilePublic: [true],
      facebookUrl: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.*$/)]],
      twitterUrl: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.*$/)]],
      instagramUrl: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/)]],
      linkedinUrl: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/)]],
      websiteUrl: ['', [Validators.pattern(/^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyDonations();
    this.loadMyCampaigns();
  }

  loadProfile(): void {
    if (!this.authService.hasValidToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.patchFormValues(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 404) {
          this.router.navigate(['/login']);
        } else {
          this.error.set('Failed to load profile');
          this.isLoading.set(false);
        }
      },
    });
  }

  patchFormValues(profile: UserProfileResponse): void {
    this.profileForm.patchValue({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      phoneNumber: profile.phoneNumber || '',
      isProfilePublic: profile.isProfilePublic,
      facebookUrl: profile.facebookUrl || '',
      twitterUrl: profile.twitterUrl || '',
      instagramUrl: profile.instagramUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
      websiteUrl: profile.websiteUrl || '',
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      const currentProfile = this.profile();
      if (currentProfile) this.patchFormValues(currentProfile);
    }
    this.isEditing.set(!this.isEditing());
    this.successMessage.set(null);
  }

  setViewMode(mode: 'public' | 'donor' | 'beneficiary'): void {
    this.viewMode.set(mode);
    if (mode === 'donor' && !this.donorLoaded()) this.loadMyDonations();
  }

  loadMyDonations(): void {
    this.isLoadingDonations.set(true);
    this.donationService.getMyDonations().subscribe({
      next: (donations) => {
        this.myDonations.set(donations);
        this.totalDonationCount.set(donations.length);
        this.previewDonations.set(donations.slice(0, 3));
        const sorted = [...donations].sort((a, b) =>
          new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime()
        );
        this.previewPayments.set(sorted.slice(0, 3));
        this.isLoadingDonations.set(false);
        this.donorLoaded.set(true);
      },
      error: () => {
        this.isLoadingDonations.set(false);
        this.donorLoaded.set(true);
      },
    });
  }

  loadMyCampaigns(): void {
    this.isLoadingCampaigns.set(true);
    this.beneficiaryService.getMyCampaigns().subscribe({
      next: (campaigns) => {
        this.myCampaigns.set(campaigns);
        this.totalCampaignCount.set(campaigns.length);
        this.previewCampaigns.set(campaigns.slice(0, 3));
        this.isLoadingCampaigns.set(false);
      },
      error: () => this.isLoadingCampaigns.set(false),
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.isSaving.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    this.profileService.updateMyProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.profile.set(response.body!);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.successMessage.set('Profile updated successfully!');

        // If the backend issued a new JWT (email changed), update stored token
        const newToken = response.headers.get('X-New-Token');
        if (newToken) {
          localStorage.setItem('auth_token', newToken);
        }

        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.error.set('Failed to update profile');
        this.isSaving.set(false);
      },
    });
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Profile picture must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select an image file');
        return;
      }
      this.isSaving.set(true);
      this.profileService.uploadProfilePicture(file).subscribe({
        next: (response) => {
          const p = this.profile();
          if (p) this.profile.set({ ...p, profilePictureUrl: response.url });
          this.isSaving.set(false);
          this.successMessage.set('Profile picture updated!');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: () => {
          this.error.set('Failed to upload profile picture');
          this.isSaving.set(false);
        },
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.profileForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      if (control.errors?.['maxLength']) return 'Maximum length exceeded';
      if (control.errors?.['pattern']) return `Invalid ${fieldName} format`;
    }
    return null;
  }
}
