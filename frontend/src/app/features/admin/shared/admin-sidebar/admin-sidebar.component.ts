import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserProfile } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent implements OnInit {
  profile = signal<UserProfile | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.profile.set(this.authService.getCurrentUser());
  }

  logout(): void {
    this.authService.logout();
  }
}
