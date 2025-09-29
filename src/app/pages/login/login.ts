import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserSeedService } from '../../core/services/user-seed.service';
import { DatabaseService } from '../../core/services/database.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private userSeed = inject(UserSeedService);
  private dbService = inject(DatabaseService);
  
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  info: string | null = null;
  loginInvalid = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Clear auth-invalid styling when user edits either field
    this.loginForm.valueChanges.subscribe(() => {
      if (this.loginInvalid) {
        this.loginInvalid = false;
        this.error = null;
        this.email?.setErrors(null);
        this.password?.setErrors(null);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.loginForm.disable({ emitEvent: false });
    this.error = null;
    this.info = null;
    this.loginInvalid = false;
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginForm.enable({ emitEvent: false });
      },
      error: (err) => {
        this.isLoading = false;
        this.loginForm.enable({ emitEvent: false });
        const message = err?.message || err?.error_description || err?.error || '';
        this.loginInvalid = true;
        // set a form-level auth error and avoid flagging individual controls
        this.loginForm.setErrors({ auth: true });
        if (err?.status === 0) {
          this.error = 'Cannot reach server. Check Supabase URL and network.';
        } else if (typeof message === 'string' && message.length > 0) {
          // Map common Supabase auth errors to friendlier messages
          const msgLower = message.toLowerCase();
          if (msgLower.includes('invalid login credentials')) {
            this.error = 'Invalid email or password. Try again or reset your password.';
            if (!environment.production && environment.devBypass?.enabled) {
              this.info = `Dev mode: Try ${environment.devBypass.email} / ${environment.devBypass.password}`;
            }
          } else if (msgLower.includes('email not confirmed')) {
            this.error = 'Email not confirmed. Please check your inbox for the confirmation email.';
          } else if (msgLower.includes('over email rate limit')) {
            this.error = 'Too many attempts. Please wait a minute and try again.';
          } else {
            this.error = message;
          }
        } else {
          this.error = 'Invalid email or password';
          if (!environment.production && environment.devBypass?.enabled) {
            this.info = `Dev mode: Try ${environment.devBypass.email} / ${environment.devBypass.password}`;
          }
        }
        console.error('Login error:', err);
      }
    });
  }

  onForgotPassword() {
    this.router.navigate(['/reset-password']);
  }

  async onCreateTestUsers() {
    this.isLoading = true;
    this.info = 'Creating test users...';
    try {
      await this.userSeed.seedUsers();
      this.info = 'Test users created! Try: admin@test.com/admin123 or clerk@test.com/clerk123';
    } catch (error) {
      this.error = 'Failed to create users: ' + (error as any)?.message;
    }
    this.isLoading = false;
  }

  async onInsertUsers() {
    this.isLoading = true;
    this.info = 'Inserting users into database...';
    try {
      await this.dbService.insertUsers();
      this.info = 'Users inserted! Try: admin@test.com/admin123';
    } catch (error) {
      this.error = 'Failed to insert users: ' + (error as any)?.message;
    }
    this.isLoading = false;
  }

  async onDeleteUsers() {
    this.isLoading = true;
    this.info = 'Deleting all users...';
    try {
      await this.dbService.deleteAllUsers();
      this.info = 'All users deleted from database';
    } catch (error) {
      this.error = 'Failed to delete users: ' + (error as any)?.message;
    }
    this.isLoading = false;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
