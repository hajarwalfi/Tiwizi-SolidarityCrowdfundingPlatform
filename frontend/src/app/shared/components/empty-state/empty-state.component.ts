import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5">
        <svg
          class="w-7 h-7 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1.5">{{ title }}</h3>
      <p class="text-sm text-gray-400 max-w-sm mb-7 font-medium">{{ description }}</p>
      <a
        *ngIf="ctaText && ctaRoute"
        [routerLink]="ctaRoute"
        class="px-7 py-3 bg-[#1c1c1c] text-white rounded-full font-bold hover:bg-black transition-all shadow-md active:scale-95 no-underline text-sm"
      >
        {{ ctaText }}
      </a>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() emoji?: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() ctaText?: string;
  @Input() ctaRoute?: string;
}
