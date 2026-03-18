import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Campaign } from '../../../../../core/models/campaign.model';

@Component({
  selector: 'app-campaign-donation-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-donation-sidebar.component.html',
})
export class CampaignDonationSidebarComponent {
  @Input({ required: true }) campaign!: Campaign;
  @Output() donateClicked = new EventEmitter<void>();
  @Output() reportClicked = new EventEmitter<void>();
  @Output() shareClicked = new EventEmitter<void>();

  getProgressPercent(): number {
    if (!this.campaign.goalAmount) return 0;
    return Math.min(100, Math.round((this.campaign.amountCollected / this.campaign.goalAmount) * 100));
  }

  getCircumference(): number {
    return 2 * Math.PI * 40;
  }

  getStrokeDashoffset(): number {
    return this.getCircumference() * (1 - this.getProgressPercent() / 100);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      'bg-rose-100 text-rose-600',
      'bg-orange-100 text-orange-600',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-600',
      'bg-teal-100 text-teal-600',
      'bg-sky-100 text-sky-600',
      'bg-violet-100 text-violet-600',
      'bg-pink-100 text-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }

  getDaysRemaining(): number {
    const created = new Date(this.campaign.createdAt);
    const deadline = new Date(created);
    deadline.setDate(created.getDate() + 30);
    const diff = deadline.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }
}
