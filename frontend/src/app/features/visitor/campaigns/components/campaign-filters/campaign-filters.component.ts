import { Component, Input, Output, EventEmitter, OnChanges, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignCategory } from '../../../../../core/models/campaign.model';
import { CAMPAIGN_CATEGORY_LABELS, CAMPAIGN_CATEGORY_ICONS } from '../../../../../shared/constants';

interface CategoryItem {
  key: CampaignCategory;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-campaign-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campaign-filters.component.html'
})
export class CampaignFiltersComponent implements OnChanges {
  @Input() selectedCategory: CampaignCategory | null = null;
  @Input() showUrgentOnly = false;
  @Input() showDeadlineSoon = false;
  @Input() showNearlyFunded = false;

  @Output() searchChanged = new EventEmitter<string>();
  @Output() locationChanged = new EventEmitter<string>();
  @Output() categoryChanged = new EventEmitter<CampaignCategory | null>();
  @Output() urgentToggled = new EventEmitter<void>();
  @Output() deadlineSoonToggled = new EventEmitter<void>();
  @Output() nearlyFundedToggled = new EventEmitter<void>();
  @Output() filtersCleared = new EventEmitter<void>();

  searchKeyword = '';
  locationFilter = '';
  selectedCategoryValue = '';
  categoryOpen = false;

  readonly categoryItems: CategoryItem[] = Object.keys(CAMPAIGN_CATEGORY_LABELS)
    .filter(k => k !== 'ALL')
    .map(k => ({
      key: k as CampaignCategory,
      label: CAMPAIGN_CATEGORY_LABELS[k],
      emoji: CAMPAIGN_CATEGORY_ICONS[k] || '📦',
    }));

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.categoryOpen = false;
    }
  }

  ngOnChanges(): void {
    this.selectedCategoryValue = this.selectedCategory ?? '';
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchKeyword || this.locationFilter || this.selectedCategory
      || this.showUrgentOnly || this.showDeadlineSoon || this.showNearlyFunded);
  }

  getCategoryLabel(key: CampaignCategory): string {
    return CAMPAIGN_CATEGORY_LABELS[key] ?? key;
  }

  onSearchInput(): void {
    this.searchChanged.emit(this.searchKeyword);
  }

  onLocationInput(): void {
    this.locationChanged.emit(this.locationFilter);
  }

  onCategorySelect(value: string): void {
    this.selectedCategoryValue = value;
    this.categoryChanged.emit(value ? value as CampaignCategory : null);
  }

  onUrgentToggle(): void {
    this.urgentToggled.emit();
  }

  onDeadlineSoonToggle(): void {
    this.deadlineSoonToggled.emit();
  }

  onNearlyFundedToggle(): void {
    this.nearlyFundedToggled.emit();
  }

  onClearFilters(): void {
    this.searchKeyword = '';
    this.locationFilter = '';
    this.selectedCategoryValue = '';
    this.categoryOpen = false;
    this.filtersCleared.emit();
  }
}
