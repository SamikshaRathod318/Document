import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          // Avoid Navigator LockManager contention seen in some environments
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();
    return await this.supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword
    });
  }

  async signUp(email: string, password: string, metadata?: any): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    return await this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async resetPassword(email: string, redirectTo?: string) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const options = redirectTo ? { emailRedirectTo: redirectTo } : undefined;
    return await this.supabase.auth.resetPasswordForEmail(normalizedEmail, options as any);
  }
}
