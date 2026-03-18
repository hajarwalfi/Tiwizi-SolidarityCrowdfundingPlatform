import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
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
      <div class="relative z-10 w-full max-w-md my-4">
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
            <p class="text-gray-500 text-xs font-body tracking-tight">
              Join our community and start making a difference today.
            </p>
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
              >Or register with email</span
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

          <!-- Registration Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="firstName"
                  class="block text-[11px] font-semibold text-tiwizi-dark mb-1 ml-0.5"
                  >First name</label
                >
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  placeholder="John"
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs"
                  [class.border-red-500]="
                    registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched
                  "
                />
              </div>

              <div>
                <label
                  for="lastName"
                  class="block text-[11px] font-semibold text-tiwizi-dark mb-1 ml-0.5"
                  >Last name</label
                >
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  placeholder="Doe"
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs"
                  [class.border-red-500]="
                    registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched
                  "
                />
              </div>
            </div>

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
                placeholder="john@example.com"
                class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs"
                [class.border-red-500]="
                  registerForm.get('email')?.invalid && registerForm.get('email')?.touched
                "
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="password"
                  class="block text-[11px] font-semibold text-tiwizi-dark mb-1 ml-0.5"
                  >Password</label
                >
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs"
                  [class.border-red-500]="
                    registerForm.get('password')?.invalid && registerForm.get('password')?.touched
                  "
                />
              </div>

              <div>
                <label
                  for="confirmPassword"
                  class="block text-[11px] font-semibold text-tiwizi-dark mb-1 ml-0.5"
                  >Confirm</label
                >
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-tiwizi-primary/10 focus:border-tiwizi-primary outline-none transition-all duration-300 font-body text-xs"
                  [class.border-red-500]="
                    registerForm.get('confirmPassword')?.touched &&
                    registerForm.hasError('passwordMismatch')
                  "
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid"
              class="w-full py-2.5 px-6 bg-tiwizi-primary text-white font-bold rounded-xl hover:bg-tiwizi-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-tiwizi-primary/20 hover:shadow-xl hover:shadow-tiwizi-primary/30 active:scale-[0.98] transform mt-2 text-xs"
            >
              Create account
            </button>
          </form>

          <!-- Link to Login -->
          <p class="mt-5 text-center text-[11px] text-gray-500">
            Already have an account?
            <a
              routerLink="/login"
              class="font-bold text-tiwizi-primary hover:underline transition-all underline-offset-4"
              >Sign in</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { firstName, lastName, email, password } = this.registerForm.value;
      this.authService.register({ firstName, lastName, email, password }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        },
      });
    }
  }

  continueWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
