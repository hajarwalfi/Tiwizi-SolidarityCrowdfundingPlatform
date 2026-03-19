import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { BeneficiaryCampaignResponse } from '../../../../core/models/beneficiary.model';
import { Donation, DonationStatus } from '../../../../core/models/donation.model';

@Component({
  selector: 'app-profile-activity',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './profile-activity.component.html',
})
export class ProfileActivityComponent implements OnChanges {
  @Input({ required: true }) profile!: UserProfileResponse;
  @Input() viewMode: 'public' | 'donor' | 'beneficiary' = 'donor';
  @Input() previewDonations: Donation[] = [];
  @Input() previewPayments: Donation[] = [];
  @Input() allPayments: Donation[] = [];
  @Input() previewCampaigns: BeneficiaryCampaignResponse[] = [];
  @Input() isLoadingDonations = false;
  @Input() isLoadingCampaigns = false;
  @Input() totalDonationCount = 0;
  @Input() totalCampaignCount = 0;

  @Output() viewModeChanged = new EventEmitter<'public' | 'donor' | 'beneficiary'>();

  monthlyBarData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: (ctx) => `${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} MAD` }
    }},
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#9CA3AF' } },
      y: { display: false, grid: { display: false } },
    },
  };

  ngOnChanges(): void {
    this.buildMonthlyChart();
  }

  private buildMonthlyChart(): void {
    const payments = (this.allPayments.length ? this.allPayments : this.previewPayments)
      .filter(d => d.status === DonationStatus.SUCCESS);

    const now = new Date();
    const months: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }

    const totals: Record<string, number> = {};
    months.forEach(m => (totals[m.key] = 0));
    payments.forEach(p => {
      const d = new Date(p.paidAt || p.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (totals[key] !== undefined) totals[key] += p.amount;
    });

    this.monthlyBarData = {
      labels: months.map(m => m.label),
      datasets: [{
        data: months.map(m => totals[m.key]),
        backgroundColor: months.map(m => totals[m.key] > 0 ? '#A3E635' : '#E5E7EB'),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      HEALTH: '#FEE2E2', EDUCATION: '#DBEAFE', HOUSING: '#FEF3C7',
      FOOD: '#FFEDD5', EMERGENCY: '#FFE4E6', ENVIRONMENT: '#D1FAE5',
      COMMUNITY: '#EDE9FE', DISABILITY: '#E0F2FE', CHILDREN: '#FCE7F3', OTHER: '#F3F4F6',
    };
    return colors[category] || '#F3F4F6';
  }

  getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      HEALTH: '❤️', EDUCATION: '📚', HOUSING: '🏠',
      FOOD: '🍎', EMERGENCY: '🚨', ENVIRONMENT: '🌱',
      COMMUNITY: '👥', DISABILITY: '♿', CHILDREN: '🌟', OTHER: '📦',
    };
    return emojis[category] || '📦';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-[#FEF3C7] text-[#92400E]',
      ACTIVE: 'bg-[#F3E8FF] text-[#7C3AED]',
      REJECTED: 'bg-[#FEE2E2] text-[#991B1B]',
      COMPLETED: 'bg-[#DBEAFE] text-[#1E40AF]',
      CLOSED: 'bg-[#F3F4F6] text-[#374151]',
      CANCELLED: 'bg-[#FEE2E2] text-[#991B1B]',
      SUSPENDED: 'bg-[#FEF3C7] text-[#92400E]',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected',
      COMPLETED: 'Completed', CLOSED: 'Completed', CANCELLED: 'Cancelled', SUSPENDED: 'Suspended',
    };
    return labels[status] || status;
  }

  getStatusDotColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-400', ACTIVE: 'bg-purple-500', REJECTED: 'bg-red-500',
      COMPLETED: 'bg-blue-500', CLOSED: 'bg-gray-400', CANCELLED: 'bg-red-400', SUSPENDED: 'bg-amber-500',
    };
    return colors[status] || 'bg-gray-400';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SUCCESS: 'Paid', PENDING: 'Pending', FAILED: 'Failed', REFUNDED: 'Refunded',
    };
    return labels[status] || status;
  }

  getPaymentStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      REFUNDED: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return classes[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getProgressBarColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-400', ACTIVE: 'bg-purple-500', REJECTED: 'bg-red-300',
      COMPLETED: 'bg-blue-500', CLOSED: 'bg-gray-400', CANCELLED: 'bg-red-300', SUSPENDED: 'bg-amber-500',
    };
    return colors[status] || 'bg-gray-400';
  }
}
