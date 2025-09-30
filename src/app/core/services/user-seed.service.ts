import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserSeedService {
  private supabase = inject(SupabaseService);

  async seedUsers() {
    throw new Error('User seeding disabled. Use proper user registration flow.');


  }
}