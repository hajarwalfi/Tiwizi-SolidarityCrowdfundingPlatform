import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../../core/services/auth.service';
import { AdminService, AdminActivity, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-overview-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview-page.component.html',
})
export class AdminOverviewPageComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  stats = signal<AdminStats | null>(null);
  recentActivities = signal<AdminActivity[]>([]);

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.profile.set(this.authService.getCurrentUser());
    this.loadStats();
    this.loadActivities();
  }

  private loadStats(): void {
    this.adminService.getStatistics().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  private loadActivities(): void {
    this.adminService.getRecentActivities().subscribe({
      next: (activities) =>
        this.recentActivities.set(
          [...activities]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3),
        ),
      error: (err) => console.error('Failed to load activities', err),
    });
  }

  goToActivities(): void { this.router.navigate(['/admin/activities']); }
  goToCampaigns(): void { this.router.navigate(['/admin/campaigns']); }
  goToUsers(): void { this.router.navigate(['/admin/users']); }
  goToReports(): void { this.router.navigate(['/admin/reports']); }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA').format(amount);
  }

  formatRelativeTime(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  getAvgDonation(): string {
    const s = this.stats();
    if (!s || !s.totalDonations) return '—';
    return this.formatAmount(s.totalAmountRaised / s.totalDonations) + ' MAD';
  }

  getActivityColors(type: AdminActivity['type']): { bg: string; text: string } {
    const map: Record<AdminActivity['type'], { bg: string; text: string }> = {
      NEW_CAMPAIGN:     { bg: 'bg-amber-50',  text: 'text-amber-500' },
      REPORT:           { bg: 'bg-red-50',    text: 'text-red-500' },
      NEW_USER:         { bg: 'bg-blue-50',   text: 'text-blue-500' },
      CAMPAIGN_CLOSING: { bg: 'bg-orange-50', text: 'text-orange-500' },
      CAMPAIGN_FUNDED:  { bg: 'bg-green-50',  text: 'text-green-500' },
    };
    return map[type] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };
  }
}
