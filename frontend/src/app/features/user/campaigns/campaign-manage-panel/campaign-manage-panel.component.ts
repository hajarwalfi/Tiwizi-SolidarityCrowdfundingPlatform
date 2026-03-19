import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BeneficiaryService } from '../../../../core/services/beneficiary.service';
import {
  BeneficiaryCampaignResponse,
  CampaignUpdateResponse,
  UpdateCampaignRequest,
  CreateCampaignUpdateRequest,
} from '../../../../core/models/beneficiary.model';
import { CampaignCategory } from '../../../../core/models/campaign.model';
import { CAMPAIGN_CATEGORY_LABELS } from '../../../../shared/constants';

type PanelTab = 'overview' | 'edit' | 'updates';

@Component({
  selector: 'app-campaign-manage-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campaign-manage-panel.component.html',
})
export class CampaignManagePanelComponent {
  private _campaign: BeneficiaryCampaignResponse | null = null;

  @Input() set campaign(value: BeneficiaryCampaignResponse | null) {
    this._campaign = value;
    if (value) this.initPanel();
  }
  get campaign(): BeneficiaryCampaignResponse | null { return this._campaign; }

  @Output() closed = new EventEmitter<void>();
  @Output() campaignUpdated = new EventEmitter<BeneficiaryCampaignResponse>();
  @Output() campaignDeleted = new EventEmitter<string>();

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;

  activeTab: PanelTab = 'overview';

  editForm = {
    title: '',
    description: '',
    goalAmount: 0,
    category: '' as CampaignCategory,
    location: '',
    isUrgent: false,
    deadline: '',
  };
  editLoading = false;
  editError = '';
  editSuccess = false;

  updates: CampaignUpdateResponse[] = [];
  updatesLoading = false;
  updatesPage = 1;
  readonly updatesPageSize = 3;
  newUpdateContent = '';
  addUpdateLoading = false;
  addUpdateError = '';
  imageUploadLoading = false;

  get pagedUpdates(): CampaignUpdateResponse[] {
    const start = (this.updatesPage - 1) * this.updatesPageSize;
    return this.updates.slice(start, start + this.updatesPageSize);
  }

  get totalUpdatesPages(): number {
    return Math.ceil(this.updates.length / this.updatesPageSize);
  }

  showDeleteConfirm = false;
  deleteLoading = false;
  deleteError = '';

  showArchiveConfirm = false;
  archiveLoading = false;
  archiveError = '';

  unarchiveLoading = false;
  unarchiveError = '';

  readonly categories = Object.entries(CAMPAIGN_CATEGORY_LABELS)
    .filter(([k]) => k !== 'ALL')
    .map(([key, label]) => ({ key: key as CampaignCategory, label }));

  constructor(private beneficiaryService: BeneficiaryService) {}

  private initPanel(): void {
    if (!this.campaign) return;

    this.activeTab = 'overview';

    this.editForm = {
      title: this.campaign.title,
      description: this.campaign.description,
      goalAmount: this.campaign.goalAmount,
      category: this.campaign.category,
      location: this.campaign.location,
      isUrgent: this.campaign.isUrgent,
      deadline: this.campaign.deadline || '',
    };

    this.editError = '';
    this.editSuccess = false;
    this.updates = [];
    this.updatesPage = 1;
    this.newUpdateContent = '';
    this.addUpdateError = '';
    this.showDeleteConfirm = false;
    this.deleteError = '';
    this.clearEditor();

    this.loadUpdates();
  }

  private clearEditor(): void {
    setTimeout(() => {
      if (this.editorRef) {
        this.editorRef.nativeElement.innerHTML = '';
      }
    });
  }

  get canEdit(): boolean {
    return this.campaign?.status === 'PENDING';
  }

  get canAddUpdates(): boolean {
    return this.campaign?.status === 'ACTIVE' || this.campaign?.status === 'CLOSED';
  }

  get canDelete(): boolean {
    return this.campaign?.status === 'PENDING' || this.campaign?.status === 'REJECTED';
  }

  get canArchive(): boolean {
    const s = this.campaign?.status;
    return s === 'ACTIVE' || s === 'CLOSED' || s === 'COMPLETED';
  }

  get canUnarchive(): boolean {
    return this.campaign?.status === 'ARCHIVED';
  }

  get isEditorEmpty(): boolean {
    if (!this.editorRef) return !this.newUpdateContent.trim();
    const el = this.editorRef.nativeElement;
    const text = el.textContent?.trim() || '';
    const hasImage = !!el.querySelector('img');
    return text.length === 0 && !hasImage;
  }

  switchTab(tab: PanelTab): void {
    this.activeTab = tab;
  }

  loadUpdates(): void {
    if (!this.campaign) return;
    this.updatesLoading = true;
    this.beneficiaryService.getCampaignUpdates(this.campaign.id).subscribe({
      next: (updates) => {
        this.updates = updates;
        this.updatesLoading = false;
      },
      error: (err) => {
        this.updatesLoading = false;
        this.addUpdateError = err?.error?.message || 'Failed to load updates.';
      },
    });
  }

