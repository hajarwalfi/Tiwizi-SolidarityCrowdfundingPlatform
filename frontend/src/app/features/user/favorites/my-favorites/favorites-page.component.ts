import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService, FavoriteResponse } from '../../../../core/services/favorite.service';
import { CAMPAIGN_CATEGORY_LABELS } from '../../../../shared/constants';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-page.component.html',
})
export class FavoritesPageComponent implements OnInit {
  favorites = signal<FavoriteResponse[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Pagination
  readonly pageSize = 6;
  currentPage = signal<number>(1);
  searchQuery = signal<string>('');

  categoryLabels = CAMPAIGN_CATEGORY_LABELS;

  filteredFavorites = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.favorites();
    return this.favorites().filter(f => f.campaign.title.toLowerCase().includes(q));
  });

  paginatedFavorites = computed(() => {
    const all = this.filteredFavorites();
    const start = (this.currentPage() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredFavorites().length / this.pageSize)));

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.favoriteService.getMyFavorites().subscribe({
      next: (data) => {
        this.favorites.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.error.set('Unable to load your favorites. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  removeFavorite(campaignId: string): void {
    this.favoriteService.removeFavorite(campaignId).subscribe({
      next: () => {
        this.favorites.set(this.favorites().filter((f) => f.campaign.id !== campaignId));
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        alert('Error removing favorite');
      },
    });
  }

  getProgressPercentage(favorite: FavoriteResponse): number {
    const campaign = favorite.campaign;
    if (campaign.goalAmount === 0) return 0;
    return Math.min((campaign.amountCollected / campaign.goalAmount) * 100, 100);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-[#FEF3C7] text-[#92400E]',
      ACTIVE: 'bg-[#F3E8FF] text-[#7C3AED]',
      REJECTED: 'bg-[#FEE2E2] text-[#991B1B]',
      COMPLETED: 'bg-[#DBEAFE] text-[#1E40AF]',
      CLOSED: 'bg-[#F3F4F6] text-[#374151]',
      CANCELLED: 'bg-[#FEE2E2] text-[#991B1B]',
      SUSPENDED: 'bg-[#FEF3C7] text-[#92400E]',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      ACTIVE: 'Active',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CLOSED: 'Completed',
      CANCELLED: 'Cancelled',
      SUSPENDED: 'Suspended',
    };
    return labels[status ?? 'PENDING'] || status;
  }

  getStatusDotColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-400',
      ACTIVE: 'bg-purple-500',
      REJECTED: 'bg-red-500',
      COMPLETED: 'bg-blue-500',
      CLOSED: 'bg-gray-400',
      CANCELLED: 'bg-red-400',
      SUSPENDED: 'bg-amber-500',
    };
    return colors[status] || 'bg-gray-400';
  }

  getProgressBarColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-amber-400',
      ACTIVE: 'bg-purple-500',
      REJECTED: 'bg-red-300',
      COMPLETED: 'bg-blue-500',
      CLOSED: 'bg-gray-400',
      CANCELLED: 'bg-red-300',
      SUSPENDED: 'bg-amber-500',
    };
    return colors[status] || 'bg-gray-400';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      HEALTH: '#FEE2E2', EDUCATION: '#DBEAFE', HOUSING: '#FEF3C7',
      FOOD: '#FFEDD5', EMERGENCY: '#FFE4E6', ENVIRONMENT: '#D1FAE5',
      COMMUNITY: '#EDE9FE', DISABILITY: '#E0F2FE', CHILDREN: '#FCE7F3', OTHER: '#F3F4F6',
    };
    return colors[category] || '#F3F4F6';
  }

  getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      HEALTH: '❤️', EDUCATION: '📚', HOUSING: '🏠',
      FOOD: '🍎', EMERGENCY: '🚨', ENVIRONMENT: '🌱',
      COMMUNITY: '👥', DISABILITY: '♿', CHILDREN: '🌟', OTHER: '📦',
    };
    return emojis[category] || '📦';
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR');
  }
}
