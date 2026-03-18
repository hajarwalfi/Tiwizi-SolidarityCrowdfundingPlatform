import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Campaign, CampaignUpdate } from '../../../../../core/models/campaign.model';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-campaign-info-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, LoadingSpinnerComponent],
  templateUrl: './campaign-info-panel.component.html',
})
export class CampaignInfoPanelComponent {
  @Input({ required: true }) campaign!: Campaign;
  @Input() updates: CampaignUpdate[] = [];
  @Input() activeTab: 'details' | 'updates' | 'donors' = 'details';
  @Input() isLoadingUpdates = false;

  @Output() tabChanged = new EventEmitter<'details' | 'updates' | 'donors'>();

  readonly categoryLabels: Record<string, string> = {
    HEALTH: 'Health',
    EDUCATION: 'Education',
    HOUSING: 'Housing',
    FOOD: 'Food',
    EMERGENCY: 'Emergency',
    ENVIRONMENT: 'Environment',
    COMMUNITY: 'Community',
    DISABILITY: 'Disability',
    CHILDREN: 'Children',
    OTHER: 'Other',
  };

  carouselIndex = 0;

  get supportingDocs() {
    return (this.campaign.documents ?? []).filter(d => d.documentType === 'CAMPAIGN_DOC');
  }

  get displayImages(): string[] {
    const docs = this.campaign.documents ?? [];
    const cover = docs.find(d => d.documentType === 'COVER_IMAGE');
    const extras = docs.filter(d => d.documentType === 'CAMPAIGN_IMAGE').map(d => d.fileUrl);
    return cover ? [cover.fileUrl, ...extras] : extras;
  }

  prevImage(): void {
    const len = this.displayImages.length;
    this.carouselIndex = (this.carouselIndex - 1 + len) % len;
  }

  nextImage(): void {
    this.carouselIndex = (this.carouselIndex + 1) % this.displayImages.length;
  }

  goToImage(i: number): void {
    this.carouselIndex = i;
  }

  donorsPage = 0;
  readonly donorsPageSize = 8;

  get pagedDonors() {
    const donors = this.campaign.donations ?? [];
    const start = this.donorsPage * this.donorsPageSize;
    return donors.slice(start, start + this.donorsPageSize);
  }

  get donorsTotalPages() {
    return Math.ceil((this.campaign.donations?.length ?? 0) / this.donorsPageSize);
  }

  updatesPage = 0;
  readonly updatesPageSize = 3;

  get pagedUpdates() {
    const start = this.updatesPage * this.updatesPageSize;
    return this.updates.slice(start, start + this.updatesPageSize);
  }

  get updatesTotalPages() {
    return Math.ceil(this.updates.length / this.updatesPageSize);
  }

  switchTab(tab: 'details' | 'updates' | 'donors'): void {
    if (tab === 'donors') this.donorsPage = 0;
    if (tab === 'updates') this.updatesPage = 0;
    this.tabChanged.emit(tab);
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
}
