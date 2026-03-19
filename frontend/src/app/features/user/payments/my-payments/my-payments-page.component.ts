import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DonationService } from '../../../../core/services/donation.service';
import { PaymentApiService } from '../../../../core/services/payment-api.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { Donation, DonationStatus } from '../../../../core/models/donation.model';

@Component({
  selector: 'app-my-payments-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-payments-page.component.html',
})
export class MyPaymentsPageComponent implements OnInit {
  donations = signal<Donation[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedDonation = signal<Donation | null>(null);

  // Card info — fetched from Stripe via backend
  cardInfo = signal<{ brand: string; last4: string; expMonth: number; expYear: number } | null>(
    null,
  );

  // User name for card display
  userName = signal<string>('');

  // Pagination
  currentPage = signal<number>(1);
  readonly pageSize = 7;

  // Sorting
  sortOrder = signal<'newest' | 'oldest'>('newest');

  sortedDonations = computed(() => {
    const sorted = [...this.donations()];
    sorted.sort((a, b) => {
      const dateA = new Date(a.paidAt || a.createdAt).getTime();
      const dateB = new Date(b.paidAt || b.createdAt).getTime();
      return this.sortOrder() === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  });

  totalPages = computed(() => Math.ceil(this.sortedDonations().length / this.pageSize) || 1);

  paginatedDonations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sortedDonations().slice(start, start + this.pageSize);
  });

  successPayments = computed(() =>
    this.donations().filter((d) => d.status === DonationStatus.SUCCESS),
  );

  totalPaid = computed(() => this.successPayments().reduce((sum, d) => sum + d.amount, 0));

  constructor(
    private donationService: DonationService,
    private paymentApiService: PaymentApiService,
    private profileService: ProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadSavedCard();
    this.loadUserName();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.donationService.getMyDonations().subscribe({
      next: (data) => {
        this.donations.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load your payments. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  private loadUserName(): void {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.userName.set(profile.fullName || profile.displayName || '');
      },
      error: () => {
        this.userName.set('');
      },
    });
  }

  private loadSavedCard(): void {
    this.paymentApiService.getSavedCard().subscribe({
      next: (card) => {
        if (card && card.last4) {
          this.cardInfo.set({
            brand: card.brand,
            last4: card.last4,
            expMonth: card.expMonth,
            expYear: card.expYear,
          });
        } else {
          this.cardInfo.set(null);
        }
      },
      error: () => {
        this.cardInfo.set(null);
      },
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'Paid';
      case 'PENDING':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REFUNDED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  selectDonation(donation: Donation): void {
    this.selectedDonation.set(donation);
  }

  closeDetail(): void {
    this.selectedDonation.set(null);
  }

  donateAgain(donation: Donation): void {
    this.router.navigate(['/campaigns', donation.campaignId]);
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'newest' ? 'oldest' : 'newest');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  get pageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  }
}
