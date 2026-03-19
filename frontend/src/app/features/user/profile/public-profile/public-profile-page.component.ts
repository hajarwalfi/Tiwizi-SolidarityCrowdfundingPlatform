import { Component } from '@angular/core';

@Component({
  selector: 'app-public-profile-page',
  standalone: true,
  imports: [],
  template: `
    <div class="flex-1 flex flex-col items-center justify-center py-20">
      <h1 class="text-3xl font-bold font-display text-[#1c1c1c] mb-3">Public Profile</h1>
      <p class="text-gray-400">This page is under development.</p>
    </div>
  `,
})
export class PublicProfilePageComponent {}
