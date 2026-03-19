import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { Donation, DonationStatus } from '../../../../core/models/donation.model';
import { BeneficiaryCampaignResponse } from '../../../../core/models/beneficiary.model';
import { CampaignStatus } from '../../../../core/models/campaign.model';

const SLICE_COLORS = ['#FF594B', '#A3E635', '#60A5FA', '#FBBF24', '#A855F7'];
const SLICE_COLORS_HOVER = ['#e84d40', '#84cc16', '#3b82f6', '#f59e0b', '#9333ea'];

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './profile-card.component.html',
})
export class ProfileCardComponent implements OnChanges {
  @Input({ required: true }) profile!: UserProfileResponse;
  @Input() viewMode: 'public' | 'donor' | 'beneficiary' = 'donor';
  @Input() donations: Donation[] = [];
  @Input() campaigns: BeneficiaryCampaignResponse[] = [];

  donorChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };
  beneficiaryChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };

  // Donor per-campaign breakdown for legend
  donorLegend: { label: string; color: string; amount: number }[] = [];

  get totalDonated(): number {
    return this.donations
      .filter(d => d.status === DonationStatus.SUCCESS)
      .reduce((sum, d) => sum + d.amount, 0);
  }

  get uniqueCampaignsDonatedTo(): number {
    return new Set(
      this.donations.filter(d => d.status === DonationStatus.SUCCESS).map(d => d.campaignId)
    ).size;
  }

  get totalAmountCollected(): number {
    return this.campaigns.reduce((sum, c) => sum + (c.amountCollected || 0), 0);
  }

  get totalGoalAmount(): number {
    return this.campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0);
  }

  // Sum per-campaign remainders so overfunded campaigns don't cancel underfunded ones
  get remainingAmount(): number {
    return this.campaigns.reduce(
      (sum, c) => sum + Math.max(0, (c.goalAmount || 0) - (c.amountCollected || 0)),
      0
    );
  }

  get overallProgressPercent(): number {
    if (this.totalGoalAmount === 0) return 0;
    return Math.round((this.totalAmountCollected / this.totalGoalAmount) * 100);
  }

  get activeCampaignsCount(): number {
    return this.campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length;
  }

  get completedCampaignsCount(): number {
    return this.campaigns.filter(c => c.status === CampaignStatus.COMPLETED).length;
  }

  get totalDonorsCount(): number {
    return this.campaigns.reduce((sum, c) => sum + c.donorCount, 0);
  }

  ngOnChanges(): void {
    this.buildDonorChart();
    this.buildBeneficiaryChart();
  }

  private buildDonorChart(): void {
    // Aggregate successful donations per campaign
    const byTitle = new Map<string, number>();
    for (const d of this.donations.filter(d => d.status === DonationStatus.SUCCESS)) {
      const key = d.campaignTitle || 'Campagne';
      byTitle.set(key, (byTitle.get(key) || 0) + d.amount);
    }

    if (byTitle.size === 0) {
      this.donorLegend = [];
      this.donorChartData = {
        labels: ['No donations'],
        datasets: [{ data: [1], backgroundColor: ['#E5E7EB'], borderWidth: 0 }],
      };
      return;
    }

    const entries = Array.from(byTitle.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.donorLegend = entries.map(([label, amount], i) => ({
      label,
      amount,
      color: SLICE_COLORS[i],
    }));

    this.donorChartData = {
      labels: entries.map(([title, amount]) => `${title} — ${this.formatAmount(amount)} MAD`),
      datasets: [{
        data: entries.map(([, amount]) => amount),
        backgroundColor: entries.map((_, i) => SLICE_COLORS[i]),
        hoverBackgroundColor: entries.map((_, i) => SLICE_COLORS_HOVER[i]),
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }

  private buildBeneficiaryChart(): void {
    const collected = this.totalAmountCollected;
    const remaining = this.remainingAmount;
    const goalReached = remaining === 0 && this.totalGoalAmount > 0;

    if (this.totalGoalAmount === 0) {
      this.beneficiaryChartData = {
        labels: ['No goal defined'],
        datasets: [{ data: [1], backgroundColor: ['#E5E7EB'], borderWidth: 0 }],
      };
      return;
    }

    this.beneficiaryChartData = {
      labels: [
        `Total collected — ${this.formatAmount(collected)} MAD`,
        `Remaining — ${this.formatAmount(remaining)} MAD`,
      ],
      datasets: [{
        data: [collected || 0.001, remaining],
        backgroundColor: [goalReached ? '#22C55E' : '#FF594B', '#E5E7EB'],
        hoverBackgroundColor: [goalReached ? '#16a34a' : '#e84d40', '#D1D5DB'],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    };
  }

  public chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#1c1c1c',
        padding: 12,
        titleFont: { family: 'serif', size: 13 },
        bodyFont: { family: 'sans-serif', size: 11 },
        displayColors: true,
        cornerRadius: 8,
      },
    },
  };

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }
}
