import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Donation } from '../../../../core/models/donation.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-donations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './donations-list.component.html'
})
export class DonationsListComponent {
  @Input({ required: true }) donations!: Donation[];

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 0 }).format(amount);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-MA', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
  }
}
