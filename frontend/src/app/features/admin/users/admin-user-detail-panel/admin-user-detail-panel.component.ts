import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminUser } from '../../../../core/models/admin.model';
import type { AdminUserDetail } from '../../../../core/models/admin.model';
import type { Campaign } from '../../../../core/models/campaign.model';
import type { Donation } from '../../../../core/models/donation.model';

@Component({
  selector: 'app-admin-user-detail-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-user-detail-panel.component.html',
})
export class AdminUserDetailPanelComponent implements OnChanges {
  @Input() user: AdminUser | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() banRequested = new EventEmitter<AdminUser>();
  @Output() unbanRequested = new EventEmitter<AdminUser>();

  detail = signal<AdminUserDetail | null>(null);
  isLoading = signal(false);
  activeTab = signal<'campaigns' | 'donations'>('campaigns');

  readonly pageSize = 5;
  campaignsPage = signal(1);
  donationsPage = signal(1);

  campaignsTotalPages = computed(() => Math.max(1, Math.ceil((this.detail()?.campaigns.length ?? 0) / this.pageSize)));
  donationsTotalPages = computed(() => Math.max(1, Math.ceil((this.detail()?.donations.length ?? 0) / this.pageSize)));

  pagedCampaigns = computed(() => {
    const all = this.detail()?.campaigns ?? [];
    const page = this.campaignsPage();
    return all.slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  pagedDonations = computed(() => {
    const all = this.detail()?.donations ?? [];
    const page = this.donationsPage();
    return all.slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  constructor(private adminService: AdminService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      if (this.user) {
        this.isLoading.set(true);
        this.detail.set(null);
        this.activeTab.set('campaigns');
        this.campaignsPage.set(1);
        this.donationsPage.set(1);
        this.adminService.getUserDetail(this.user.id).subscribe({
          next: (d) => { this.detail.set(d); this.isLoading.set(false); },
          error: () => this.isLoading.set(false),
        });
      } else {
        this.detail.set(null);
      }
    }
  }

  close(): void {
    this.closed.emit();
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(id: string): string {
    const colors = ['#FF594B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#65A30D'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      HEALTH: '#FEE2E2', EDUCATION: '#DBEAFE', HOUSING: '#FEF3C7',
      FOOD: '#FFEDD5', EMERGENCY: '#FFE4E6', ENVIRONMENT: '#D1FAE5',
      COMMUNITY: '#EDE9FE', DISABILITY: '#E0F2FE', CHILDREN: '#FCE7F3', OTHER: '#F3F4F6',
    };
    return colors[category] || '#F3F4F6';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      ACTIVE: 'bg-purple-100 text-purple-700',
      REJECTED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      SUSPENDED: 'bg-orange-100 text-orange-700',
      ARCHIVED: 'bg-slate-100 text-slate-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }

  getDonationStatusColor(status: string): string {
    const colors: Record<string, string> = {
      SUCCESS: 'bg-green-100 text-green-700',
      PENDING: 'bg-amber-100 text-amber-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }
}
