import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BeneficiaryCampaignResponse } from '../../../../core/models/beneficiary.model';

@Component({
  selector: 'app-beneficiary-campaigns-tab',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './beneficiary-campaigns-tab.component.html',
})
export class BeneficiaryCampaignsTabComponent {
  private router = inject(Router);
  private carouselIndices = new Map<string, number>();

  @Input({ required: true }) campaigns!: BeneficiaryCampaignResponse[];
  @Input() isLoading = false;
  @Input() activeFilter = 'ALL';
  @Input() searchQuery = '';
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() filterChanged = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() manageRequested = new EventEmitter<{
    campaign: BeneficiaryCampaignResponse;
    tab: string;
  }>();

  readonly statusFilters = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-[#FEF3C7] text-[#92400E]',
      ACTIVE: 'bg-[#F3E8FF] text-[#7C3AED]',
      REJECTED: 'bg-[#FEE2E2] text-[#991B1B]',
      COMPLETED: 'bg-[#DBEAFE] text-[#1E40AF]',
      CLOSED: 'bg-[#F3F4F6] text-[#374151]',
      CANCELLED: 'bg-[#FEE2E2] text-[#991B1B]',
      SUSPENDED: 'bg-[#FEF3C7] text-[#92400E]',
      ARCHIVED: 'bg-slate-100 text-slate-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      ACTIVE: 'Active',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CLOSED: 'Completed',
      CANCELLED: 'Cancelled',
      SUSPENDED: 'Suspended',
      ARCHIVED: 'Archived',
    };
    return labels[status] || status;
  }

  getStatusDotColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-400',
      ACTIVE: 'bg-purple-500',
      REJECTED: 'bg-red-500',
      COMPLETED: 'bg-blue-500',
      CLOSED: 'bg-gray-400',
      CANCELLED: 'bg-red-400',
      SUSPENDED: 'bg-amber-500',
      ARCHIVED: 'bg-slate-400',
    };
    return colors[status] || 'bg-gray-400';
  }

  getProgressBarColor(status: string, _progress: number): string {
    if (['REJECTED', 'CANCELLED', 'ARCHIVED', 'SUSPENDED'].includes(status)) {
      return 'bg-gray-300';
    }
    return 'bg-[#FF594B]';
  }

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
      CLOTHING: '#F3E8FF',
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
      CLOTHING: '👕',
      OTHER: '📦',
    };
    return emojis[category] || '📦';
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  openEdit(event: Event, campaign: BeneficiaryCampaignResponse): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/campaigns/edit', campaign.id], { state: { campaign } });
  }

  openDelete(event: Event, campaign: BeneficiaryCampaignResponse): void {
    event.stopPropagation();
    this.manageRequested.emit({ campaign, tab: 'delete' });
  }

  openUpdates(event: Event, campaign: BeneficiaryCampaignResponse): void {
    event.stopPropagation();
    this.manageRequested.emit({ campaign, tab: 'updates' });
  }

  openOverview(event: Event, campaign: BeneficiaryCampaignResponse): void {
    event.stopPropagation();
    this.manageRequested.emit({ campaign, tab: 'overview' });
  }

  openManage(event: Event, campaign: BeneficiaryCampaignResponse): void {
    event.stopPropagation();
    if (campaign.status === 'PENDING') {
      this.router.navigate(['/dashboard/campaigns/edit', campaign.id], { state: { campaign } });
      return;
    }
    const tab =
      campaign.status === 'ACTIVE'
        ? 'updates'
        : campaign.status === 'REJECTED'
          ? 'overview'
          : 'overview';
    this.manageRequested.emit({ campaign, tab });
  }

  getCarouselIndex(campaignId: string): number {
    return this.carouselIndices.get(campaignId) || 0;
  }

  setCarouselIndex(campaignId: string, index: number): void {
    this.carouselIndices.set(campaignId, index);
  }

  nextImage(campaignId: string, totalImages: number): void {
    const currentIndex = this.getCarouselIndex(campaignId);
    this.setCarouselIndex(campaignId, (currentIndex + 1) % totalImages);
  }

  previousImage(campaignId: string, totalImages: number): void {
    const currentIndex = this.getCarouselIndex(campaignId);
    this.setCarouselIndex(campaignId, (currentIndex - 1 + totalImages) % totalImages);
  }
}
