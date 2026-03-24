import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campaign } from '../models/campaign.model';

export interface FavoriteResponse {
  id: string;
  campaign: Campaign;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly apiUrl = `${environment.apiUrl}/favorites`;

  constructor(private http: HttpClient) {}

  /**
   * Add a campaign to favorites
   */
  addFavorite(campaignId: string): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(`${this.apiUrl}/${campaignId}`, {});
  }

  /**
   * Remove a campaign from favorites
   */
  removeFavorite(campaignId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${campaignId}`);
  }

  /**
   * Get all favorites for the authenticated user
   */
  getMyFavorites(): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(`${this.apiUrl}/my`);
  }

  /**
   * Check if a campaign is favorited
   */
  checkFavorite(campaignId: string): Observable<{ isFavorited: boolean }> {
    return this.http.get<{ isFavorited: boolean }>(`${this.apiUrl}/check/${campaignId}`);
  }

  /**
   * Get favorite count for a campaign
   */
  getFavoriteCount(campaignId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/${campaignId}`);
  }
}
