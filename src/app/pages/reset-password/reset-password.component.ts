import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  form: FormGroup;
  emailForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  info: string | null = null;
  hasRecoverySession = false;

  constructor() {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.initializeRecoverySession();
  }

  passwordsMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  private async initializeRecoverySession() {
    try {
      const hash = window.location.hash || '';
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const type = params.get('type') || '';
      const accessToken = params.get('access_token') || '';
      const refreshToken = params.get('refresh_token') || '';

      if (type.toLowerCase() === 'recovery' && accessToken && refreshToken) {
        this.isLoading = true;
        const { error } = await this.supabase.getClient().auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (!error) {
          this.hasRecoverySession = true;
        }
        this.isLoading = false;
      } else {
        // Fallback: check if session already exists (e.g., opened from email and restored)
        const { data } = await this.supabase.getClient().auth.getSession();
        this.hasRecoverySession = !!data.session;
      }
    } catch {
      this.hasRecoverySession = false;
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.info = null;
    try {
      const { error } = await this.supabase.getClient().auth.updateUser({
        password: this.form.value.password
      } as any);
      if (error) {
        this.error = error.message || 'Could not reset password';
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      this.info = 'Password updated successfully. You can now log in.';
      setTimeout(() => this.router.navigate(['/login']), 1000);
    } catch (e: any) {
      this.isLoading = false;
      this.error = e?.message || 'Could not reset password';
    }
  }

  async onSendResetEmail() {
    if (this.emailForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.info = null;
    try {
      const email = (this.emailForm.value.email || '').toString();
      const redirectUrl = window.location.origin + '/reset-password';
      const { error } = await this.supabase.resetPassword(email, redirectUrl);
      if (error) {
        this.error = error.message || 'Could not send reset email';
        this.isLoading = false;
        return;
      }
      this.isLoading = false;
      this.info = 'Reset email sent. Check your inbox for the link.';
    } catch (e: any) {
      this.isLoading = false;
      this.error = e?.message || 'Could not send reset email';
    }
  }
}


