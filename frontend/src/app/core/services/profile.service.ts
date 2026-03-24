import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProfileResponse,
  UpdateUserProfileRequest,
  PublicUserProfileResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  /**
   * Get current user's profile
   */
  getMyProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`);
  }

  /**
   * Update current user's profile
   */
  updateMyProfile(
    request: UpdateUserProfileRequest,
  ): Observable<HttpResponse<UserProfileResponse>> {
    return this.http.put<UserProfileResponse>(`${this.apiUrl}/profile`, request, {
      observe: 'response',
    });
  }

  /**
   * Get public profile of any user
   */
  getPublicProfile(userId: string): Observable<PublicUserProfileResponse> {
    return this.http.get<PublicUserProfileResponse>(`${this.apiUrl}/profile/${userId}`);
  }

  /**
   * Upload profile picture
   * @param file The image file to upload
   */
  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/profile-picture`, formData);
  }

  /**
   * Upload background picture
   * @param file The image file to upload
   */
  uploadBackgroundPicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/background-picture`, formData);
  }

  /**
   * Change password (LOCAL auth users only)
   */
  changePassword(request: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, request);
  }

  /**
   * Unlink a social provider from the user's account
   */
  unlinkAccount(provider: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/unlink-account`, { provider });
  }
}
