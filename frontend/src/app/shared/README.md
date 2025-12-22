# Shared Module

This folder contains reusable components, directives, and pipes that are shared across multiple features.

## Structure

### `/components`
Reusable UI components:
- Button
- Card
- Modal
- Input fields
- Loaders/Spinners
- etc.

### `/directives`
Custom Angular directives:
- Click outside directive
- Debounce directive
- Permission directive
- etc.

### `/pipes`
Custom Angular pipes:
- Date formatting
- Currency formatting
- Text truncation
- etc.

### `/models`
Shared interfaces and types:
- Form models
- UI state interfaces
- etc.

## Usage

Import shared components, directives, and pipes where needed:

```typescript
import { ButtonComponent } from '@shared/components/button/button.component';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
```

All shared components should be standalone components for better tree-shaking.