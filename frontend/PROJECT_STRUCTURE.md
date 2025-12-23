# TIWIZI Frontend - Project Structure

## Overview

This Angular 21 application follows a modular architecture with clear separation of concerns.

## Folder Structure

```
src/
├── app/
│   ├── core/                    # Core module (singleton services)
│   │   ├── services/           # App-wide services (auth, api, etc.)
│   │   ├── guards/             # Route guards (auth, role)
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── models/             # Core domain models
│   │
│   ├── shared/                  # Shared module (reusable components)
│   │   ├── components/         # Reusable UI components
│   │   ├── directives/         # Custom directives
│   │   ├── pipes/              # Custom pipes
│   │   └── models/             # Shared interfaces
│   │
│   ├── features/                # Feature modules (lazy-loaded)
│   │   ├── auth/               # Authentication feature
│   │   ├── campaigns/          # Campaign management
│   │   ├── donations/          # Donation management
│   │   └── profile/            # User profile
│   │
│   ├── app.config.ts           # Application configuration
│   ├── app.routes.ts           # Main routing configuration
│   └── app.ts                  # Root component
│
├── assets/                      # Static assets (images, fonts, etc.)
├── environments/                # Environment configurations
└── styles.css                   # Global styles (Tailwind CSS)

```

## Architecture Principles

### 1. Core Module
- **Purpose**: Singleton services and app-wide utilities
- **Import**: Only once in `app.config.ts`
- **Contains**:
  - Authentication service
  - HTTP interceptors
  - Route guards
  - Global state management

### 2. Shared Module
- **Purpose**: Reusable components, directives, and pipes
- **Import**: Anywhere needed
- **Contains**:
  - UI components (buttons, cards, modals)
  - Utility directives
  - Formatting pipes
  - Common interfaces

### 3. Features Module
- **Purpose**: Business features (lazy-loaded)
- **Pattern**: Each feature is self-contained
- **Contains**:
  - Feature-specific components
  - Feature routes
  - Feature services
  - Feature models

## Path Aliases

Use TypeScript path aliases for cleaner imports:

```typescript
// Instead of: import { AuthService } from '../../core/services/auth.service';
import { AuthService } from '@core/services/auth.service';

// Instead of: import { ButtonComponent } from '../../shared/components/button';
import { ButtonComponent } from '@shared/components/button/button.component';

// Instead of: import { CampaignService } from '../services/campaign.service';
import { CampaignService } from '@features/campaigns/services/campaign.service';
```

Available aliases:
- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@features/*` → `src/app/features/*`
- `@env/*` → `src/environments/*`

## Naming Conventions

### Files
- Components: `component-name.component.ts`
- Services: `service-name.service.ts`
- Guards: `guard-name.guard.ts`
- Interceptors: `interceptor-name.interceptor.ts`
- Pipes: `pipe-name.pipe.ts`
- Directives: `directive-name.directive.ts`

### Classes
- Components: `ComponentNameComponent`
- Services: `ServiceNameService`
- Guards: `GuardNameGuard`
- Interceptors: `InterceptorNameInterceptor`

## Development Guidelines

### 1. Standalone Components
All components should be standalone (Angular 21 best practice):

```typescript
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {}
```

### 2. Lazy Loading
Features should be lazy-loaded for better performance:

```typescript
// app.routes.ts
{
  path: 'campaigns',
  loadChildren: () => import('./features/campaigns/campaigns.routes')
}
```

### 3. Dependency Injection
Use Angular's dependency injection:

```typescript
constructor(
  private authService: AuthService,
  private router: Router
) {}
```

### 4. Reactive Programming
Use RxJS for async operations:

```typescript
campaigns$ = this.campaignService.getCampaigns();
```

## Technologies

- **Framework**: Angular 21.0.0
- **Styling**: Tailwind CSS 3.4.19
- **State Management**: (To be decided: NgRx, Signals, etc.)
- **HTTP Client**: Angular HttpClient
- **Testing**: Vitest 4.0.8
- **Build Tool**: Angular CLI with esbuild

## Next Steps

1. Create authentication service in `core/services/`
2. Implement HTTP interceptor for JWT tokens
3. Build shared UI components library
4. Develop feature modules with routing
5. Implement state management
6. Add unit and integration tests

## References

- [Angular Documentation](https://angular.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)