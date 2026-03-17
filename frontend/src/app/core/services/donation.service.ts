import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Donation, CreateDonationDto } from '../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private readonly apiUrl = `${environment.apiUrl}/donations`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new donation
   */
  createDonation(donation: CreateDonationDto): Observable<Donation> {
    return this.http.post<Donation>(this.apiUrl, donation);
  }

  /**
   * Get donations by campaign ID
   */
  getDonationsByCampaign(campaignId: string): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }

  /**
   * Get current user's donations
   */
  getMyDonations(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/my`);
  }

  /**
   * Get donation by ID
   */
  getDonationById(id: string): Observable<Donation> {
    return this.http.get<Donation>(`${this.apiUrl}/${id}`);
  }
}
