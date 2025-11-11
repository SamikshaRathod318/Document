import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | any = null;
  isLoading = true;
  
  isEditing = false;
  form: FormGroup;
  private sub?: Subscription;
  currentTheme = 'light';
  lastLoginTime: string = '';
  currentLoginTime: string = '';
  
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      dateOfBirth: [''],
      gender: [''],
      address: [''],
      emergencyContact: [''],
      emergencyPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });
  }
  
  ngOnInit(): void {
    // Load saved theme
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set current login time
    this.currentLoginTime = new Date().toLocaleString();
    
    // Get login times from profile service
    const loginTimes = this.profileService.getLoginTimes();
    this.currentLoginTime = loginTimes.current;
    this.lastLoginTime = loginTimes.last;
    
    // Set initial user from auth if available
    const current = this.auth.currentUserValue;
    if (current) {
      this.user = { ...current, ...this.getStoredProfileData() };
      this.patchFormWithUserData();
      this.isLoading = false;
    }
    // Refresh user roles from backend
    this.auth.refreshUserRoles();
    // Subscribe to changes
    this.sub = this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.user = { ...u, ...this.getStoredProfileData() };
        this.isLoading = false;
        if (!this.isEditing) {
          this.patchFormWithUserData();
        }
      } else {
        this.isLoading = false;
      }
    });
  }
  
  get userInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }
  
  get formattedJoinDate(): string {
    if (!this.user?.createdAt) return 'Not available';
    return new Date(this.user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Friendly roles for display in UI
  get displayRoles(): string {
    const roles: string[] = this.user?.roles || [];
    if (!roles.length) return 'Clerk';
    const mapped = roles.map(r => {
      const role = r?.toLowerCase();
      if (role === 'admin') return 'Admin';
      if (role === 'hod') return 'HOD';
      if (role === 'accountant') return 'Accountant';
      if (role === 'clerk') return 'Clerk';
      return r;
    });
    return Array.from(new Set(mapped)).join(', ');
  }

  // Primary role to display (exact same as backend)
  get displayPrimaryRole(): string {
    // Show exact role from backend
    return this.user?.activeRole || 'No Role Assigned';
  }

  onEdit(): void {
    this.isEditing = true;
    this.patchFormWithUserData();
  }

  onCancel(): void {
    this.isEditing = false;
    this.patchFormWithUserData();
  }

  onSave(): void {
    if (this.form.invalid) return;
    const formData = this.form.value;
    this.user = {
      ...this.user,
      ...formData
    };
    this.saveProfileData(formData);
    this.isEditing = false;
    
    // Show success message
    this.snackBar.open('Profile updated successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
  }

  private getStoredProfileData(): any {
    return this.profileService.getProfileData();
  }
  
  private saveProfileData(data: any): void {
    this.profileService.saveProfileData(data);
  }
  
  private patchFormWithUserData(): void {
    this.form.patchValue({
      name: this.user?.name || '',
      email: this.user?.email || '',
      phone: this.user?.phone || '',
      dateOfBirth: this.user?.dateOfBirth || '',
      gender: this.user?.gender || '',
      address: this.user?.address || '',
      emergencyContact: this.user?.emergencyContact || '',
      emergencyPhone: this.user?.emergencyPhone || ''
    });
  }
  
  get formattedCurrentLogin(): string {
    return this.currentLoginTime;
  }
  
  get formattedLastLogin(): string {
    return this.lastLoginTime;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

