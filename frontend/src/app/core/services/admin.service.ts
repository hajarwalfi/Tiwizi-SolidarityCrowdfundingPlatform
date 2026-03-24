import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campaign } from '../models/campaign.model';
import {
  AdminUser,
  AdminUserDetail,
  AdminReport,
  AdminPayment,
  SuspendCampaignRequest,
} from '../models/admin.model';

// ===== Activity Feed =====
export interface AdminActivity {
  id: string;
  type: 'NEW_CAMPAIGN' | 'REPORT' | 'NEW_USER' | 'CAMPAIGN_CLOSING' | 'CAMPAIGN_FUNDED';
  title: string;
  description: string;
  createdAt: string;
  relatedEntityId?: string;
}

export interface PagedActivitiesResponse {
  items: AdminActivity[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ===== Statistics Response =====
export interface AdminStats {
  totalCampaigns: number;
  pendingCampaigns: number;
  approvedCampaigns: number;
  rejectedCampaigns: number;
  closedCampaigns: number;
  totalUsers: number;
  totalDonations: number;
  totalAmountRaised: number;
  totalReports: number;
}

// ===== Request DTOs =====
export interface ReviewCampaignRequest {
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ===== ACTIVITY FEED =====

  /** Latest 20 activities for the dashboard mini-panel */
  getRecentActivities(): Observable<AdminActivity[]> {
    return this.http.get<AdminActivity[]>(`${this.apiUrl}/activities/recent`);
  }

  /** All activities with server-side pagination */
  getActivities(page = 0, size = 15): Observable<PagedActivitiesResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedActivitiesResponse>(`${this.apiUrl}/activities`, { params });
  }

  // ===== STATISTICS =====

  /**
   * Get platform statistics
   */
  getStatistics(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/statistics`);
  }

  // ===== CAMPAIGN MANAGEMENT =====

  /**
   * Get pending campaigns for review
   */
  getPendingCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns/pending`);
  }

  /**
   * Get all campaigns with optional status filter
   */
  getAllCampaigns(status?: string): Observable<Campaign[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns`, { params });
  }

  /**
   * Approve a campaign
   */
  approveCampaign(campaignId: string): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${campaignId}/approve`, {});
  }

  /**
   * Reject a campaign
   */
  rejectCampaign(campaignId: string, request: ReviewCampaignRequest): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${campaignId}/reject`, request);
  }

  /**
   * Suspend an active campaign
   */
  suspendCampaign(campaignId: string, request: SuspendCampaignRequest): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${campaignId}/suspend`, request);
  }

  /**
   * Unsuspend a suspended campaign
   */
  unsuspendCampaign(campaignId: string): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${campaignId}/unsuspend`, {});
  }

  /**
   * Delete a fraudulent campaign
   */
  deleteCampaign(campaignId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}`);
  }

  // ===== USER MANAGEMENT =====

  /**
   * Get all users
   */
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  /**
   * Get detailed profile for a single user (campaigns + donations)
   */
  getUserDetail(userId: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Ban a user
   */
  banUser(userId: string, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/ban`, {}, { params });
  }

  /**
   * Unban a user
   */
  unbanUser(userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/unban`, {});
  }

  // ===== REPORT MANAGEMENT =====

  /**
   * Get all reports
   */
  getAllReports(status?: string): Observable<AdminReport[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminReport[]>(`${this.apiUrl}/reports`, { params });
  }

  suspendCampaignFromReport(reportId: string, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) params = params.set('reason', reason);
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/suspend-campaign`, {}, { params });
  }

  banUserFromReport(reportId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/ban-user`, {});
  }

  dismissReport(reportId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reports/${reportId}/dismiss`, {});
  }

  // ===== PAYMENT MANAGEMENT =====

  /**
   * Get all payments/donations
   */
  getAllPayments(): Observable<AdminPayment[]> {
    return this.http.get<AdminPayment[]>(`${this.apiUrl}/payments`);
  }
}
