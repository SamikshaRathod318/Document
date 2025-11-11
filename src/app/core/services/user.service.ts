import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { ApiService } from './api.service';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';
import { UserModel, CreateUserRequest, UpdateUserRequest, Role, Department } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  private supabase = inject(SupabaseService);

  getUsers(): Observable<UserModel[]> {
    return from(this.getUsersFromSupabase());
  }

  private async getUsersFromSupabase(): Promise<UserModel[]> {
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role_id,
        department_id,
        is_active,
        created_at,
        updated_at
      `);

    if (error) throw error;

    return (data || []).map((user: any) => ({
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      roleId: user.role_id,
      departmentId: user.department_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }

  getUserById(userId: number): Observable<UserModel> {
    return this.api.get<UserModel>(`${environment.api.endpoints.users}/${userId}`);
  }

  createUser(userData: CreateUserRequest): Observable<UserModel> {
    return from(this.createUserSimple(userData));
  }

  private async createUserSimple(userData: CreateUserRequest): Promise<UserModel> {
    console.log('Creating user:', userData);
    
    // Just insert into users table directly
    const { data, error } = await this.supabase.getClient()
      .from('users')
      .insert({
        full_name: userData.fullName,
        email: userData.email,
        role_id: userData.roleId || null,
        department_id: userData.departmentId || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      throw error;
    }

    console.log('User created successfully:', data);
    return {
      userId: data.id,
      fullName: data.full_name,
      email: data.email,
      roleId: data.role_id,
      departmentId: data.department_id,
      isActive: data.is_active
    };
  }

  updateUser(userId: number, userData: UpdateUserRequest): Observable<UserModel> {
    return this.api.put<UserModel>(`${environment.api.endpoints.users}/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<void> {
    return this.api.delete<void>(`${environment.api.endpoints.users}/${userId}`);
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<UserModel> {
    return this.api.put<UserModel>(`${environment.api.endpoints.users}/${userId}`, { isActive });
  }

  getRoles(): Observable<Role[]> {
    return from(this.getRolesFromSupabase());
  }

  private async getRolesFromSupabase(): Promise<Role[]> {
    const { data, error } = await this.supabase.getClient()
      .from('roles')
      .select('*');

    if (error) throw error;

    return (data || []).map(role => ({
      roleId: role.id,
      roleName: role.role_name,
      description: role.description
    }));
  }

  getDepartments(): Observable<Department[]> {
    return from(this.getDepartmentsFromSupabase());
  }

  private async getDepartmentsFromSupabase(): Promise<Department[]> {
    const { data, error } = await this.supabase.getClient()
      .from('departments')
      .select('*');

    if (error) throw error;

    return (data || []).map(dept => ({
      departmentId: dept.id,
      departmentName: dept.department_name,
      description: dept.description
    }));
  }

  createRole(roleName: string): Observable<Role> {
    return from(this.createRoleInSupabase(roleName));
  }

  private async createRoleInSupabase(roleName: string): Promise<Role> {
    const { data, error } = await this.supabase.getClient()
      .from('roles')
      .insert({ role_name: roleName })
      .select()
      .single();

    if (error) throw error;

    return {
      roleId: data.id,
      roleName: data.role_name,
      description: data.description
    };
  }

  createDepartment(departmentName: string): Observable<Department> {
    return from(this.createDepartmentInSupabase(departmentName));
  }

  private async createDepartmentInSupabase(departmentName: string): Promise<Department> {
    const { data, error } = await this.supabase.getClient()
      .from('departments')
      .insert({ department_name: departmentName })
      .select()
      .single();

    if (error) throw error;

    return {
      departmentId: data.id,
      departmentName: data.department_name,
      description: data.description
    };
  }
}


