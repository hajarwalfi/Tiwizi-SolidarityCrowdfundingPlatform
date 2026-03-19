import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonationService } from '../../../../core/services/donation.service';
import { Donation } from '../../../../core/models/donation.model';
import { DonationsStatsCardComponent } from '../donations-stats-card/donations-stats-card.component';
import { DonationsListComponent } from '../donations-list/donations-list.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-donations-page',
  standalone: true,
  imports: [
    CommonModule,
    DonationsStatsCardComponent,
    DonationsListComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './my-donations-page.component.html',
})
export class MyDonationsPageComponent implements OnInit {
  donations = signal<Donation[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(private donationService: DonationService) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.donationService.getMyDonations().subscribe({
      next: (data) => {
        this.donations.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load your donations. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  getTotalDonated(): number {
    return this.donations().reduce((sum, d) => sum + d.amount, 0);
  }
}
