import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../../../../../core/services/profile.service';
import { PublicUserProfileResponse } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-public-profile-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './public-profile-page.component.html',
})
export class PublicProfilePageComponent implements OnInit {
  profile = signal<PublicUserProfileResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  readonly categoryLabels: Record<string, string> = {
    HEALTH: 'Health',
    EDUCATION: 'Education',
    HOUSING: 'Housing',
    FOOD: 'Food',
    EMERGENCY: 'Emergency',
    ENVIRONMENT: 'Environment',
    COMMUNITY: 'Community',
    DISABILITY: 'Disability',
    CHILDREN: 'Children',
    CLOTHING: 'Clothing',
    OTHER: 'Other',
  };

  readonly categoryIcons: Record<string, string> = {
    HEALTH: '🏥',
    EDUCATION: '📚',
    HOUSING: '🏠',
    FOOD: '🍽️',
    EMERGENCY: '🚨',
    ENVIRONMENT: '🌿',
    COMMUNITY: '🤝',
    DISABILITY: '♿',
    CHILDREN: '👶',
    CLOTHING: '👕',
    OTHER: '💛',
  };

  constructor(private route: ActivatedRoute, private profileService: ProfileService) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.error.set('User not found.');
      this.isLoading.set(false);
      return;
    }
    this.profileService.getPublicProfile(userId).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('This profile could not be found.');
        this.isLoading.set(false);
      },
    });
  }

  getDisplayName(p: PublicUserProfileResponse): string {
    return p.displayName || p.fullName || p.firstName || 'Unknown';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  getAvatarGradient(name: string): string {
    const palettes = [
      ['#FF6B6B', '#FF8E53'],
      ['#4ECDC4', '#44A08D'],
      ['#A18CD1', '#FBC2EB'],
      ['#F7971E', '#FFD200'],
      ['#56CCF2', '#2F80ED'],
      ['#F953C6', '#B91D73'],
      ['#43E97B', '#38F9D7'],
      ['#FA709A', '#FEE140'],
      ['#30CFD0', '#330867'],
      ['#A1C4FD', '#C2E9FB'],
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const [from, to] = palettes[Math.abs(hash) % palettes.length];
    return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
  }
}
