import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-page.component.html',
})
export class ContactPageComponent {
  subjects = ['General question', 'Create a campaign', 'Technical issue', 'Partnership', 'Other'];
  selectedSubject = signal<string>('');
  dropdownOpen = signal(false);

  selectSubject(subject: string) {
    this.selectedSubject.set(subject);
    this.dropdownOpen.set(false);
  }
}
