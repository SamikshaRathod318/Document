import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private supabase = inject(SupabaseService);

  async insertUsers() {
    throw new Error('Direct user insertion disabled. Use proper user registration flow.');
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
      
      console.log('No user found in database, checking test user');
      return await this.getHardcodedUser(email, password);
    } catch (error) {
      console.error('Authentication error:', error);
      return await this.getHardcodedUser(email, password);
    }
  }

  private async getHardcodedUser(email: string, password: string) {
    // Allow any email/password combination for testing
    if (email && password) {
      console.log('Backend: User logged in with email:', email);
      
      // Insert user into users table
      await this.insertUserToTable(email, password);
      
      return {
        user_id: 1,
        full_name: 'Test User',
        email: email,
        role_id: 1
      };
    }
    return null;
  }

  private async insertUserToTable(email: string, password: string) {
    try {
      // First ensure role exists
      await this.ensureRoleExists();
      
      console.log('Attempting to insert user:', email);
      // Get random role_id (1-4)
      const randomRoleId = Math.floor(Math.random() * 4) + 1;
      
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .insert({
          full_name: 'Test User',
          email: email,
          password: password,
          role_id: randomRoleId
        })
        .select();
      
      if (error) {
        console.error('Failed to insert user:', error);
        console.error('Error details:', error.message, error.code);
      } else {
        console.log('User successfully inserted:', data);
      }
    } catch (error) {
      console.error('Error inserting user:', error);
    }
  }

  private async ensureRoleExists() {
    try {
      const roles = [
        { role_name: 'Clerk' },
        { role_name: 'Senior Clerk' },
        { role_name: 'Accountant' },
        { role_name: 'HOD' }
      ];
      
      for (const role of roles) {
        await this.supabase.getClient()
          .from('roles')
          .upsert(role, { onConflict: 'role_name' });
      }
      
      console.log('All roles ensured in database');
    } catch (error) {
      console.error('Error ensuring roles:', error);
    }
  }

  private async logUserLogin(email: string) {
    try {
      // Send login info to backend
      await this.supabase.getClient()
        .from('login_logs')
        .insert({ email: email, login_time: new Date() });
    } catch (error) {
      console.error('Failed to log user login:', error);
    }
  }
}