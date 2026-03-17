import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyMadPipe } from '../../pipes';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CurrencyMadPipe],
  template: `
    <div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-1000"
          [class]="barColorClass"
          [style.width.%]="progressPct"
        ></div>
      </div>
      <div *ngIf="showLabels" class="flex justify-between items-baseline mt-2">
        <div>
          <span class="font-bold text-sm text-gray-900">{{ current | currencyMad }}</span>
          <span class="text-xs text-gray-500 ml-1">raised</span>
        </div>
        <span class="text-sm font-bold text-tiwizi-primary"
          >{{ progressPct | number: '1.0-0' }}%</span
        >
      </div>
      <p *ngIf="showLabels" class="text-xs text-gray-400 mt-1">Goal: {{ goal | currencyMad }}</p>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input({ required: true }) current!: number;
  @Input({ required: true }) goal!: number;
  @Input() showLabels = false;
  @Input() color: 'primary' | 'green' | 'red' = 'green';

  get progressPct(): number {
    if (!this.goal || this.goal === 0) return 0;
    return Math.min((this.current / this.goal) * 100, 100);
  }

  get barColorClass(): string {
    switch (this.color) {
      case 'primary':
        return 'bg-gradient-to-r from-[#FF7A59] to-[#FF9544]';
      case 'red':
        return 'bg-gradient-to-r from-red-600 to-red-400';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-600';
    }
  }
}
