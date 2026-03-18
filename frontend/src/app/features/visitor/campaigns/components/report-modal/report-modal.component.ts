import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment.development';

interface ReportRequest {
  reason: string;
  description?: string;
}

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.component.html',
})
export class ReportModalComponent {
  @Input({ required: true }) campaignId!: string;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() reportSuccess = new EventEmitter<void>();

  selectedReason = '';
  description = '';
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  reportReasons = [
    { value: 'SPAM', label: 'Spam or unwanted content' },
    { value: 'FRAUD', label: 'Fraud or scam' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
    { value: 'DUPLICATE', label: 'Duplicate campaign' },
    { value: 'FALSE_INFO', label: 'False or misleading information' },
    { value: 'OTHER', label: 'Other reason' },
  ];

  constructor(private http: HttpClient) {}

  submitReport(): void {
    if (!this.selectedReason) {
      this.error.set('Please select a reason');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const request: ReportRequest = {
      reason: this.selectedReason,
      description: this.description || undefined,
    };

    this.http.post(`${environment.apiUrl}/reports/campaign/${this.campaignId}`, request).subscribe({
      next: () => {
        this.success.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.reportSuccess.emit();
          this.closeModal();
        }, 2000);
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        if (err.status === 401 || err.status === 403) {
          this.error.set('You must be logged in to report a campaign.');
        } else if (err.status === 400 && err.error?.message?.includes('already reported')) {
          this.error.set('You have already reported this campaign.');
        } else {
          this.error.set('Error reporting. Please try again.');
        }
        this.isSubmitting.set(false);
      },
    });
  }

  closeModal(): void {
    this.selectedReason = '';
    this.description = '';
    this.error.set(null);
    this.success.set(false);
    this.close.emit();
  }
}
