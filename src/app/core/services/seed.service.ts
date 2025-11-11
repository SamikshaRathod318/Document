import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SeedService {
  private supabase = inject(SupabaseService);

  async seedDefaultData(): Promise<void> {
    try {
      await this.seedRoles();
      await this.seedDepartments();
      console.log('Default data seeded successfully');
    } catch (error) {
      console.error('Seeding failed:', error);
    }
  }

  private async seedRoles(): Promise<void> {
    const defaultRoles = [
      { role_name: 'Admin', description: 'System Administrator' },
      { role_name: 'Clerk', description: 'Administrative Clerk' },
      { role_name: 'Senior Clerk', description: 'Senior Administrative Clerk' },
      { role_name: 'Accountant', description: 'Accountant' },
      { role_name: 'HOD', description: 'Head of Department' }
    ];

    for (const role of defaultRoles) {
      const { error } = await this.supabase.getClient()
        .from('roles')
        .upsert(role, { onConflict: 'role_name' });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Role seeding error:', error);
      }
    }
  }

  private async seedDepartments(): Promise<void> {
    const defaultDepartments = [
      'Administration',
      'Water',
      'Account',
      'Property',
      'Asset',
      'Electric',
      'Civil',
      'Health',
      'Solid Waste'
    ];

    for (const deptName of defaultDepartments) {
      const { error } = await this.supabase.getClient()
        .from('departments')
        .upsert({ department_name: deptName }, { onConflict: 'department_name' });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Department seeding error:', error);
      }
    }
  }
}