import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="relative min-h-screen flex items-center justify-center bg-tiwizi-bone p-4 overflow-hidden"
    >
      <!-- Background Image with Overlay -->
      <div
        class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style="background-image: url('/tiwizi_auth_bg.png');"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-tiwizi-dark/70 via-tiwizi-dark/40 to-tiwizi-primary/30 backdrop-blur-[1px]"
        ></div>
      </div>

      <!-- Content Container -->
      <div class="relative z-10 w-full max-w-sm">
        <div
          class="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl px-8 py-5 border border-white/20 animate-fade-in"
        >
          <!-- Logo & Header -->
          <div class="text-center mb-4">
            <a routerLink="/" class="inline-block">
              <img
                src="/Logo-NoBg.png"
                alt="Tiwizi Logo"
                class="mx-auto mb-2 cursor-pointer"
                style="height:80px; width:auto;"
              />
            </a>
          </div>

          <!-- Social Buttons -->
          <div class="mb-4">
            <button
              (click)="continueWithGoogle()"
              class="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white text-tiwizi-dark text-xs font-medium hover:bg-gray-50 transition-all duration-300 hover:shadow-sm active:scale-[0.98]"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>

          <!-- Divider -->
          <div class="relative mb-4 text-center">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-100"></div>
            </div>
            <span
              class="relative px-3 bg-white/0 text-gray-400 text-[9px] font-bold uppercase tracking-widest"
              >Or login with email</span
            >
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div
              class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center"
            >
              {{ errorMessage }}
            </div>
          }

          <!-- Loading Indicator -->
          @if (isLoading) {
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-xs text-center flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying credentials...
            </div>
          }

          <!-- Email/Password Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-[11px] font-semibold text-tiwizi-dark mb-1 ml-0.5"
                >Email address</label
              >
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                [disabled]="isLoading"
                class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs disabled:opacity-50"
                [class.border-red-500]="
                  loginForm.get('email')?.invalid && loginForm.get('email')?.touched
                "
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1 ml-0.5">
                <label for="password" class="block text-[11px] font-semibold text-tiwizi-dark"
                  >Password</label
                >
              </div>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                [disabled]="isLoading"
                class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs disabled:opacity-50"
                [class.border-red-500]="
                  loginForm.get('password')?.invalid && loginForm.get('password')?.touched
                "
              />
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full py-2.5 px-6 bg-tiwizi-primary text-white font-bold rounded-xl hover:bg-tiwizi-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-tiwizi-primary/20 hover:shadow-xl hover:shadow-tiwizi-primary/30 active:scale-[0.98] transform mt-2 text-xs"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <!-- Link to Register -->
          <p class="mt-5 text-center text-[11px] text-gray-500">
            Don't have an account?
            <a
              routerLink="/register"
              class="font-bold text-tiwizi-primary hover:underline transition-all underline-offset-4"
              >Create account</a
            >
          </p>
        </div>

        <!-- Trust Badge -->
        <div class="mt-6 flex justify-center gap-6 text-white/50">
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span class="text-[9px] font-semibold tracking-wide uppercase">Secure</span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04l.112.56V12c0 5.391 3.551 10.11 8.618 11.662 5.067-1.552 8.618-6.271 8.618-11.662V5.006z"
              />
            </svg>
            <span class="text-[9px] font-semibold tracking-wide uppercase">Verified</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('banned') === 'true') {
      this.errorMessage = 'Your account has been banned. Contact our support team at hello@tiwizi.com to appeal.';
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          const user = this.authService.getCurrentUser();
          this.router.navigate([user?.role === 'ADMIN' ? '/admin' : '/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.errorMessage = 'Your account has been banned. Contact our support team at hello@tiwizi.com to appeal.';
          } else {
            this.errorMessage = err.error?.message || 'Invalid email or password';
          }
          this.cdr.markForCheck();
        },
      });
    }
  }

  continueWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
