import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MockUserService } from './mock-user.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private supabase = inject(SupabaseService);
  private mockService = inject(MockUserService);
  private useOfflineMode = false; // Set to false to use real backend authentication

  async insertUsers() {
    throw new Error('Direct user insertion disabled. Use proper user registration flow.');
  }

  async deleteAllUsers() {
    const { error } = await this.supabase.getClient()
      .from('users')
      .delete()
      .neq('id', 0); // Delete all users
    
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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select('id, full_name, email, password, role_id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (error) {
      // Only log and return null on not-found like cases, throw otherwise
      console.error('fetchUserByEmail error:', error);
      return null;
    }
    return data || null;
  }

  async createUser(userData: { full_name: string; email: string; password: string; role_id: number }) {
    try {
      console.log('=== BACKEND USER CREATION ===');
      console.log('User Data:', userData);
      console.log('Role ID being inserted:', userData.role_id);

      // Validate role exists
      const roleData = await this.getRoleById(userData.role_id);
      if (!roleData) {
        throw new Error('Invalid role selected. Please choose a valid role.');
      }
      
      console.log('Role Name for ID', userData.role_id, ':', roleData?.role_name);
      
      const normalizedEmail = (userData.email || '').trim().toLowerCase();
      const normalizedPassword = (userData.password || '').trim();
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .insert({
          full_name: userData.full_name,
          email: normalizedEmail,
          password: normalizedPassword,
          role_id: userData.role_id
        })
        .select();
      
      if (error) {
        console.error('Supabase error creating user:', error);
        throw new Error(error.message || 'Database error');
      }
      
      console.log('User created successfully with role:', roleData?.role_name);
      console.log('Created user data:', data);
      
      // Show all users after creation
      await this.showAllUsersWithRoles();
      
      return data?.[0] || null;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw new Error(error.message || 'Unknown database error');
    }
  }

  async getOrCreateRoleIdByName(roleName: string): Promise<number> {
    const normalized = (roleName || '').trim();
    if (!normalized) {
      throw new Error('Role name is required');
    }
    // Try to find role by name
    const { data: found } = await this.supabase.getClient()
      .from('roles')
      .select('role_id, role_name')
      .eq('role_name', normalized)
      .maybeSingle();
    if (found?.role_id) return found.role_id;

    // If not found, insert it
    const { data, error } = await this.supabase.getClient()
      .from('roles')
      .insert({ role_name: normalized })
      .select('role_id')
      .single();
    if (error) {
      // Possible race: try fetch again
      const { data: retry } = await this.supabase.getClient()
        .from('roles')
        .select('role_id')
        .eq('role_name', normalized)
        .single();
      if (retry?.role_id) return retry.role_id;
      throw error;
    }
    return data?.role_id as number;
  }

  async createTestUser() {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .insert({
        full_name: 'Test',
        email: 'test@test.com',
        password: '123',
        role_id: 1  // Clerk role
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
        id,
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
          id,
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
      userId: (user as any).id,
      name: user.full_name,
      email: user.email,
      roleId: user.role_id,
      roleName: (user as any).roles?.role_name || 'No Role'
    }));
  }

  async getUserRoles(userId: string) {
    if (this.useOfflineMode) {
      return await this.mockService.getRoleById(parseInt(userId));
    }
    
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select(`
        role_id,
        roles(role_name)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get user roles:', error);
      return null;
    }
    return data;
  }

  async authenticateUser(email: string, password: string) {
    if (this.useOfflineMode) {
      return await this.mockService.authenticateUser(email, password);
    }
    
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPassword = (password || '').trim();
      let user = await this.fetchUserByEmail(normalizedEmail);

      // If user does not exist, create one (dev-friendly behavior)
      if (!user) {
        await this.insertUserIfNotExists(normalizedEmail, normalizedPassword);
        user = await this.fetchUserByEmail(normalizedEmail);
      }

      if (user && user.password === normalizedPassword) {
        // Update name if it's still 'Test User'
        if (user.full_name === 'Test User') {
          await this.updateUserName(normalizedEmail);
          return await this.fetchUserByEmail(normalizedEmail);
        }
        return user;
      }

      // Dev-friendly: if user exists but password mismatch, update password to provided one
      if (user && user.password !== normalizedPassword) {
        await this.supabase.getClient()
          .from('users')
          .update({ password: normalizedPassword })
          .eq('email', normalizedEmail);
        return await this.fetchUserByEmail(normalizedEmail);
      }
    } catch (error) {
      console.log('User not found, creating new user');
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPassword = (password || '').trim();
      await this.insertUserIfNotExists(normalizedEmail, normalizedPassword);
      return await this.fetchUserByEmail(normalizedEmail);
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
          id,
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
        { role_name: 'HR' },
        { role_name: 'Admin' },
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

  async getRoleById(roleId: number) {
    if (this.useOfflineMode) {
      return await this.mockService.getRoleById(roleId);
    }
    
    try {
      const { data, error } = await this.supabase.getClient()
        .from('roles')
        .select('role_name')
        .eq('role_id', roleId)
        .single();
      
      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get role:', error);
      return null;
    }
  }

  async showAllUsersWithRoles() {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('users')
        .select(`
          *,
          roles(role_id, role_name)
        `);
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      console.log('=== ALL USERS IN DATABASE ===');
      data?.forEach((user: any) => {
        console.log(`User: ${user.full_name} (${user.email})`);
        console.log(`Role ID: ${user.role_id}`);
        console.log(`Role Name: ${user.roles?.role_name || 'No Role'}`);
        console.log('---');
      });
      console.log('=============================');
      
    } catch (error) {
      console.error('Failed to show users:', error);
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