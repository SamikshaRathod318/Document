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

  async fetchUsers() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
     .select(`
        id, 
        full_name, 
        email, 
        phone, 
        role_id,
        created_at,
        roles(role_id, role_name)
      `);
    
    if (error) throw error;
    return data || [];
  }

  async fetchUserByEmail(email: string) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('id, full_name, email, password, phone, role, role_id, created_at')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createTestUser() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .insert({
        full_name: 'Test',
        email: 'test@test.com',
        password: '123',
        role: 'user'
      })
      .select();
    
    if (error) console.error('Error creating test user:', error);
    else console.log('Test user created:', data);
    return data;
  }

  async getUsers() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select(`
        user_id,
        full_name,
        email,
        role_id,
        roles(role_name)
      `);
    
    if (error) {
      console.error('Failed to get users:', error);
      return [];
    }
    console.log('Users with roles:', data);
    return data || [];
  }

  async getAllUsersWithRoles() {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .select(`
          user_id,
          full_name,
          email,
          role_id,
          roles(
            role_id,
            role_name
          )
        `);
      
      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }
      
      console.log('=== Users and Their Roles ===');
      data?.forEach(user => {
        console.log(`User: ${user.full_name} (${user.email})`);
        console.log(`Role: ${(user as any).roles?.role_name || 'No Role Assigned'}`);
        console.log('---');
      });
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async showUsersAndRoles() {
    const users = await this.getAllUsersWithRoles();
    return users.map(user => ({
      userId: user.user_id,
      name: user.full_name,
      email: user.email,
      roleId: user.role_id,
      roleName: (user as any).roles?.role_name || 'No Role'
    }));
  }

  async getUserRoles(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select(`
        role_id,
        roles(role_name)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get user roles:', error);
      return null;
    }
    return data;
  }

  async authenticateUser(email: string, password: string) {
    try {
      const user = await this.fetchUserByEmail(email);
      if (user && user.password === password) {
        // Update name if it's still 'Test User'
        if (user.full_name === 'Test User') {
          await this.updateUserName(email);
          return await this.fetchUserByEmail(email);
        }
        return user;
      }
    } catch (error) {
      console.log('User not found, creating new user');
      await this.insertUserIfNotExists(email, password);
      return await this.fetchUserByEmail(email);
    }
    return null;
  }

  private async updateUserName(email: string) {
    const emailPrefix = email.split('@')[0];
    const userName = emailPrefix.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
    const finalName = userName || emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    await this.supabase.getClient()
      .from('users')
      .update({ full_name: finalName })
      .eq('email', email);
  }

  private async insertUserIfNotExists(email: string, password: string) {
    try {
      const randomRoleId = Math.floor(Math.random() * 4) + 1;
      const emailPrefix = email.split('@')[0];
      const userName = emailPrefix.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
      const finalName = userName || emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      
      await this.supabase.getClient()
        .from('users')
        .insert({
          full_name: userName,
          email: email,
          password: password,
          role_id: randomRoleId
        });
    } catch (error) {
      console.log('User might already exist or DB error:', error);
    }
  }

  private async getHardcodedUser(email: string, password: string) {
    // Allow any email/password combination for testing
    if (email && password) {
      console.log('Backend: User logged in with email:', email);
      
      // Insert user into users table and get the created user
      const createdUser = await this.insertUserToTable(email, password);
      
      const userName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return createdUser || {
        user_id: 1,
        full_name: userName,
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
      const userName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .insert({
          full_name: userName,
          email: email,
          password: password,
          role_id: randomRoleId
        })
        .select(`
          user_id,
          full_name,
          email,
          role_id,
          roles(role_name)
        `);
      
      if (error) {
        console.error('Failed to insert user:', error);
        return null;
      } else {
        console.log('User successfully inserted:', data);
        return data?.[0] || null;
      }
    } catch (error) {
      console.error('Error inserting user:', error);
      return null;
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