import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavbarService {
  /** True when the content behind the fixed navbar is light-colored */
  showBackground = signal(false);
}
