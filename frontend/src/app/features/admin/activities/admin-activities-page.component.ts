import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminActivity, PagedActivitiesResponse } from '../../../core/services/admin.service';

export interface ActivityGroup {
  dateLabel: string;
  items: AdminActivity[];
}

@Component({
  selector: 'app-admin-activities-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-activities-page.component.html',
})
export class AdminActivitiesPageComponent implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);
  total = signal(0);
  groupedActivities = signal<ActivityGroup[]>([]);
  currentPage = signal(0);   // 0-based (backend convention)
  totalPages = signal(1);
  pages = signal<number[]>([1]);

  readonly PAGE_SIZE = 15;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.loadPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadPage(page: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.adminService.getActivities(page, this.PAGE_SIZE).subscribe({
      next: (res: PagedActivitiesResponse) => {
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.currentPage.set(res.page);
        this.pages.set(Array.from({ length: res.totalPages }, (_, i) => i));
        this.groupedActivities.set(this.groupByDate(res.items));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[ActivitiesPage] API error:', err);
        this.error.set(`Erreur ${err?.status ?? ''}: impossible de charger les activités`);
        this.isLoading.set(false);
      },
    });
  }

  private groupByDate(items: AdminActivity[]): ActivityGroup[] {
    const map = new Map<string, AdminActivity[]>();
    for (const act of items) {
      const label = this.toDateLabel(act.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(act);
    }
    return Array.from(map.entries()).map(([dateLabel, acts]) => ({ dateLabel, items: acts }));
  }

  private toDateLabel(iso: string | any): string {
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return 'Unknown date';
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor(
        (todayStart.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000,
      );
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays <= 7) return 'Last week';
      if (date.getFullYear() === now.getFullYear()) return 'Earlier this year';
      return 'A long time ago';
    } catch {
      return 'Unknown date';
    }
  }

  formatDate(iso: string | any): string {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  }

  formatTime(iso: string | any): string {
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }

  getActivityColors(type: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      NEW_CAMPAIGN:     { bg: 'bg-amber-50',  text: 'text-amber-500' },
      REPORT:           { bg: 'bg-red-50',    text: 'text-red-500' },
      NEW_USER:         { bg: 'bg-blue-50',   text: 'text-blue-500' },
      CAMPAIGN_CLOSING: { bg: 'bg-orange-50', text: 'text-orange-500' },
      CAMPAIGN_FUNDED:  { bg: 'bg-green-50',  text: 'text-green-500' },
    };
    return map[type] ?? { bg: 'bg-gray-100', text: 'text-gray-500' };
  }

  getBadgeColors(type: string): string {
    const map: Record<string, string> = {
      NEW_CAMPAIGN:     'bg-amber-50 text-amber-600 border border-amber-200',
      REPORT:           'bg-red-50 text-red-600 border border-red-200',
      NEW_USER:         'bg-blue-50 text-blue-600 border border-blue-200',
      CAMPAIGN_CLOSING: 'bg-orange-50 text-orange-600 border border-orange-200',
      CAMPAIGN_FUNDED:  'bg-green-50 text-green-600 border border-green-200',
    };
    return map[type] ?? 'bg-gray-100 text-gray-500';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      NEW_CAMPAIGN:     'Campaign',
      REPORT:           'Report',
      NEW_USER:         'New user',
      CAMPAIGN_CLOSING: 'Near goal',
      CAMPAIGN_FUNDED:  'Goal reached',
    };
    return map[type] ?? type;
  }
}
