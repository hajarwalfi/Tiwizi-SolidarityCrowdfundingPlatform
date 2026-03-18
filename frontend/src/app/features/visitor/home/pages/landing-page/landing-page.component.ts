import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarService } from '../../../../../core/services/navbar.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CampaignService } from '../../../../../core/services/campaign.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Campaign } from '../../../../../core/models/campaign.model';
import { CurrencyMadPipe } from '../../../../../shared/pipes';
import { CAMPAIGN_CATEGORY_LABELS } from '../../../../../shared/constants';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { HowItWorksSectionComponent } from '../../components/how-it-works-section/how-it-works-section.component';
import { CategoriesSectionComponent } from '../../components/categories-section/categories-section.component';
import { FooterComponent } from '../../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyMadPipe,
    HeroSectionComponent,
    HowItWorksSectionComponent,
    CategoriesSectionComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.component.html',
  host: { style: 'display:block;height:100vh;overflow:hidden' }
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  urgentCampaigns = signal<Campaign[]>([]);
  currentSection = signal(0);

  readonly SECTION_COUNT = 6;
  readonly sectionIndices = Array.from({ length: this.SECTION_COUNT }, (_, i) => i);

  readonly sectionLabels = ['Hero', 'Mission', 'Urgent', 'How It Works', 'Categories', 'Footer'];

  categoryLabels = CAMPAIGN_CATEGORY_LABELS;

  private readonly svgIcons: Record<string, string> = {
    HEALTH: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    EDUCATION: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    EMERGENCY: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    COMMUNITY: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    ENVIRONMENT: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    HOUSING: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    FOOD: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    CHILDREN: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    OTHER: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>`,
  };

  // Light-bg sections: 1 (Mission), 3 (How It Works), 4 (Categories), 5 (Footer)
  private readonly lightSections = new Set([1, 3, 4, 5]);

  constructor(
    private campaignService: CampaignService,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
    private navbarService: NavbarService
  ) {
    const s = (svg: string) => this.sanitizer.bypassSecurityTrustHtml(svg);
    this.missionCauses = [
      { label: 'Housing',     icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline stroke-linecap="round" stroke-linejoin="round" points="9 22 9 12 15 12 15 22"/></svg>`) },
      { label: 'Education',   icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`) },
      { label: 'Health',      icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`) },
      { label: 'Food',        icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><path stroke-linecap="round" stroke-linejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`) },
      { label: 'Children',    icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><polygon stroke-linecap="round" stroke-linejoin="round" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`) },
      { label: 'Environment', icon: s(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:1.5rem;height:1.5rem"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`) },
    ];
  }

  ngOnInit(): void {
    this.loadUrgentCampaigns();
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const sectionHeight = el.clientHeight;
    if (sectionHeight > 0) {
      const index = Math.min(Math.round(el.scrollTop / sectionHeight), this.SECTION_COUNT - 1);
      this.currentSection.set(index);
      this.navbarService.showBackground.set(this.lightSections.has(index));
    }
  }

  ngOnDestroy(): void {
    this.navbarService.showBackground.set(false);
  }

  scrollToSection(index: number): void {
    const el = this.scrollContainer.nativeElement;
    el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' });
  }

  loadUrgentCampaigns(): void {
    this.campaignService.searchCampaigns({ isUrgent: true, size: 5, page: 0 }).subscribe({
      next: (response) => this.urgentCampaigns.set(response.content || []),
      error: () => {}
    });
  }

  get featuredUrgentCampaign(): Campaign | null {
    return this.urgentCampaigns().length > 0 ? this.urgentCampaigns()[0] : null;
  }

  get sideUrgentCampaigns(): Campaign[] {
    return this.urgentCampaigns().slice(1, 5);
  }

  getCategoryIconSvg(category: string): SafeHtml {
    const svg = this.svgIcons[category] ?? this.svgIcons['OTHER'];
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getProgress(campaign: Campaign): number {
    if (!campaign.goalAmount || campaign.goalAmount === 0) return 0;
    return Math.min((campaign.amountCollected / campaign.goalAmount) * 100, 100);
  }

  getCategoryLabel(category: string): string {
    return this.categoryLabels[category] || category;
  }

  missionCauses: { label: string; icon: SafeHtml }[] = [];

  readonly cardHeights = ['140px', '175px', '215px', '215px', '175px', '140px'];
  readonly cardGradients = [
    'linear-gradient(160deg, #f5d0c5 0%, #e8a898 100%)',
    'linear-gradient(160deg, #d4c5e2 0%, #b09fc8 100%)',
    'linear-gradient(160deg, #c5d8e8 0%, #8fb8d4 100%)',
    'linear-gradient(160deg, #c5e8d4 0%, #8fd4b0 100%)',
    'linear-gradient(160deg, #e8d8c5 0%, #d4b890 100%)',
    'linear-gradient(160deg, #e8c5c5 0%, #d49090 100%)',
  ];

  /** Whether the dot nav should use dark color (on light-bg sections) */
  isDotDark(index: number): boolean {
    return index === 1 || index === 3 || index === 4 || index === 5;
  }
}
