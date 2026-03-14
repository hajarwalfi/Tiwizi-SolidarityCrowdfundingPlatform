import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Frontend');
  isDashboard = signal(false);
  isAdmin = signal(false);
  isHome = signal(false);
  constructor(private router: Router) {
    this.updateRouteSignals(this.router.url);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.updateRouteSignals(e.urlAfterRedirects);
    });
  }

  isAuth = signal(false);

  private updateRouteSignals(url: string): void {
    const isAuth = url.startsWith('/login') || url.startsWith('/register') || url.startsWith('/oauth2');
    this.isAdmin.set(url.startsWith('/admin'));
    this.isDashboard.set(url.startsWith('/dashboard') || url.startsWith('/admin') || url.startsWith('/profile'));
    this.isAuth.set(isAuth);
    this.isHome.set(url === '/' || url === '');
  }
}
