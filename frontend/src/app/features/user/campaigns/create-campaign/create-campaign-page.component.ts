import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CampaignService } from '../../../../core/services/campaign.service';
import { BeneficiaryService } from '../../../../core/services/beneficiary.service';
import { BeneficiaryCampaignDocument } from '../../../../core/models/beneficiary.model';
import { CampaignCategory } from '../../../../core/models/campaign.model';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-create-campaign-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent],
  templateUrl: './create-campaign-page.component.html'
})
export class CreateCampaignPageComponent implements OnInit {
  currentStep = signal<number>(1);
  totalSteps = 7;
  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);

  // Step 4: Media uploads
  coverImagePreview = signal<string | null>(null);
  coverImageFile = signal<File | null>(null);
  campaignImages = signal<{ file: File; preview: string }[]>([]);
  campaignDocFiles = signal<File[]>([]);

  // Step 6: Proof uploads
  idCardFile = signal<File | null>(null);
  idCardPreview = signal<string | null>(null);
  ribDocFile = signal<File | null>(null);
  ribDocPreview = signal<string | null>(null);
  additionalProofFiles = signal<{ file: File; preview: string | null }[]>([]);
  proofStepAttempted = signal<boolean>(false);

  // Step 7: Carousel
  carouselIndex = signal<number>(0);

  // Edit mode
  editMode = signal<boolean>(false);
  editCampaignId = signal<string | null>(null);
  isLoadingCampaign = signal<boolean>(false);

  // Existing documents (edit mode — loaded from API)
  existingCoverImage = signal<BeneficiaryCampaignDocument | null>(null);
  existingCampaignImages = signal<BeneficiaryCampaignDocument[]>([]);
  existingCampaignDocs = signal<BeneficiaryCampaignDocument[]>([]);
  existingIdCard = signal<BeneficiaryCampaignDocument | null>(null);
  existingRibDoc = signal<BeneficiaryCampaignDocument | null>(null);
  existingProofDocs = signal<BeneficiaryCampaignDocument[]>([]);

  campaignForm: FormGroup;

  categories = [
    { value: CampaignCategory.HEALTH,      label: 'Health',      iconId: 'health',      iconBg: 'bg-red-50',    activeBg: 'bg-red-100',    iconColor: 'text-red-500',    dotColor: 'bg-red-400'    },
    { value: CampaignCategory.EDUCATION,   label: 'Education',   iconId: 'education',   iconBg: 'bg-blue-50',   activeBg: 'bg-blue-100',   iconColor: 'text-blue-500',   dotColor: 'bg-blue-400'   },
    { value: CampaignCategory.HOUSING,     label: 'Housing',     iconId: 'housing',     iconBg: 'bg-amber-50',  activeBg: 'bg-amber-100',  iconColor: 'text-amber-500',  dotColor: 'bg-amber-400'  },
    { value: CampaignCategory.FOOD,        label: 'Food',        iconId: 'food',        iconBg: 'bg-orange-50', activeBg: 'bg-orange-100', iconColor: 'text-orange-500', dotColor: 'bg-orange-400' },
    { value: CampaignCategory.EMERGENCY,   label: 'Emergency',   iconId: 'emergency',   iconBg: 'bg-rose-50',   activeBg: 'bg-rose-100',   iconColor: 'text-rose-500',   dotColor: 'bg-rose-400'   },
    { value: CampaignCategory.ENVIRONMENT, label: 'Environment', iconId: 'environment', iconBg: 'bg-green-50',  activeBg: 'bg-green-100',  iconColor: 'text-green-500',  dotColor: 'bg-green-400'  },
    { value: CampaignCategory.COMMUNITY,   label: 'Community',   iconId: 'community',   iconBg: 'bg-purple-50', activeBg: 'bg-purple-100', iconColor: 'text-purple-500', dotColor: 'bg-purple-400' },
    { value: CampaignCategory.DISABILITY,  label: 'Disability',  iconId: 'disability',  iconBg: 'bg-sky-50',    activeBg: 'bg-sky-100',    iconColor: 'text-sky-500',    dotColor: 'bg-sky-400'    },
    { value: CampaignCategory.CHILDREN,    label: 'Children',    iconId: 'children',    iconBg: 'bg-pink-50',   activeBg: 'bg-pink-100',   iconColor: 'text-pink-500',   dotColor: 'bg-pink-400'   },
    { value: CampaignCategory.OTHER,       label: 'Other',       iconId: 'other',       iconBg: 'bg-gray-50',   activeBg: 'bg-gray-100',   iconColor: 'text-gray-400',   dotColor: 'bg-gray-400'   },
  ];

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private beneficiaryService: BeneficiaryService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.campaignForm = this.fb.group({
      // Step 1
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      category: ['', [Validators.required]],
      // Step 2
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      // Step 3
      goalAmount: [null, [Validators.required, Validators.min(100), Validators.max(1000000)]],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      deadline: [null],
      isUrgent: [false],
      // Step 5: Contact
      phone: [''],
      contactEmail: ['', [Validators.email]],
      ribNumber: ['', [Validators.required]],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      website: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editMode.set(true);
    this.editCampaignId.set(id);

    const state = history.state as { campaign?: any };
    if (state?.campaign) {
      this.prefillForm(state.campaign);
    } else {
      this.isLoadingCampaign.set(true);
      this.beneficiaryService.getMyCampaigns().subscribe({
        next: (campaigns) => {
          const campaign = campaigns.find(c => c.id === id);
          if (campaign) this.prefillForm(campaign);
          else this.router.navigate(['/dashboard/campaigns']);
          this.isLoadingCampaign.set(false);
        },
        error: () => {
          this.isLoadingCampaign.set(false);
          this.router.navigate(['/dashboard/campaigns']);
        },
      });
    }
  }

  private prefillForm(campaign: any): void {
    this.campaignForm.patchValue({
      title: campaign.title,
      category: campaign.category,
      description: campaign.description,
      goalAmount: campaign.goalAmount,
      location: campaign.location,
      deadline: campaign.deadline,
      isUrgent: campaign.isUrgent,
      ribNumber: campaign.ribNumber,
      phone: campaign.phone,
      contactEmail: campaign.contactEmail,
      facebook: campaign.facebook,
      instagram: campaign.instagram,
      twitter: campaign.twitter,
      website: campaign.website,
    });

    if (campaign.documents?.length) {
      const docs: BeneficiaryCampaignDocument[] = campaign.documents;

      const cover = docs.find(d => d.documentType === 'COVER_IMAGE');
      if (cover) {
        this.existingCoverImage.set(cover);
        this.coverImagePreview.set(cover.fileUrl);
      }

      this.existingCampaignImages.set(docs.filter(d => d.documentType === 'CAMPAIGN_IMAGE'));
      this.existingCampaignDocs.set(docs.filter(d => d.documentType === 'CAMPAIGN_DOC'));
      this.existingIdCard.set(docs.find(d => d.documentType === 'ID_CARD') ?? null);
      this.existingRibDoc.set(docs.find(d => d.documentType === 'RIB_DOC') ?? null);
      this.existingProofDocs.set(docs.filter(d => d.documentType === 'PROOF_DOC'));
    }
  }

  removeExistingCoverImage(): void {
    if (!this.editCampaignId() || !this.existingCoverImage()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, this.existingCoverImage()!.id)
      .subscribe(() => {
        this.existingCoverImage.set(null);
        this.coverImagePreview.set(null);
      });
  }

  removeExistingCampaignImage(doc: BeneficiaryCampaignDocument): void {
    if (!this.editCampaignId()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, doc.id)
      .subscribe(() => this.existingCampaignImages.update(arr => arr.filter(d => d.id !== doc.id)));
  }

  removeExistingCampaignDoc(doc: BeneficiaryCampaignDocument): void {
    if (!this.editCampaignId()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, doc.id)
      .subscribe(() => this.existingCampaignDocs.update(arr => arr.filter(d => d.id !== doc.id)));
  }

  removeExistingProofDoc(doc: BeneficiaryCampaignDocument): void {
    if (!this.editCampaignId()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, doc.id)
      .subscribe(() => this.existingProofDocs.update(arr => arr.filter(d => d.id !== doc.id)));
  }

  removeExistingIdCard(): void {
    if (!this.editCampaignId() || !this.existingIdCard()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, this.existingIdCard()!.id)
      .subscribe(() => this.existingIdCard.set(null));
  }

  removeExistingRibDoc(): void {
    if (!this.editCampaignId() || !this.existingRibDoc()) return;
    this.beneficiaryService.deleteCampaignDocument(this.editCampaignId()!, this.existingRibDoc()!.id)
      .subscribe(() => this.existingRibDoc.set(null));
  }

  private buildUploadQueue(campaignId: string) {
    const uploads: any[] = [];
    if (this.coverImageFile()) {
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, this.coverImageFile()!, 'COVER_IMAGE'));
    }
    this.campaignImages().forEach(img =>
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, img.file, 'CAMPAIGN_IMAGE'))
    );
    this.campaignDocFiles().forEach(f =>
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, f, 'CAMPAIGN_DOC'))
    );
    if (this.idCardFile()) {
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, this.idCardFile()!, 'ID_CARD'));
    }
    if (this.ribDocFile()) {
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, this.ribDocFile()!, 'RIB_DOC'));
    }
    this.additionalProofFiles().forEach(({ file }) =>
      uploads.push(this.beneficiaryService.uploadCampaignDocument(campaignId, file, 'PROOF_DOC'))
    );
    return uploads.length ? forkJoin([...uploads]) : of([]);
  }

  get selectedCategory() {
    return this.categories.find(c => c.value === this.campaignForm.get('category')?.value);
  }

  get allCarouselImages(): string[] {
    const images: string[] = [];
    if (this.coverImagePreview()) images.push(this.coverImagePreview()!);
    this.campaignImages().forEach(img => images.push(img.preview));
    return images;
  }

  nextSlide(): void {
    const total = this.allCarouselImages.length;
    if (total > 0) this.carouselIndex.set((this.carouselIndex() + 1) % total);
  }

  prevSlide(): void {
    const total = this.allCarouselImages.length;
    if (total > 0) this.carouselIndex.set((this.carouselIndex() - 1 + total) % total);
  }

  goToSlide(index: number): void {
    this.carouselIndex.set(index);
  }

  get descriptionLength(): number {
    return this.campaignForm.get('description')?.value?.length || 0;
  }

  get formattedGoal(): string {
    const val = this.campaignForm.get('goalAmount')?.value;
    if (!val) return '0';
    return Number(val).toLocaleString('fr-FR');
  }

  selectCategory(value: CampaignCategory): void {
    this.campaignForm.get('category')?.setValue(value);
    this.campaignForm.get('category')?.markAsTouched();
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      if (this.isCurrentStepValid()) {
        this.currentStep.set(this.currentStep() + 1);
      } else {
        this.markCurrentStepTouched();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  goToStep(step: number): void {
    if (this.editMode() || step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  isCurrentStepValid(): boolean {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return this.campaignForm.get('title')?.valid === true && this.campaignForm.get('category')?.valid === true;
      case 2:
        return this.campaignForm.get('description')?.valid === true;
      case 3:
        return this.campaignForm.get('goalAmount')?.valid === true && this.campaignForm.get('location')?.valid === true;
      case 4:
        return true;
      case 5:
        return this.campaignForm.get('ribNumber')?.valid === true;
      case 6:
        if (this.editMode()) return true;
        this.proofStepAttempted.set(true);
        return this.idCardFile() !== null || this.existingIdCard() !== null;
      case 7:
        return true;
      default:
        return false;
    }
  }

  markCurrentStepTouched(): void {
    const step = this.currentStep();
    switch (step) {
      case 1:
        this.campaignForm.get('title')?.markAsTouched();
        this.campaignForm.get('category')?.markAsTouched();
        break;
      case 2:
        this.campaignForm.get('description')?.markAsTouched();
        break;
      case 3:
        this.campaignForm.get('goalAmount')?.markAsTouched();
        this.campaignForm.get('location')?.markAsTouched();
        break;
      case 5:
        this.campaignForm.get('ribNumber')?.markAsTouched();
        break;
      case 6:
        this.proofStepAttempted.set(true);
        break;
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.campaignForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return 'This field is required';
      if (control.errors?.['minlength']) {
        const min = control.errors['minlength'].requiredLength;
        return `Minimum ${min} characters required`;
      }
      if (control.errors?.['maxlength']) {
        const max = control.errors['maxlength'].requiredLength;
        return `Maximum ${max} characters allowed`;
      }
      if (control.errors?.['min']) return `Minimum amount is ${control.errors['min'].min} MAD`;
      if (control.errors?.['max']) return `Maximum amount is ${control.errors['max'].max} MAD`;
      if (control.errors?.['email']) return 'Please enter a valid email address';
    }
    return null;
  }

  // ── File handlers: Step 4 ──────────────────────────────────────────────────

  onCoverImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.coverImageFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.coverImagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  clearCoverImage(event: MouseEvent): void {
    event.stopPropagation();
    if (this.coverImageFile()) {
      // Cancel new upload — fall back to existing if any
      this.coverImageFile.set(null);
      this.coverImagePreview.set(this.existingCoverImage()?.fileUrl ?? null);
    } else if (this.existingCoverImage()) {
      // Delete server-side existing cover
      this.removeExistingCoverImage();
    }
  }

  onCampaignImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newImages = Array.from(input.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      this.campaignImages.update(prev => [...prev, ...newImages]);
      input.value = '';
    }
  }

  removeCampaignImage(index: number): void {
    URL.revokeObjectURL(this.campaignImages()[index].preview);
    this.campaignImages.update(prev => prev.filter((_, i) => i !== index));
  }

  onCampaignDocChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.campaignDocFiles.update(prev => [...prev, ...Array.from(input.files!)]);
      input.value = '';
    }
  }

  removeCampaignDoc(index: number): void {
    this.campaignDocFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  // ── File handlers: Step 6 ──────────────────────────────────────────────────

  onIdCardChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.idCardFile.set(file);
      this.idCardPreview.set(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    }
  }

  onRibDocChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.ribDocFile.set(file);
      this.ribDocPreview.set(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    }
  }

  onAdditionalProofChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files!).map(file => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      this.additionalProofFiles.update(prev => [...prev, ...newFiles]);
      input.value = '';
    }
  }

  removeAdditionalProof(index: number): void {
    const item = this.additionalProofFiles()[index];
    if (item.preview) URL.revokeObjectURL(item.preview);
    this.additionalProofFiles.update(prev => prev.filter((_, i) => i !== index));
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    const needsIdCard = !this.editMode() && !this.idCardFile();
    if (this.campaignForm.invalid || needsIdCard) {
      Object.keys(this.campaignForm.controls).forEach(key => {
        this.campaignForm.get(key)?.markAsTouched();
      });
      // Navigate to first step with errors
      const stepFields: Record<number, string[]> = {
        1: ['title', 'category'],
        2: ['description'],
        3: ['goalAmount', 'location'],
        5: ['ribNumber', 'contactEmail'],
      };
      for (const [step, fields] of Object.entries(stepFields)) {
        if (fields.some(f => this.campaignForm.get(f)?.invalid)) {
          this.currentStep.set(Number(step));
          return;
        }
      }
      if (needsIdCard) this.currentStep.set(6);
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.campaignForm.value;
    const payload = {
      title: formValue.title,
      description: formValue.description,
      goalAmount: formValue.goalAmount,
      category: formValue.category,
      location: formValue.location,
      deadline: formValue.deadline || null,
      isUrgent: formValue.isUrgent,
      ribNumber: formValue.ribNumber,
      phone: formValue.phone || null,
      contactEmail: formValue.contactEmail || null,
      facebook: formValue.facebook || null,
      instagram: formValue.instagram || null,
      twitter: formValue.twitter || null,
      website: formValue.website || null,
    };

    if (this.editMode() && this.editCampaignId()) {
      this.beneficiaryService.updateCampaign(this.editCampaignId()!, payload).pipe(
        switchMap(updated => this.buildUploadQueue(updated.id))
      ).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err?.error?.message || 'Failed to update campaign. Please try again.');
        },
      });
    } else {
      this.campaignService.createCampaign(payload).pipe(
        switchMap(created => this.buildUploadQueue(created.id))
      ).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err?.error?.message || 'Failed to create campaign. Please try again.');
          console.error('Error creating campaign:', err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard/overview']);
  }
}
