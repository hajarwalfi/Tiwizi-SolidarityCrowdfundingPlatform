import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { CampaignService } from '../../../../core/services/campaign.service';
import { AdminService } from '../../../../core/services/admin.service';
import { Campaign } from '../../../../core/models/campaign.model';

@Component({
  selector: 'app-admin-campaign-review-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-campaign-review-page.component.html',
})
export class AdminCampaignReviewPageComponent implements OnInit {
  campaign = signal<Campaign | null>(null);
  isLoading = signal(true);
  isActing = signal(false);
  error = signal<string | null>(null);
  showRejectInput = signal(false);
  showSuspendInput = signal(false);
  rejectReason = '';
  suspendReason = '';
  docIndex = signal(0);
  adminDocIndex = signal(0);

  private readonly PUBLIC_DOC_TYPES = ['COVER_IMAGE', 'CAMPAIGN_IMAGE', 'CAMPAIGN_DOC'];
  private readonly ADMIN_DOC_TYPES = ['ID_CARD', 'RIB_DOC', 'PROOF_DOC'];

  publicDocs() {
    return (this.campaign()?.documents ?? []).filter(d => this.PUBLIC_DOC_TYPES.includes(d.documentType));
  }

  adminDocs() {
    return (this.campaign()?.documents ?? []).filter(d => this.ADMIN_DOC_TYPES.includes(d.documentType));
  }

  prevDoc(): void {
    this.docIndex.update(i => i - 1);
  }

  nextDoc(total: number): void {
    this.docIndex.update(i => i + 1);
  }

  prevAdminDoc(): void {
    this.adminDocIndex.update(i => i - 1);
  }

  nextAdminDoc(total: number): void {
    this.adminDocIndex.update(i => i + 1);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private campaignService: CampaignService,
    private adminService: AdminService,
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.campaignService.getCampaignById(id).subscribe({
        next: (data) => {
          this.campaign.set(data);
          this.docIndex.set(0);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Could not load campaign.');
          this.isLoading.set(false);
        },
      });
    }
  }

  approve(): void {
    const id = this.campaign()?.id;
    if (!id) return;
    this.isActing.set(true);
    this.adminService.approveCampaign(id).subscribe({
      next: () => this.location.back(),
      error: () => this.isActing.set(false),
    });
  }

  submitReject(): void {
    const id = this.campaign()?.id;
    if (!id) return;
    this.isActing.set(true);
    this.adminService.rejectCampaign(id, { rejectionReason: this.rejectReason }).subscribe({
      next: () => this.location.back(),
      error: () => this.isActing.set(false),
    });
  }

  submitSuspend(): void {
    const id = this.campaign()?.id;
    if (!id) return;
    this.isActing.set(true);
    this.adminService.suspendCampaign(id, { rejectionReason: this.suspendReason }).subscribe({
      next: () => this.location.back(),
      error: () => this.isActing.set(false),
    });
  }

  unsuspend(): void {
    const id = this.campaign()?.id;
    if (!id) return;
    this.isActing.set(true);
    this.adminService.unsuspendCampaign(id).subscribe({
      next: () => this.location.back(),
      error: () => this.isActing.set(false),
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA').format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(date));
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

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isPdf(url: string): boolean {
    return /\.pdf$/i.test(url);
  }
}
