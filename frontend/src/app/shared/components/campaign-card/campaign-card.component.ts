import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Campaign, CampaignStatus } from '../../../core/models/campaign.model';
import { CAMPAIGN_CATEGORY_LABELS } from '../../constants';
import { FavoriteButtonComponent } from '../../../features/user/favorites/favorite-button/favorite-button.component';
import { CurrencyMadPipe } from '../../pipes';

@Component({
  selector: 'app-campaign-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FavoriteButtonComponent, CurrencyMadPipe, DecimalPipe],
  templateUrl: './campaign-card.component.html',
  styles: [`
    :host { display: block; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
  `],
})
export class CampaignCardComponent {
  @Input({ required: true }) campaign!: Campaign;
  @Input() showFavorite = true;
  @Input() animationDelay = 0;

  readonly categoryLabels = CAMPAIGN_CATEGORY_LABELS;

  get categoryLabel(): string {
    return this.categoryLabels[this.campaign.category] || this.campaign.category;
  }

  get categoryIconEmoji(): string {
    const icons: Record<string, string> = {
      HEALTH: '❤️', EDUCATION: '📚', HOUSING: '🏠', FOOD: '🍎',
      EMERGENCY: '🚨', ENVIRONMENT: '🌱', COMMUNITY: '👥',
      DISABILITY: '♿', CHILDREN: '🌟', CLOTHING: '👕', OTHER: '📦',
    };
    return icons[this.campaign.category] || '📦';
  }

  get categoryColor(): string {
    const colors: Record<string, string> = {
      HEALTH: '#FEE2E2', EDUCATION: '#DBEAFE', HOUSING: '#FEF3C7',
      FOOD: '#FFEDD5', EMERGENCY: '#FFE4E6', ENVIRONMENT: '#D1FAE5',
      COMMUNITY: '#EDE9FE', DISABILITY: '#E0F2FE', CHILDREN: '#FCE7F3',
      CLOTHING: '#F3E8FF', OTHER: '#F3F4F6',
    };
    return colors[this.campaign.category] || '#F3F4F6';
  }

  get statusColorClass(): string {
    const colors: Record<string, string> = {
      ACTIVE:   'bg-[#D1FAE5] text-[#065F46]',
      PENDING:  'bg-[#FEF3C7] text-[#92400E]',
      COMPLETED:'bg-[#DBEAFE] text-[#1E40AF]',
      CLOSED:   'bg-[#F3F4F6] text-[#374151]',
    };
    return colors[this.campaign.status] || 'bg-gray-100 text-gray-700';
  }

  get statusDotColor(): string {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-500',
      PENDING:  'bg-amber-400',   COMPLETED: 'bg-blue-500',
      CLOSED:   'bg-gray-400',
    };
    return colors[this.campaign.status] || 'bg-gray-400';
  }

  get statusLabel(): string {
    const labels: Partial<Record<CampaignStatus, string>> = {
      [CampaignStatus.ACTIVE]:    'Actif',
      [CampaignStatus.PENDING]:   'En attente',
      [CampaignStatus.COMPLETED]: 'Terminé',
      [CampaignStatus.CLOSED]:    'Clôturé',
    };
    return labels[this.campaign.status] ?? 'Actif';
  }

  get progressPct(): number {
    if (!this.campaign.goalAmount) return 0;
    return Math.min((this.campaign.amountCollected / this.campaign.goalAmount) * 100, 100);
  }

  get daysUntilDeadline(): number | null {
    if (!this.campaign.deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(this.campaign.deadline);
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }

  get categoryGradient(): string {
    const gradients: Record<string, string> = {
      HEALTH:      'linear-gradient(135deg, #FECDD3 0%, #FDA4AF 100%)',
      EDUCATION:   'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
      HOUSING:     'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
      FOOD:        'linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%)',
      EMERGENCY:   'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
      ENVIRONMENT: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
      COMMUNITY:   'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
      DISABILITY:  'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)',
      CHILDREN:    'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 100%)',
      CLOTHING:    'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)',
      OTHER:       'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
    };
    return gradients[this.campaign.category] || 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)';
  }
}
