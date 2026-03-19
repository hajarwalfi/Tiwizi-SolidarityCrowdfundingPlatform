import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { Campaign } from '../../../../core/models/campaign.model';

type CampaignFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';

interface AdminCampaignItem {
  id: string;
  title: string;
  category: string;
  status: string;
  creatorName: string;
  goalAmount: number;
  amountCollected: number;
  createdAt: string;
}

@Component({
  selector: 'app-admin-campaigns-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-campaigns-page.component.html',
})
export class AdminCampaignsPageComponent implements OnInit {
  readonly pageSize = 10;

  isLoading = signal(true);
  campaigns = signal<AdminCampaignItem[]>([]);
  activeFilter = signal<CampaignFilter>('ALL');
  currentPage = signal(0);
  searchQuery = signal('');

  filteredCampaigns = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = q
      ? this.campaigns().filter(c => c.title.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q))
      : this.campaigns();
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  totalPages = computed(() => Math.ceil(this.filteredCampaigns().length / this.pageSize));
  pagedCampaigns = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredCampaigns().slice(start, start + this.pageSize);
  });
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  filters: { label: string; value: CampaignFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status') as CampaignFilter | null;
    if (status && this.filters.some(f => f.value === status)) {
      this.activeFilter.set(status);
    }
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    this.isLoading.set(true);
    const filter = this.activeFilter();
    const status = filter === 'ALL' ? undefined : filter;
    this.adminService.getAllCampaigns(status).subscribe({
      next: (campaigns: Campaign[]) => {
        this.currentPage.set(0);
        this.campaigns.set(campaigns.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category as string,
          status: c.status as string,
          creatorName: c.creatorName ?? '',
          goalAmount: Number(c.goalAmount),
          amountCollected: Number(c.amountCollected),
          createdAt: c.createdAt as string,
        })));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: CampaignFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(0);
    this.router.navigate([], {
      queryParams: { status: filter === 'ALL' ? null : filter },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.loadCampaigns();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  minVal(a: number, b: number): number {
    return Math.min(a, b);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA').format(amount);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
      REJECTED: 'bg-red-50 text-red-600 border border-red-200',
      SUSPENDED: 'bg-orange-50 text-orange-600 border border-orange-200',
      ARCHIVED: 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }
}
