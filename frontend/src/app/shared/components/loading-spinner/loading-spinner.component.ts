import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16">
      <div class="w-16 h-16 relative mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-tiwizi-primary/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-tiwizi-primary animate-spin"></div>
      </div>
      <p *ngIf="message" class="text-sm text-gray-600 animate-pulse">{{ message }}</p>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
}
