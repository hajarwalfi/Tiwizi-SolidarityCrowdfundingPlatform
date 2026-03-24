import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campaign, CreateCampaignDto, CampaignCategory, CampaignStatus, CampaignUpdate } from '../models/campaign.model';

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CampaignSearchParams {
  keyword?: string;
  category?: CampaignCategory;
  status?: CampaignStatus;
  location?: string;
  isUrgent?: boolean;
  deadlineSoon?: boolean;
  nearlyFunded?: boolean;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly apiUrl = `${environment.apiUrl}/campaigns`;

  constructor(private http: HttpClient) {}

  /**
   * Get all campaigns
   */
  getAllCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  /**
   * Get a campaign by ID
   */
  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new campaign (beneficiary endpoint)
   */
  createCampaign(campaign: CreateCampaignDto): Observable<Campaign> {
    return this.http.post<Campaign>(`${environment.apiUrl}/beneficiary/campaigns`, campaign);
  }

  /**
   * Update an existing campaign
   */
  updateCampaign(id: string, campaign: Partial<CreateCampaignDto>): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/${id}`, campaign);
  }

  /**
   * Delete a campaign
   */
  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get campaigns by category
   */
  getCampaignsByCategory(category: string): Observable<Campaign[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<Campaign[]>(this.apiUrl, { params });
  }

  /**
   * Get campaigns by status
   */
  getCampaignsByStatus(status: string): Observable<Campaign[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Campaign[]>(this.apiUrl, { params });
  }

  /**
   * Get urgent campaigns only
   */
  getUrgentCampaigns(): Observable<Campaign[]> {
    const params = new HttpParams().set('urgent', 'true');
    return this.http.get<Campaign[]>(this.apiUrl, { params });
  }

  /**
   * Search campaigns with filters and pagination
   */
  searchCampaigns(searchParams: CampaignSearchParams): Observable<PageResponse<Campaign>> {
    let params = new HttpParams();

    if (searchParams.keyword) {
      params = params.set('keyword', searchParams.keyword);
    }
    if (searchParams.category) {
      params = params.set('category', searchParams.category);
    }
    if (searchParams.status) {
      params = params.set('status', searchParams.status);
    }
    if (searchParams.location) {
      params = params.set('location', searchParams.location);
    }
    if (searchParams.isUrgent !== undefined) {
      params = params.set('isUrgent', searchParams.isUrgent.toString());
    }
    if (searchParams.deadlineSoon !== undefined) {
      params = params.set('deadlineSoon', searchParams.deadlineSoon.toString());
    }
    if (searchParams.nearlyFunded !== undefined) {
      params = params.set('nearlyFunded', searchParams.nearlyFunded.toString());
    }
    if (searchParams.page !== undefined) {
      params = params.set('page', searchParams.page.toString());
    }
    if (searchParams.size !== undefined) {
      params = params.set('size', searchParams.size.toString());
    }

    return this.http.get<PageResponse<Campaign>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get campaigns by category with pagination
   */
  getCampaignsByCategoryPaginated(category: CampaignCategory, page: number = 0, size: number = 10): Observable<PageResponse<Campaign>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Campaign>>(`${this.apiUrl}/category/${category}`, { params });
  }

  /**
   * Get updates for a campaign
   */
  getCampaignUpdates(campaignId: string): Observable<CampaignUpdate[]> {
    return this.http.get<CampaignUpdate[]>(`${this.apiUrl}/${campaignId}/updates`);
  }
}
