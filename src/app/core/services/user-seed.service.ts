import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserSeedService {
  private supabase = inject(SupabaseService);

  async seedUsers() {
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        metadata: {
          name: 'Admin User',
          roles: ['admin'],
          department: 'Administration'
        }
      },
      {
        email: 'clerk@test.com', 
        password: 'clerk123',
        metadata: {
          name: 'Clerk User',
          roles: ['clerk'],
          department: 'Administration'
        }
      },
      {
        email: 'hod@test.com',
        password: 'hod123', 
        metadata: {
          name: 'HOD User',
          roles: ['hod'],
          department: 'Administration'
        }
      }
    ];

    console.log('Creating test users...');
    
    for (const user of testUsers) {
      try {
        const response = await this.supabase.signUp(user.email, user.password, user.metadata);
        if (response.error) {
          console.error(`Failed to create ${user.email}:`, response.error.message);
        } else {
          console.log(`Created user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error creating ${user.email}:`, error);
      }
    }
  }
}