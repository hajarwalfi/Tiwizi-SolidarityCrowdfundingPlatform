import { Component, OnInit, signal } from '@angular/core';
  import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfileResponse } from '../../../../core/models/user.model';
import { NotificationApiService } from '../../../../core/services/notification-api.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './user-sidebar.component.html',
})
export class UserSidebarComponent implements OnInit {
  profile = signal<UserProfileResponse | null>(null);
  unreadCount = signal(0);

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private notificationApi: NotificationApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.profileService.getMyProfile().subscribe({
        next: (p) => this.profile.set(p),
        error: () => {},
      });
      this.loadUnreadCount();
    }
  }

  loadUnreadCount(): void {
    this.notificationApi.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: () => {},
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
