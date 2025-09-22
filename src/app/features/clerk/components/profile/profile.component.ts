import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

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

  constructor(private fb: FormBuilder, private auth: AuthService) {
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

