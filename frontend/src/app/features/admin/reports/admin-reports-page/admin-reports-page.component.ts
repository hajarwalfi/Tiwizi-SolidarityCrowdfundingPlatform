import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminReport, ReportStatus } from '../../../../core/models/admin.model';

type ReportFilter = 'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED';
type ReportTypeFilter = 'ALL' | 'CAMPAIGN' | 'USER';

@Component({
  selector: 'app-admin-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports-page.component.html',
})
export class AdminReportsPageComponent implements OnInit {
  isLoading = signal(true);
  reports = signal<AdminReport[]>([]);
  activeFilter = signal<ReportFilter>('ALL');
  activeTypeFilter = signal<ReportTypeFilter>('ALL');
  currentPage = signal(1);
  readonly pageSize = 10;

  statusFilters: { label: string; value: ReportFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  typeFilters: { label: string; value: ReportTypeFilter }[] = [
    { label: 'All types', value: 'ALL' },
    { label: 'Campaigns', value: 'CAMPAIGN' },
    { label: 'Users', value: 'USER' },
  ];

  filteredReports = computed(() => {
    let list = this.reports();
    const status = this.activeFilter();
    const type = this.activeTypeFilter();
    if (status !== 'ALL') list = list.filter(r => r.status === status);
    if (type !== 'ALL') list = list.filter(r => r.reportType === type);
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredReports().length / this.pageSize)));

  paginatedReports = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredReports().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  });

  setFilter(value: ReportFilter): void {
    this.activeFilter.set(value);
    this.currentPage.set(1);
  }

  setTypeFilter(value: ReportTypeFilter): void {
    this.activeTypeFilter.set(value);
    this.currentPage.set(1);
  }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllReports().subscribe({
      next: (reports) => { this.reports.set(reports); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  suspendCampaign(report: AdminReport): void {
    const reason = report.description || `Reported for ${this.getReasonLabel(report.reason)}`;
    this.adminService.suspendCampaignFromReport(report.id, reason).subscribe({
      next: () => this.reports.update(list =>
        list.map(r => r.id === report.id ? { ...r, status: 'RESOLVED' as ReportStatus } : r)
      ),
    });
  }

  banUser(report: AdminReport): void {
    this.adminService.banUserFromReport(report.id).subscribe({
      next: () => this.reports.update(list =>
        list.map(r => r.id === report.id ? { ...r, status: 'RESOLVED' as ReportStatus } : r)
      ),
    });
  }

  dismiss(reportId: string): void {
    this.adminService.dismissReport(reportId).subscribe({
      next: () => this.reports.update(list =>
        list.map(r => r.id === reportId ? { ...r, status: 'REJECTED' as ReportStatus } : r)
      ),
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      REVIEWED: 'bg-blue-50 text-blue-700 border border-blue-200',
      RESOLVED: 'bg-green-50 text-green-700 border border-green-200',
      REJECTED: 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  getReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      SPAM: 'Spam', FRAUD: 'Fraud', INAPPROPRIATE: 'Inappropriate',
      DUPLICATE: 'Duplicate', FALSE_INFO: 'False info', OTHER: 'Other',
    };
    return labels[reason] ?? reason;
  }
}
