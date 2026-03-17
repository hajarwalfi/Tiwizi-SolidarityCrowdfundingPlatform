import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border"
      [class]="badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  get label(): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      ACTIVE: 'Active',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CLOSED: 'Closed',
      CANCELLED: 'Cancelled',
      SUSPENDED: 'Suspended',
      SUCCESS: 'Confirmed',
      FAILED: 'Failed',
      REFUNDED: 'Refunded',
    };
    return labels[this.status] || this.status;
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'ACTIVE':
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENDING':
      case 'SUSPENDED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'COMPLETED':
      case 'CLOSED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }

  get dotClass(): string {
    switch (this.status) {
      case 'ACTIVE':
      case 'SUCCESS':
        return 'bg-emerald-500';
      case 'PENDING':
      case 'SUSPENDED':
        return 'bg-amber-500';
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-500';
      case 'COMPLETED':
      case 'CLOSED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  }
}
