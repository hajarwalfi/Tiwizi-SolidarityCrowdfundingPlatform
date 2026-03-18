import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth2-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <h2>Authentication Error</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button (click)="goHome()" class="btn-home">Go to Home</button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f9fafb;
    }
    .error-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #ef4444;
      margin-bottom: 1rem;
    }
    .error-message {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
    .btn-home {
      padding: 0.75rem 1.5rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-home:hover {
      background-color: #2563eb;
    }
  `]
})
export class OAuth2ErrorComponent implements OnInit {
  errorMessage = 'An error occurred during authentication.';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}