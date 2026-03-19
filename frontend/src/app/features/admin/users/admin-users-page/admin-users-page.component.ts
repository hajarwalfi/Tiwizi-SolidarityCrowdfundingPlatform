import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminUser } from '../../../../core/models/admin.model';
import { AdminUserDetailPanelComponent } from '../admin-user-detail-panel/admin-user-detail-panel.component';

type UserFilter = 'ALL' | 'BANNED';

export interface BanReason {
  key: string;
  label: string;
  description: string;
}

export const BAN_REASONS: BanReason[] = [
  { key: 'FRAUD',               label: 'Fraud',                    description: 'Fraudulent campaign or financial deception' },
  { key: 'FAKE_IDENTITY',       label: 'Fake identity',            description: 'Impersonation or false identity' },
  { key: 'SPAM',                label: 'Spam',                     description: 'Repeated unsolicited or low-quality content' },
  { key: 'HARASSMENT',          label: 'Harassment',               description: 'Abusive or threatening behavior toward others' },
  { key: 'INAPPROPRIATE',       label: 'Inappropriate content',    description: 'Content that violates community standards' },
  { key: 'TERMS_VIOLATION',     label: 'Terms of service',         description: 'Violation of platform terms of service' },
  { key: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious activity',      description: 'Unusual or potentially malicious behavior' },
  { key: 'OTHER',               label: 'Other',                    description: 'Specify in the details field below' },
];

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, AdminUserDetailPanelComponent],
  templateUrl: './admin-users-page.component.html',
})
export class AdminUsersPageComponent implements OnInit {
  isLoading = signal(true);
  users = signal<AdminUser[]>([]);
  activeFilter = signal<UserFilter>('ALL');
  searchQuery = signal('');
  viewedUser = signal<AdminUser | null>(null);

  banModal = signal<{ open: boolean; userId: string; userName: string; reasonKey: string; details: string }>({
    open: false, userId: '', userName: '', reasonKey: '', details: '',
  });

  unbanModal = signal<{ open: boolean; user: AdminUser | null }>({
    open: false, user: null,
  });

  readonly banReasons = BAN_REASONS;

  filters: { label: string; value: UserFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Banned', value: 'BANNED' },
  ];

  currentPage = signal(1);
  readonly pageSize = 15;

  filteredUsers = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase().trim();
    let list = this.users();
    if (filter === 'BANNED') list = list.filter(u => u.isBanned);
    if (query) list = list.filter(u =>
      u.fullName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  paginatedUsers = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  });

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  openUserDetail(user: AdminUser): void {
    this.viewedUser.set(user);
  }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setFilter(filter: UserFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
      BENEFICIARY: 'bg-blue-50 text-blue-700 border border-blue-200',
      USER: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    return map[role] ?? 'bg-gray-100 text-gray-600';
  }

  openBanModal(user: AdminUser): void {
    this.banModal.set({ open: true, userId: user.id, userName: user.fullName, reasonKey: '', details: '' });
  }

  closeBanModal(): void {
    this.banModal.set({ open: false, userId: '', userName: '', reasonKey: '', details: '' });
  }

  getReasonDescription(key: string): string {
    return this.banReasons.find(r => r.key === key)?.description ?? '';
  }

  selectReason(key: string): void {
    this.banModal.update(m => ({ ...m, reasonKey: key }));
  }

  setDetails(details: string): void {
    this.banModal.update(m => ({ ...m, details }));
  }

  confirmBan(): void {
    const { userId, reasonKey, details } = this.banModal();
    if (!reasonKey) return;
    const label = this.banReasons.find(r => r.key === reasonKey)?.label ?? reasonKey;
    const reason = details.trim() ? `${label}: ${details.trim()}` : label;
    this.adminService.banUser(userId, reason).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === userId ? { ...u, isBanned: true } : u)
        );
        this.closeBanModal();
      },
    });
  }

  openUnbanModal(user: AdminUser): void {
    this.unbanModal.set({ open: true, user });
  }

  closeUnbanModal(): void {
    this.unbanModal.set({ open: false, user: null });
  }

  confirmUnban(): void {
    const userId = this.unbanModal().user?.id;
    if (!userId) return;
    this.adminService.unbanUser(userId).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === userId ? { ...u, isBanned: false, banReason: undefined, bannedAt: undefined } : u)
        );
        this.closeUnbanModal();
      },
    });
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(id: string): string {
    const colors = [
      '#FF594B', '#3B82F6', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#65A30D',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
