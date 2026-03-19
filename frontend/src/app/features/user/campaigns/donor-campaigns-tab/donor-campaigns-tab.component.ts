import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DonorCampaignView } from '../my-campaigns/my-campaigns-page.component';

@Component({
  selector: 'app-donor-campaigns-tab',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './donor-campaigns-tab.component.html',
})
export class DonorCampaignsTabComponent {
  @Input({ required: true }) campaigns!: DonorCampaignView[];
  @Input() isLoading = false;
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() pageChanged = new EventEmitter<number>();

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      HEALTH: '#FEE2E2',
      EDUCATION: '#DBEAFE',
      HOUSING: '#FEF3C7',
      FOOD: '#FFEDD5',
      EMERGENCY: '#FFE4E6',
      ENVIRONMENT: '#D1FAE5',
      COMMUNITY: '#EDE9FE',
      DISABILITY: '#E0F2FE',
      CHILDREN: '#FCE7F3',
      OTHER: '#F3F4F6',
    };
    return colors[category] || '#F3F4F6';
  }

  getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      HEALTH: '❤️',
      EDUCATION: '📚',
      HOUSING: '🏠',
      FOOD: '🍎',
      EMERGENCY: '🚨',
      ENVIRONMENT: '🌱',
      COMMUNITY: '👥',
      DISABILITY: '♿',
      CHILDREN: '🌟',
      OTHER: '📦',
    };
    return emojis[category] || '📦';
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
