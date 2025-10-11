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
  user: User | any = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles: ['admin'],
    createdAt: new Date('2023-01-15')
  };
  
  isEditing = false;
  form: FormGroup;
  private sub?: Subscription;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]]
    });
  }
  
  ngOnInit(): void {
    // Set initial user from auth if available
    const current = this.auth.currentUserValue;
    if (current) {
      this.user = {
        ...this.user,
        ...current
      };
      this.form.patchValue({ name: this.user.name, email: this.user.email });
    }
    // Refresh user roles from backend
    this.auth.refreshUserRoles();
    // Subscribe to changes
    this.sub = this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.user = { ...this.user, ...u };
        if (!this.isEditing) {
          this.form.patchValue({ name: this.user.name, email: this.user.email });
        }
      }
    });
  }
  
  get userInitials(): string {
    return this.user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'JD';
  }
  
  get formattedJoinDate(): string {
    return this.user?.createdAt 
      ? new Date(this.user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'January 2023';
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

