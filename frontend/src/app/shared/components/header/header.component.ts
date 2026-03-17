import { Component, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarService } from '../../../core/services/navbar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  template: `
    <!-- Positioning wrapper — full width, invisible -->
    <nav class="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4 pointer-events-none">

      <!-- Floating pill -->
      <div class="w-full max-w-4xl flex items-center justify-between px-5 py-2.5 rounded-full pointer-events-auto transition-all duration-300"
           [class]="isHome()
             ? (navbarService.showBackground() ? 'bg-[#0D1117]/90 backdrop-blur-md shadow-lg border border-white/10' : 'bg-transparent')
             : 'bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-200/70'">

      <!-- Logo -->
      <a routerLink="/" class="text-lg font-extrabold tracking-tight no-underline"
         [class]="isHome() ? 'text-white' : 'text-gray-900'">Tiwizi</a>

      <!-- Nav links -->
      <div class="hidden md:flex items-center gap-5">
        <a routerLink="/"          class="text-sm font-semibold transition-colors no-underline" [class]="navLinkClass('/')">Home</a>
        <a routerLink="/campaigns" class="text-sm font-semibold transition-colors no-underline" [class]="navLinkClass('/campaigns')">Campaigns</a>
        <a routerLink="/about"     class="text-sm font-semibold transition-colors no-underline" [class]="navLinkClass('/about')">About</a>
        <a routerLink="/contact"   class="text-sm font-semibold transition-colors no-underline" [class]="navLinkClass('/contact')">Contact</a>
      </div>

      <!-- Auth -->
      <div class="flex items-center gap-3">
        @if (authService.isAuthenticated$ | async) {
          <div class="relative group">
            <button class="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-colors border"
                    [class]="isHome() ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-black/5 hover:bg-black/10 border-black/10'">
              <span class="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
                    [class]="isHome() ? 'bg-white/20' : 'bg-black/10'">
                @if (authService.getCurrentUser()?.profilePictureUrl) {
                  <img [src]="authService.getCurrentUser()!.profilePictureUrl" alt="avatar" class="w-full h-full object-cover rounded-full" />
                } @else {
                  <svg class="w-4 h-4" [class]="isHome() ? 'text-white' : 'text-gray-600'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                }
              </span>
              <svg class="w-3 h-3 transition-transform duration-150 group-hover:rotate-180" [class]="isHome() ? 'text-white/70' : 'text-gray-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div class="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              <a
                [routerLink]="authService.getCurrentUser()?.role === 'ADMIN' ? '/admin' : '/dashboard'"
                class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors no-underline"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </a>
              @if (authService.getCurrentUser()?.role !== 'ADMIN') {
                <a routerLink="/dashboard/favorites"
                   class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors no-underline"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Favorites
                </a>
              }
              @if (authService.getCurrentUser()?.role !== 'ADMIN') {
                <a routerLink="/dashboard/settings"
                   class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors no-underline"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Settings
                </a>
              }
              <div class="my-1 border-t border-gray-100"></div>
              <button
                (click)="authService.logout()"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[#FF594B] hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        } @else {
          <a routerLink="/login"
             class="px-5 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-all no-underline"
             [class]="isHome() ? 'border border-white/30 text-white hover:bg-white/10 hover:border-white/50' : 'border border-gray-300 text-gray-700 hover:border-[#FF594B] hover:text-[#FF594B]'">
            Log in
          </a>
          <a routerLink="/register"
             class="px-5 py-2 rounded-lg bg-[#FF7A59] text-white text-sm font-bold hover:bg-[#e8684a] active:scale-95 transition-all no-underline shadow-md">
            Get started
          </a>
        }
      </div>

      </div> <!-- end pill -->
    </nav>
  `,
})
export class HeaderComponent {
  isHome = signal(false);

  constructor(public authService: AuthService, private router: Router, public navbarService: NavbarService) {
    this.updateIsHome(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.updateIsHome(e.urlAfterRedirects);
    });
  }

  private updateIsHome(url: string): void {
    this.isHome.set(url === '/' || url === '');
  }

  navLinkClass(path: string): string {
    const active = path === '/'
      ? (this.router.url === '/' || this.router.url === '')
      : this.router.url.startsWith(path);
    if (this.isHome()) {
      return active ? 'text-[#FF594B]' : 'text-white/70 hover:text-[#FF594B]';
    }
    return active ? 'text-[#FF594B]' : 'text-gray-600 hover:text-[#FF594B]';
  }
}
