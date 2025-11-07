import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  ngOnInit(): void {
    // Load saved theme
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial user from auth if available
    const current = this.auth.currentUserValue;
    if (current) {
      this.user = current;
      this.form.patchValue({ name: this.user.name, email: this.user.email });
      this.isLoading = false;
    }
    // Refresh user roles from backend
    this.auth.refreshUserRoles();
    // Subscribe to changes
    this.sub = this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.user = u;
        this.isLoading = false;
        if (!this.isEditing) {
          this.form.patchValue({ name: this.user.name, email: this.user.email });
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
    this.form.patchValue({
      name: this.user?.name || '',
      email: this.user?.email || ''
    });
  }

  onCancel(): void {
    this.isEditing = false;
    this.form.reset({
      name: this.user?.name || '',
      email: this.user?.email || ''
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    const { name, email } = this.form.value;
    this.user = {
      ...this.user,
      name,
      email
    };
    this.isEditing = false;
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