  onEditorInput(event: Event): void {
    this.newUpdateContent = (event.target as HTMLDivElement).innerHTML;
  }

  applyFormat(command: string): void {
    document.execCommand(command, false, undefined);
    this.editorRef.nativeElement.focus();
  }

  triggerImageUpload(): void {
    this.imageInputRef.nativeElement.click();
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.imageUploadLoading = true;
    this.addUpdateError = '';

    this.beneficiaryService.uploadUpdateImage(file).subscribe({
      next: (result) => {
        const editor = this.editorRef.nativeElement;
        editor.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${result.url}" class="update-img" alt="update photo">`,
        );
        this.newUpdateContent = editor.innerHTML;
        this.imageUploadLoading = false;
        input.value = '';
      },
      error: () => {
        this.imageUploadLoading = false;
        this.addUpdateError = 'Failed to upload image. Please try again.';
        input.value = '';
      },
    });
  }

  onSaveEdit(): void {
    if (!this.campaign) return;
    this.editLoading = true;
    this.editError = '';
    this.editSuccess = false;

    const request: UpdateCampaignRequest = {
      title: this.editForm.title,
      description: this.editForm.description,
      goalAmount: this.editForm.goalAmount,
      category: this.editForm.category,
      location: this.editForm.location,
      isUrgent: this.editForm.isUrgent,
      deadline: this.editForm.deadline || undefined,
    };

    this.beneficiaryService.updateCampaign(this.campaign.id, request).subscribe({
      next: (updated) => {
        this.editLoading = false;
        this.editSuccess = true;
        this.campaignUpdated.emit(updated);
        setTimeout(() => (this.editSuccess = false), 3000);
      },
      error: (err) => {
        this.editLoading = false;
        this.editError = err.error?.message || 'Failed to save changes.';
      },
    });
  }

  onAddUpdate(): void {
    if (!this.campaign || this.isEditorEmpty) return;
    this.addUpdateLoading = true;
    this.addUpdateError = '';

    const request: CreateCampaignUpdateRequest = { content: this.newUpdateContent };

    this.beneficiaryService.createCampaignUpdate(this.campaign.id, request).pipe(
      finalize(() => { this.addUpdateLoading = false; }),
    ).subscribe({
      next: () => {
        this.updatesPage = 1;
        this.newUpdateContent = '';
        if (this.editorRef) {
          this.editorRef.nativeElement.innerHTML = '';
        }
        this.loadUpdates();
      },
      error: (err) => {
        this.addUpdateError = err.error?.message || 'Failed to post update.';
      },
    });
  }

  onDeleteUpdate(updateId: string): void {
    if (!this.campaign) return;
    this.beneficiaryService.deleteCampaignUpdate(this.campaign.id, updateId).subscribe({
      next: () => {
        this.updates = this.updates.filter((u) => u.id !== updateId);
      },
    });
  }

  onDeleteCampaign(): void {
    if (!this.campaign) return;
    this.deleteLoading = true;
    this.deleteError = '';
    this.beneficiaryService.deleteCampaign(this.campaign.id).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.campaignDeleted.emit(this.campaign!.id);
        this.closed.emit();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteError = err.error?.message || 'Failed to delete campaign.';
      },
    });
  }

  onArchiveCampaign(): void {
    if (!this.campaign) return;
    this.archiveLoading = true;
    this.archiveError = '';
    this.beneficiaryService.archiveCampaign(this.campaign.id).subscribe({
      next: (updated) => {
        this.archiveLoading = false;
        this.showArchiveConfirm = false;
        this.campaignUpdated.emit(updated);
        this.closed.emit();
      },
      error: (err) => {
        this.archiveLoading = false;
        this.archiveError = err.error?.message || 'Failed to archive campaign.';
      },
    });
  }

  onUnarchiveCampaign(): void {
    if (!this.campaign) return;
    this.unarchiveLoading = true;
    this.unarchiveError = '';
    this.beneficiaryService.unarchiveCampaign(this.campaign.id).subscribe({
      next: (updated) => {
        this.unarchiveLoading = false;
        this.campaignUpdated.emit(updated);
        this.closed.emit();
      },
      error: (err) => {
        this.unarchiveLoading = false;
        this.unarchiveError = err.error?.message || 'Failed to unarchive campaign.';
      },
    });
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending Review', ACTIVE: 'Active', REJECTED: 'Rejected',
      COMPLETED: 'Completed', CLOSED: 'Closed', CANCELLED: 'Cancelled', SUSPENDED: 'Suspended', ARCHIVED: 'Archived',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      ACTIVE: 'bg-purple-100 text-purple-700',
      REJECTED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      CLOSED: 'bg-gray-100 text-gray-600',
      ARCHIVED: 'bg-slate-100 text-slate-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  }
}
