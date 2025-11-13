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
  private activeStorageKey = this.PROFILE_KEY;
  private profileDataSubject = new BehaviorSubject<ProfileData>({});
  
  public profileData$ = this.profileDataSubject.asObservable();

  constructor() {
    this.loadProfileData();
  }

  setActiveUser(userId: string | null): void {
    const nextKey = userId ? `${this.PROFILE_KEY}_${userId}` : this.PROFILE_KEY;
    if (nextKey === this.activeStorageKey) {
      return;
    }
    this.activeStorageKey = nextKey;
    this.loadProfileData();
  }

  private loadProfileData(): void {
    const stored = localStorage.getItem(this.activeStorageKey);
    if (!stored) {
      this.profileDataSubject.next({});
      return;
    }
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.profileDataSubject.next(data);
      } catch (error) {
        console.error('Error loading profile data:', error);
        this.profileDataSubject.next({});
      }
    }
  }

  saveProfileData(data: ProfileData): void {
    try {
      localStorage.setItem(this.activeStorageKey, JSON.stringify(data));
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
    localStorage.removeItem(this.activeStorageKey);
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