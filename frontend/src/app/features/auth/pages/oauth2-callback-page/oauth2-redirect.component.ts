import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  template: `
    <div class="redirect-container">
      <div class="loading">
        <p>Processing authentication...</p>
      </div>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .loading {
      text-align: center;
    }
  `]
})
export class OAuth2RedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        console.log('Authorization code received from backend');
        this.authService.exchangeCodeForTokens(code).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error('Code exchange failed:', err);
            this.router.navigate(['/login']);
          }
        });
      } else {
        console.error('No authorization code in callback URL');
        this.router.navigate(['/login']);
      }
    });
  }
}
