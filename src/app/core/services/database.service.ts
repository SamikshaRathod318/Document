import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private supabase = inject(SupabaseService);

  async insertUsers() {
    const users = [
      { full_name: 'Admin User', email: 'admin@test.com', password: 'admin123', role_id: 1 },
      { full_name: 'Clerk User', email: 'clerk@test.com', password: 'clerk123', role_id: 2 },
      { full_name: 'HOD User', email: 'hod@test.com', password: 'hod123', role_id: 3 }
    ];

    for (const user of users) {
      try {
        // Create user in Supabase auth
        const { data: authData, error: authError } = await this.supabase.getClient().auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
              role_id: user.role_id
            }
          }
        });
        
        if (authError) {
          console.error(`Auth signup failed for ${user.email}:`, authError);
          continue;
        }
        
        // Insert into custom users table
        const { error: dbError } = await this.supabase.getClient()
          .from('users')
          .insert({
            full_name: user.full_name,
            email: user.email,
            password: user.password, // Note: In production, don't store plain passwords
            role_id: user.role_id
          });
        
        if (dbError) {
          console.error(`DB insert failed for ${user.email}:`, dbError);
        } else {
          console.log(`Created user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error creating ${user.email}:`, error);
      }
    }
  }

  async deleteAllUsers() {
    const { error } = await this.supabase.getClient()
      .from('users')
      .delete()
      .neq('user_id', 0); // Delete all users
    
    if (error) {
      console.error('Failed to delete users:', error);
    } else {
      console.log('All users deleted');
    }
  }

  async getUsers() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Failed to get users:', error);
      return [];
    }
    return data || [];
  }

  async authenticateUser(email: string, password: string) {
    try {
      console.log('Querying users table for:', email);
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .select('user_id, full_name, email, role_id')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password.trim());
      
      if (error) {
        console.error('Database query error:', error);
        // Fallback to hardcoded users if database fails
        return this.getHardcodedUser(email, password);
      }
      
      if (data && data.length > 0) {
        console.log('User found in database:', data[0]);
        return data[0];
      }
      
      console.log('No user found in database, checking hardcoded users');
      return this.getHardcodedUser(email, password);
    } catch (error) {
      console.error('Authentication error:', error);
      return this.getHardcodedUser(email, password);
    }
  }

  private getHardcodedUser(email: string, password: string) {
    const hardcodedUsers = [
      { user_id: 1, full_name: 'Admin User', email: 'admin@test.com', password: 'admin123', role_id: 1 },
      { user_id: 2, full_name: 'Admin User', email: 'admin@gmail.com', password: 'admin123', role_id: 1 },
      { user_id: 3, full_name: 'Clerk User', email: 'clerk@test.com', password: 'clerk123', role_id: 2 },
      { user_id: 4, full_name: 'Test User', email: 'test@local.dev', password: 'Passw0rd!', role_id: 1 }
    ];
    
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    
    const user = hardcodedUsers.find(u => 
      u.email === normalizedEmail && u.password === normalizedPassword
    );
    
    if (user) {
      console.log('Hardcoded user found:', user);
      return user;
    }
    
    console.log('No hardcoded user found');
    return null;
  }
}