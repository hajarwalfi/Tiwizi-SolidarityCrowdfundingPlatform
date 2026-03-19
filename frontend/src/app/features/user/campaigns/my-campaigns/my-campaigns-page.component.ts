import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BeneficiaryService } from '../../../../core/services/beneficiary.service';
import { DonationService } from '../../../../core/services/donation.service';
import { CampaignService } from '../../../../core/services/campaign.service';
import { BeneficiaryCampaignResponse } from '../../../../core/models/beneficiary.model';
import { Campaign } from '../../../../core/models/campaign.model';
import { Donation } from '../../../../core/models/donation.model';
import { BeneficiaryCampaignsTabComponent } from '../beneficiary-campaigns-tab/beneficiary-campaigns-tab.component';
import { DonorCampaignsTabComponent } from '../donor-campaigns-tab/donor-campaigns-tab.component';
import { CampaignManagePanelComponent } from '../campaign-manage-panel/campaign-manage-panel.component';

export interface DonorCampaignView {
  campaignId: string;
  campaignTitle: string;
  totalDonated: number;
  donationCount: number;
  lastDonationDate: string;
  campaign?: Campaign;
}

@Component({
  selector: 'app-my-campaigns-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BeneficiaryCampaignsTabComponent, DonorCampaignsTabComponent, CampaignManagePanelComponent],
  templateUrl: './my-campaigns-page.component.html'
})
export class MyCampaignsPageComponent implements OnInit {
  viewMode = signal<'donor' | 'beneficiary'>('beneficiary');

  beneficiaryCampaigns = signal<BeneficiaryCampaignResponse[]>([]);
  isLoadingBeneficiary = signal<boolean>(false);
  beneficiaryLoaded = signal<boolean>(false);

  donorCampaigns = signal<DonorCampaignView[]>([]);
  isLoadingDonor = signal<boolean>(false);
  donorLoaded = signal<boolean>(false);

  activeFilter = signal<string>('ALL');
  searchQuery = signal<string>('');
  managedCampaign = signal<BeneficiaryCampaignResponse | null>(null);
  managedTab = signal<string>('');

  readonly pageSize = 8;
  beneficiaryPage = signal<number>(1);
  donorPage = signal<number>(1);

  filteredBeneficiaryCampaigns = computed(() => {
    const filter = this.activeFilter();
    const q = this.searchQuery().toLowerCase().trim();
    let result = this.beneficiaryCampaigns();
    if (filter === 'ACTIVE') result = result.filter(c => c.status === 'ACTIVE');
    else if (filter === 'COMPLETED') result = result.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED');
    else if (filter !== 'ALL') result = result.filter(c => c.status === filter);
    if (q) result = result.filter(c => c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    return result;
  });

  paginatedBeneficiaryCampaigns = computed(() => {
    const start = (this.beneficiaryPage() - 1) * this.pageSize;
    return this.filteredBeneficiaryCampaigns().slice(start, start + this.pageSize);
  });

  beneficiaryTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredBeneficiaryCampaigns().length / this.pageSize)));

  paginatedDonorCampaigns = computed(() => {
    const start = (this.donorPage() - 1) * this.pageSize;
    return this.donorCampaigns().slice(start, start + this.pageSize);
  });

  donorTotalPages = computed(() => Math.max(1, Math.ceil(this.donorCampaigns().length / this.pageSize)));

  constructor(
    private beneficiaryService: BeneficiaryService,
    private donationService: DonationService,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaryCampaigns();
  }

  setViewMode(mode: 'donor' | 'beneficiary'): void {
    this.viewMode.set(mode);
    if (mode === 'beneficiary' && !this.beneficiaryLoaded()) this.loadBeneficiaryCampaigns();
    if (mode === 'donor' && !this.donorLoaded()) this.loadDonorCampaigns();
  }

  onFilterChanged(filter: string): void {
    this.activeFilter.set(filter);
    this.beneficiaryPage.set(1);
  }

  onSearchChanged(query: string): void {
    this.searchQuery.set(query);
    this.beneficiaryPage.set(1);
  }

  loadBeneficiaryCampaigns(): void {
    this.isLoadingBeneficiary.set(true);
    this.beneficiaryService.getMyCampaigns().subscribe({
      next: (campaigns) => {
        this.beneficiaryCampaigns.set(campaigns);
        this.isLoadingBeneficiary.set(false);
        this.beneficiaryLoaded.set(true);
      },
      error: () => this.isLoadingBeneficiary.set(false)
    });
  }

  loadDonorCampaigns(): void {
    this.isLoadingDonor.set(true);
    this.donationService.getMyDonations().subscribe({
      next: (donations) => {
        const campaignMap = new Map<string, DonorCampaignView>();
        for (const d of donations) {
          if (campaignMap.has(d.campaignId)) {
            const existing = campaignMap.get(d.campaignId)!;
            existing.totalDonated += d.amount;
            existing.donationCount++;
            if (d.createdAt > existing.lastDonationDate) existing.lastDonationDate = d.createdAt;
          } else {
            campaignMap.set(d.campaignId, { campaignId: d.campaignId, campaignTitle: d.campaignTitle, totalDonated: d.amount, donationCount: 1, lastDonationDate: d.createdAt });
          }
        }
        const views = Array.from(campaignMap.values());
        if (views.length === 0) {
          this.donorCampaigns.set([]);
          this.isLoadingDonor.set(false);
          this.donorLoaded.set(true);
          return;
        }
        let loaded = 0;
        for (const view of views) {
          this.campaignService.getCampaignById(view.campaignId).subscribe({
            next: (campaign) => {
              view.campaign = campaign;
              if (++loaded === views.length) { this.donorCampaigns.set(views); this.isLoadingDonor.set(false); this.donorLoaded.set(true); }
            },
            error: () => {
              if (++loaded === views.length) { this.donorCampaigns.set(views); this.isLoadingDonor.set(false); this.donorLoaded.set(true); }
            }
          });
        }
      },
      error: () => this.isLoadingDonor.set(false)
    });
  }

  onManageRequested(event: { campaign: BeneficiaryCampaignResponse; tab: string }): void {
    this.managedTab.set(event.tab);
    this.managedCampaign.set(event.campaign);
  }

  onCampaignUpdated(updated: BeneficiaryCampaignResponse): void {
    this.beneficiaryCampaigns.update((list) =>
      list.map((c) => (c.id === updated.id ? updated : c))
    );
    this.managedCampaign.set(updated);
  }

  onCampaignDeleted(id: string): void {
    this.beneficiaryCampaigns.update((list) => list.filter((c) => c.id !== id));
    this.managedCampaign.set(null);
  }
}
