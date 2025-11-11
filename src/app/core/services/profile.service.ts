import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ProfileData {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly PROFILE_KEY = 'userProfileData';
  private profileDataSubject = new BehaviorSubject<ProfileData>({});
  
  public profileData$ = this.profileDataSubject.asObservable();

  constructor() {
    this.loadProfileData();
  }

  private loadProfileData(): void {
    const stored = localStorage.getItem(this.PROFILE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.profileDataSubject.next(data);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }
  }

  saveProfileData(data: ProfileData): void {
    try {
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(data));
      this.profileDataSubject.next(data);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  }

  getProfileData(): ProfileData {
    return this.profileDataSubject.value;
  }

  updateProfileField(field: keyof ProfileData, value: string): void {
    const currentData = this.getProfileData();
    const updatedData = { ...currentData, [field]: value };
    this.saveProfileData(updatedData);
  }

  clearProfileData(): void {
    localStorage.removeItem(this.PROFILE_KEY);
    this.profileDataSubject.next({});
  }

  // Login tracking methods
  getLoginTimes(): { current: string; last: string } {
    const current = localStorage.getItem('currentLoginTime') || new Date().toLocaleString();
    const last = localStorage.getItem('lastLoginTime') || 'First time login';
    return { current, last };
  }

  updateLoginTime(): void {
    const currentTime = new Date().toLocaleString();
    const lastLoginTime = localStorage.getItem('currentLoginTime') || 'First time login';
    
    localStorage.setItem('lastLoginTime', lastLoginTime);
    localStorage.setItem('currentLoginTime', currentTime);
  }
}