import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CampaignService,
  CampaignSearchParams,
} from '../../../../../core/services/campaign.service';
import {
  Campaign,
  CampaignCategory,
  CampaignStatus,
} from '../../../../../core/models/campaign.model';
import { debounceTime, Subject } from 'rxjs';
import { CampaignFiltersComponent } from '../../components/campaign-filters/campaign-filters.component';
import { CampaignCardComponent } from '../../../../../shared/components/campaign-card/campaign-card.component';

@Component({
  selector: 'app-campaigns-list-page',
  standalone: true,
  imports: [CommonModule, CampaignFiltersComponent, CampaignCardComponent],
  templateUrl: './campaigns-list-page.component.html',
})
export class CampaignsListPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sentinel') sentinelRef!: ElementRef;

  campaigns = signal<Campaign[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false);
  error = signal<string | null>(null);
  hasMore = signal<boolean>(false);
  totalElements = signal<number>(0);

  selectedCategory = signal<CampaignCategory | null>(null);
  showUrgentOnly = signal<boolean>(false);
  showDeadlineSoon = signal<boolean>(false);
  showNearlyFunded = signal<boolean>(false);

  private currentPage = 0;
  private readonly pageSize = 12;
  private searchKeyword = '';
  private locationFilter = '';
  private searchSubject = new Subject<void>();
  private observer: IntersectionObserver | null = null;

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.loadCampaigns(true);
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.resetAndLoad());
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.isLoadingMore() && !this.isLoading()) {
          this.loadMore();
        }
      },
      { threshold: 0 }
    );
    this.observeSentinel();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.searchSubject.complete();
  }

  private observeSentinel(): void {
    if (this.observer && this.sentinelRef) {
      this.observer.unobserve(this.sentinelRef.nativeElement);
      this.observer.observe(this.sentinelRef.nativeElement);
    }
  }

  private resetAndLoad(): void {
    this.currentPage = 0;
    this.campaigns.set([]);
    this.loadCampaigns(true);
  }

  loadCampaigns(replace = false): void {
    replace ? this.isLoading.set(true) : this.isLoadingMore.set(true);
    this.error.set(null);

    const searchParams: CampaignSearchParams = {
      keyword: this.searchKeyword || undefined,
      location: this.locationFilter || undefined,
      category: this.selectedCategory() || undefined,
      status: CampaignStatus.ACTIVE,
      isUrgent: this.showUrgentOnly() || undefined,
      deadlineSoon: this.showDeadlineSoon() || undefined,
      nearlyFunded: this.showNearlyFunded() || undefined,
      page: this.currentPage,
      size: this.pageSize,
    };

    this.campaignService.searchCampaigns(searchParams).subscribe({
      next: (response) => {
        const incoming = response.content || [];
        replace ? this.campaigns.set(incoming) : this.campaigns.update(existing => [...existing, ...incoming]);
        this.totalElements.set(response.page.totalElements);
        this.hasMore.set(this.currentPage < response.page.totalPages - 1);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        setTimeout(() => this.observeSentinel(), 100);
      },
      error: () => {
        this.error.set('Unable to load campaigns. Please try again.');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  private loadMore(): void {
    this.currentPage++;
    this.loadCampaigns(false);
  }

  onSearchChanged(keyword: string): void {
    this.searchKeyword = keyword;
    this.searchSubject.next();
  }

  onLocationChanged(location: string): void {
    this.locationFilter = location;
    this.resetAndLoad();
  }

  onCategoryChanged(category: CampaignCategory | null): void {
    this.selectedCategory.set(category);
    this.resetAndLoad();
  }

  onUrgentToggled(): void {
    this.showUrgentOnly.set(!this.showUrgentOnly());
    this.resetAndLoad();
  }

  onDeadlineSoonToggled(): void {
    this.showDeadlineSoon.set(!this.showDeadlineSoon());
    this.resetAndLoad();
  }

  onNearlyFundedToggled(): void {
    this.showNearlyFunded.set(!this.showNearlyFunded());
    this.resetAndLoad();
  }

  onFiltersCleared(): void {
    this.searchKeyword = '';
    this.locationFilter = '';
    this.selectedCategory.set(null);
    this.showUrgentOnly.set(false);
    this.showDeadlineSoon.set(false);
    this.showNearlyFunded.set(false);
    this.resetAndLoad();
  }
}
