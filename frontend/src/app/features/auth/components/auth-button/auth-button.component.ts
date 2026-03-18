import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-button-container">
      @if (authService.isAuthenticated$ | async) {
        <div class="user-info">
          @if ((authService.currentUser$ | async)?.profilePictureUrl) {
            <img
              [src]="(authService.currentUser$ | async)?.profilePictureUrl"
              alt="Profile"
              class="profile-picture"
            />
          }
          <div class="user-details">
            <span class="user-name">{{ (authService.currentUser$ | async)?.fullName || 'User' }}</span>
            <span class="user-email">{{ (authService.currentUser$ | async)?.email }}</span>
          </div>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      } @else {
        <div class="login-buttons">
          <a routerLink="/login" class="btn-login">Sign In</a>
          <a routerLink="/register" class="btn-register">Sign Up</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-button-container {
      padding: 1rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .profile-picture {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .user-email {
      font-size: 0.85rem;
      color: #6b7280;
    }
    .login-buttons {
      display: flex;
      gap: 0.75rem;
    }
    .btn-login, .btn-register, .btn-logout {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s;
    }
    .btn-login {
      background-color: #3b82f6;
      color: white;
    }
    .btn-login:hover {
      background-color: #2563eb;
    }
    .btn-register {
      background-color: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }
    .btn-register:hover {
      background-color: #eff6ff;
    }
    .btn-logout {
      background-color: #ef4444;
      color: white;
    }
    .btn-logout:hover {
      background-color: #dc2626;
    }
  `]
})
export class AuthButtonComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
