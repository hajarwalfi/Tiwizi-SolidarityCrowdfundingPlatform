import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  BeneficiaryCampaignResponse,
  BeneficiaryCampaignDocument,
  BeneficiaryDashboardStats,
  CampaignUpdateResponse,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CreateCampaignUpdateRequest,
} from '../models/beneficiary.model';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaryService {
  private readonly apiUrl = `${environment.apiUrl}/beneficiary`;

  constructor(private http: HttpClient) {}

  /**
   * Get current beneficiary's campaigns
   */
  getMyCampaigns(): Observable<BeneficiaryCampaignResponse[]> {
    return this.http.get<BeneficiaryCampaignResponse[]>(`${this.apiUrl}/campaigns`);
  }

  /**
   * Create a new campaign
   */
  createCampaign(request: CreateCampaignRequest): Observable<BeneficiaryCampaignResponse> {
    return this.http.post<BeneficiaryCampaignResponse>(`${this.apiUrl}/campaigns`, request);
  }

  /**
   * Update an existing campaign
   */
  updateCampaign(
    id: string,
    request: UpdateCampaignRequest,
  ): Observable<BeneficiaryCampaignResponse> {
    return this.http.put<BeneficiaryCampaignResponse>(`${this.apiUrl}/campaigns/${id}`, request);
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<BeneficiaryDashboardStats> {
    return this.http.get<BeneficiaryDashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Create a campaign update (news)
   */
  createCampaignUpdate(
    campaignId: string,
    request: CreateCampaignUpdateRequest,
  ): Observable<CampaignUpdateResponse> {
    return this.http.post<CampaignUpdateResponse>(
      `${this.apiUrl}/campaigns/${campaignId}/updates`,
      request,
    );
  }

  /**
   * Get updates for a campaign
   */
  getCampaignUpdates(campaignId: string): Observable<CampaignUpdateResponse[]> {
    return this.http.get<CampaignUpdateResponse[]>(
      `${this.apiUrl}/campaigns/${campaignId}/updates`,
    );
  }

  /**
   * Delete a campaign (PENDING or REJECTED only)
   */
  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${id}`);
  }

  /**
   * Archive a campaign (ACTIVE, CLOSED, COMPLETED) — hides it publicly
   */
  archiveCampaign(id: string): Observable<BeneficiaryCampaignResponse> {
    return this.http.patch<BeneficiaryCampaignResponse>(`${this.apiUrl}/campaigns/${id}/archive`, {});
  }

  /**
   * Unarchive a campaign — restores it to CLOSED (visible again)
   */
  unarchiveCampaign(id: string): Observable<BeneficiaryCampaignResponse> {
    return this.http.patch<BeneficiaryCampaignResponse>(`${this.apiUrl}/campaigns/${id}/unarchive`, {});
  }

  /**
   * Upload an image for a campaign update (stored in Cloudinary)
   */
  uploadUpdateImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/image`, formData);
  }

  /**
   * Upload a document (photo, ID card, RIB, etc.) for a campaign
   */
  uploadCampaignDocument(campaignId: string, file: File, documentType: string): Observable<BeneficiaryCampaignDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<BeneficiaryCampaignDocument>(`${this.apiUrl}/campaigns/${campaignId}/documents`, formData);
  }

  /**
   * Delete a campaign document
   */
  deleteCampaignDocument(campaignId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}/documents/${documentId}`);
  }

  /**
   * Delete a campaign update
   */
  deleteCampaignUpdate(campaignId: string, updateId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}/updates/${updateId}`);
  }
}
