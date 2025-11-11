import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DatabaseService } from '../../core/services/database.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dbService = inject(DatabaseService);
  
  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  
  roles = [
    { id: 1, name: 'HR' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Clerk' },
    { id: 4, name: 'Senior Clerk' },
    { id: 5, name: 'Accountant' }
  ];

  constructor() {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  private redirectToDashboard(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      const role = user.roles[0];
      switch (role) {
        case 'admin':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'accountant':
          this.router.navigate(['/accountant/dashboard']);
          break;
        case 'adm_hod':
          this.router.navigate(['/hod/dashboard']);
          break;
        default:
          this.router.navigate(['/clerk/dashboard']);
          break;
      }
    }
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.signupForm.disable({ emitEvent: false });
    this.error = null;
    this.success = null;
    
    const { fullName, email, password, role } = this.signupForm.value;
    const selectedRole = this.roles.find(r => r.id === parseInt(role));
    
    console.log('=== SIGNUP FORM DATA ===');
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('Selected Role ID:', role);
    console.log('Selected Role Name:', selectedRole?.name);
    console.log('========================');
    
    try {
      const newUser = await this.dbService.createUser({
        full_name: fullName,
        email: email,
        password: password,
        role_id: parseInt(role)
      });

      if (newUser) {
        this.success = 'Account created successfully! You can now login with your credentials.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.error = 'Failed to create account. Please try again.';
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      const message = err?.message || err?.error?.message || '';
      
      if (message.includes('duplicate key') || message.includes('already exists')) {
        this.error = 'An account with this email already exists.';
      } else if (message.includes('invalid email')) {
        this.error = 'Please enter a valid email address.';
      } else {
        this.error = `Failed to create account: ${message || 'Unknown error'}`;
      }
    } finally {
      this.isLoading = false;
      this.signupForm.enable({ emitEvent: false });
    }
  }

  onLoginRedirect() {
    this.router.navigate(['/login']);
  }

  get fullName() {
    return this.signupForm.get('fullName');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get role() {
    return this.signupForm.get('role');
  }
}