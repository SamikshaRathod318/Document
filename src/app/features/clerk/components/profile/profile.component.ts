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
    roles: ['clerk'],
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

  // Friendly roles for display in UI; maps any internal '*clerk' to 'Clerk'
  get displayRoles(): string {
    const roles: string[] = this.user?.roles || [];
    if (!roles.length) return 'Clerk';
    const mapped = roles.map(r => r?.toLowerCase().includes('clerk') ? 'Clerk' : r);
    // Deduplicate and join
    return Array.from(new Set(mapped)).join(', ');
  }

  // Primary role to display (single role only)
  get displayPrimaryRole(): string {
    const roles: string[] = (this.user?.roles || []).map((r: string) => r?.toLowerCase());
    if (!roles.length) return 'Clerk';

    // 1) If user has an explicit activeRole (chosen at login), prefer that
    const ar = this.user?.activeRole?.toLowerCase();
    if (ar) {
      if (ar === 'adm_hod' || ar === 'hod') return 'HOD';
      if (ar === 'accountant') return 'Accountant';
      if (ar === 'adm_sr_clerk' || ar === 'senior_clerk') return 'Senior Clerk';
      if (ar === 'adm_clerk' || ar === 'clerk') return 'Clerk';
    }

    // Prefer role by current route/section if available
    const url = this.router.url || '';
    if (url.startsWith('/hod') && (roles.includes('adm_hod') || roles.includes('hod'))) {
      return 'HOD';
    }
    if (url.startsWith('/accountant') && roles.includes('accountant')) {
      return 'Accountant';
    }
    if (url.startsWith('/clerk')) {
      if (roles.includes('adm_sr_clerk') || roles.includes('senior_clerk')) return 'Senior Clerk';
      if (roles.includes('adm_clerk') || roles.includes('clerk')) return 'Clerk';
    }

    // Priority order
    const priority: { match: (r: string) => boolean; label: string }[] = [
      { match: r => r === 'adm_hod' || r === 'hod', label: 'HOD' },
      { match: r => r === 'accountant', label: 'Accountant' },
      { match: r => r === 'adm_sr_clerk' || r === 'senior_clerk', label: 'Senior Clerk' },
      { match: r => r === 'adm_clerk' || r === 'clerk', label: 'Clerk' }
    ];

    for (const p of priority) {
      if (roles.some(p.match)) {
        return p.label;
      }
    }
    // Fallback to first role if none matched (unlikely)
    return roles[0]?.replace(/_/g, ' ')?.replace(/^adm\s*/i, '') || 'Clerk';
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

