import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CampaignService } from '../../../../../core/services/campaign.service';
import { Campaign, CampaignUpdate } from '../../../../../core/models/campaign.model';
import { DonationModalComponent } from '../../../../../features/user/donations/donation-modal/donation-modal.component';
import { ReportModalComponent } from '../../components/report-modal/report-modal.component';
import { CampaignInfoPanelComponent } from '../../components/campaign-info-panel/campaign-info-panel.component';
import { CampaignDonationSidebarComponent } from '../../components/campaign-donation-sidebar/campaign-donation-sidebar.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-campaign-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DonationModalComponent,
    ReportModalComponent,
    CampaignInfoPanelComponent,
    CampaignDonationSidebarComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './campaign-details-page.component.html',
})
export class CampaignDetailsPageComponent implements OnInit {
  campaign = signal<Campaign | null>(null);
  updates = signal<CampaignUpdate[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingUpdates = signal<boolean>(false);
  error = signal<string | null>(null);
  isSuspended = signal<boolean>(false);
  isDonationModalOpen = signal<boolean>(false);
  isReportModalOpen = signal<boolean>(false);
  isShareModalOpen = signal<boolean>(false);
  copySuccess = signal<boolean>(false);
  activeTab = signal<'details' | 'updates' | 'donors'>('details');

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
  ) {
    effect(() => {
      document.body.classList.toggle('overflow-hidden', this.isShareModalOpen());
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCampaign(id);
    } else {
      this.error.set('Campaign not found.');
      this.isLoading.set(false);
    }
  }

  loadCampaign(id: string): void {
    this.isLoading.set(true);
    this.campaignService.getCampaignById(id).subscribe({
      next: (data) => {
        this.campaign.set(data);
        this.isLoading.set(false);
        this.loadUpdates(id);
      },
      error: (err) => {
        if (err?.status === 403) {
          this.isSuspended.set(true);
        } else {
          this.error.set('Unable to load the details of this campaign.');
        }
        this.isLoading.set(false);
      },
    });
  }

  loadUpdates(id: string): void {
    this.isLoadingUpdates.set(true);
    this.campaignService.getCampaignUpdates(id).subscribe({
      next: (data) => {
        this.updates.set(data);
        this.isLoadingUpdates.set(false);
      },
      error: () => this.isLoadingUpdates.set(false),
    });
  }

  onDonationSuccess(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCampaign(id);
  }

  shareCampaign(platform: string): void {
    const url = window.location.href;
    const title = this.campaign()?.title ?? '';
    const text = `Support this cause on Tiwizi: ${title}`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          this.copySuccess.set(true);
          setTimeout(() => this.copySuccess.set(false), 2000);
        });
        this.isShareModalOpen.set(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    this.isShareModalOpen.set(false);
  }
}
