# Core Module

This folder contains singleton services, guards, interceptors, and core application logic that should be imported only once in the application.

## Structure

### `/services`
Application-wide singleton services:
- Authentication service
- API service
- Configuration service
- Storage service
- etc.

### `/guards`
Route guards:
- AuthGuard (authentication)
- RoleGuard (authorization)
- etc.

### `/interceptors`
HTTP interceptors:
- AuthInterceptor (add JWT tokens)
- ErrorInterceptor (global error handling)
- LoadingInterceptor (loading state)
- etc.

### `/models`
Core domain models and interfaces:
- User interface
- API response types
- Core business entities

## Usage

Services and guards from this module should be provided in `app.config.ts` and used throughout the application.

Example:
```typescript
import { AuthService } from '@core/services/auth.service';
import { AuthGuard } from '@core/guards/auth.guard';
```