# Features Module

This folder contains feature modules organized by business domain. Each feature is self-contained and follows the same structure.

## Structure

### `/auth`
Authentication and user management:
- Login
- Register
- Password reset
- Profile management

### `/campaigns`
Campaign management:
- Campaign list
- Campaign details
- Create/Edit campaign
- Campaign dashboard

### `/donations`
Donation management:
- Make donation
- Donation history
- Payment processing

### `/profile`
User profile:
- View profile
- Edit profile
- User settings
- Favorite campaigns

## Feature Module Pattern

Each feature should follow this structure:

```
feature-name/
├── components/          # Feature-specific components
├── pages/              # Route components (page containers)
├── services/           # Feature-specific services
├── models/             # Feature-specific interfaces
├── feature-name.routes.ts  # Feature routes
└── README.md          # Feature documentation
```

## Usage

Features are lazy-loaded through the routing configuration:

```typescript
{
  path: 'campaigns',
  loadChildren: () => import('./features/campaigns/campaigns.routes')
}
```

All feature components should be standalone components.