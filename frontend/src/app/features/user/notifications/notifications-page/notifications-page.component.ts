import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationApiService,
  NotificationResponse,
} from '../../../../core/services/notification-api.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent implements OnInit {
  notifications = signal<NotificationResponse[]>([]);
  loading = signal(true);

  constructor(private notificationApi: NotificationApiService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationApi.getAll().subscribe({
      next: (notifs) => {
        this.notifications.set(notifs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get unreadCount(): number {
    return this.notifications().filter((n) => !n.isRead).length;
  }

  markAllRead(): void {
    if (this.unreadCount === 0) return;
    this.notificationApi.markAllAsRead().subscribe(() => {
      this.notifications.update((notifs) => notifs.map((n) => ({ ...n, isRead: true })));
    });
  }

  deleteAll(): void {
    this.notificationApi.deleteAll().subscribe(() => {
      this.notifications.set([]);
    });
  }

  markAsRead(notif: NotificationResponse): void {
    if (notif.isRead) return;
    this.notificationApi.markAsRead(notif.id).subscribe(() => {
      this.notifications.update((notifs) =>
        notifs.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
    });
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US');
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'DONATION_RECEIVED':
        return 'bg-green-100 text-green-600';
      case 'DONATION_CONFIRMED':
        return 'bg-blue-100 text-blue-600';
      case 'CAMPAIGN_ACTIVE':
        return 'bg-emerald-100 text-emerald-600';
      case 'CAMPAIGN_REJECTED':
        return 'bg-red-100 text-red-600';
      case 'CAMPAIGN_CLOSED':
        return 'bg-purple-100 text-purple-600';
      case 'GOAL_REACHED':
        return 'bg-amber-100 text-amber-600';
      case 'CAMPAIGN_UPDATE':
        return 'bg-indigo-100 text-indigo-600';
      case 'CAMPAIGN_SUSPENDED':
        return 'bg-orange-100 text-orange-600';
      case 'CAMPAIGN_UNSUSPENDED':
        return 'bg-teal-100 text-teal-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'DONATION_RECEIVED':
        return 'Donation Received';
      case 'DONATION_CONFIRMED':
        return 'Donation Confirmed';
      case 'CAMPAIGN_ACTIVE':
        return 'Campaign Active';
      case 'CAMPAIGN_REJECTED':
        return 'Campaign Rejected';
      case 'CAMPAIGN_CLOSED':
        return 'Campaign Closed';
      case 'GOAL_REACHED':
        return 'Goal Reached';
      case 'CAMPAIGN_UPDATE':
        return 'Update';
      case 'CAMPAIGN_SUSPENDED':
        return 'Campaign Suspended';
      case 'CAMPAIGN_UNSUSPENDED':
        return 'Suspension Lifted';
      default:
        return 'Notification';
    }
  }
}
