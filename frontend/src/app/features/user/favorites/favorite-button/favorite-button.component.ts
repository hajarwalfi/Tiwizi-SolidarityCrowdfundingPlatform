import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="isAuthenticated()"
      (click)="toggleFavorite($event)"
      [disabled]="isLoading()"
      class="w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
      [title]="isFavorited() ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    >
      <svg
        class="w-4 h-4 transition-colors"
        [class.text-red-500]="isFavorited()"
        [class.text-gray-400]="!isFavorited()"
        [attr.fill]="isFavorited() ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="1.8"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class FavoriteButtonComponent implements OnInit {
  @Input({ required: true }) campaignId!: string;

  isFavorited = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());

    if (this.isAuthenticated()) {
      this.checkFavoriteStatus();
    }
  }

  checkFavoriteStatus(): void {
    this.favoriteService.checkFavorite(this.campaignId).subscribe({
      next: (response) => {
        this.isFavorited.set(response.isFavorited);
      },
      error: (err) => {
        console.error('Error checking favorite status:', err);
      },
    });
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.isLoading()) return;

    this.isLoading.set(true);

    if (this.isFavorited()) {
      this.favoriteService.removeFavorite(this.campaignId).subscribe({
        next: () => {
          this.isFavorited.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          this.isLoading.set(false);
        },
      });
    } else {
      this.favoriteService.addFavorite(this.campaignId).subscribe({
        next: () => {
          this.isFavorited.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          this.isLoading.set(false);
        },
      });
    }
  }
}
