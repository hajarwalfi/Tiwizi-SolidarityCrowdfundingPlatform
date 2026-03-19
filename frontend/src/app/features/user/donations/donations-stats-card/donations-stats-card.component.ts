import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-donations-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-gradient-to-br from-tiwizi-primary to-tiwizi-accent rounded-2xl p-8 text-white shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-white/80 text-sm font-medium mb-2">Total Donated</p>
          <p class="text-4xl font-bold">{{ formatAmount(totalAmount) }}</p>
        </div>
        <div class="text-right">
          <p class="text-white/80 text-sm font-medium mb-2">Number of Donations</p>
          <p class="text-4xl font-bold">{{ count }}</p>
        </div>
      </div>
      <div class="mt-6 pt-6 border-t border-white/20">
        <p class="text-sm text-white/90">
          Thank you for your generosity! You're making a real impact on {{ count }} campaign{{
            count > 1 ? 's' : ''
          }}.
        </p>
      </div>
    </div>
  `,
})
export class DonationsStatsCardComponent {
  @Input({ required: true }) totalAmount!: number;
  @Input({ required: true }) count!: number;

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
