import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockUserService } from '../../../../core/services/mock-user.service';
import { SeedService } from '../../../../core/services/seed.service';
import { UserModel, CreateUserRequest, Role, Department } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(MockUserService);
  private seedService = inject(SeedService);
  
  users: UserModel[] = [];
  roles: Role[] = [];
  departments: Department[] = [];
  showCreateForm = false;
  showRoleForm = false;
  showDeptForm = false;
  loading = true;
  error = '';
  newRoleName = '';
  newDeptName = '';
  
  newUser: CreateUserRequest = {
    fullName: '',
    email: '',
    password: '',
    roleId: 0,
    departmentId: 0,
    isActive: true
  };

  ngOnInit(): void {
    console.log('AdminDashboardComponent: Component initialized');
    console.log('AdminDashboardComponent: Loading data...');
    this.loadUsers();
    this.loadRoles();
    this.loadDepartments();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.users = [];
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Load users error:', err);
      }
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles = data || [],
      error: (err) => {
        this.roles = [];
        console.error('Load roles error:', err);
      }
    });
  }

  loadDepartments(): void {
    this.userService.getDepartments().subscribe({
      next: (data) => this.departments = data || [],
      error: (err) => {
        this.departments = [];
        console.error('Load departments error:', err);
      }
    });
  }

  createUser(): void {
    if (!this.newUser.fullName || !this.newUser.email) {
      alert('Please fill name and email');
      return;
    }
    
    console.log('Form data:', this.newUser);
    
    const roleId = Number(this.newUser.roleId) || 1;
    const departmentId = this.newUser.departmentId ? Number(this.newUser.departmentId) : undefined;
    
    const userData = {
      fullName: this.newUser.fullName,
      email: this.newUser.email,
      password: this.newUser.password || 'temp123',
      roleId: roleId,
      departmentId: departmentId,
      isActive: true
    };
    
    console.log('Sending user data:', userData);
    
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        console.log('User created:', response);
        alert('User created successfully!');
        this.loadUsers();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Create user failed:', err);
        alert('Failed to create user: ' + JSON.stringify(err));
      }
    });
  }

  toggleStatus(user: UserModel): void {
    this.userService.toggleUserStatus(user.userId, !user.isActive).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Toggle status failed:', err)
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Delete this user?')) return;
    
    this.userService.deleteUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Delete user failed:', err)
    });
  }

  resetForm(): void {
    this.newUser = { fullName: '', email: '', password: '', roleId: 0, departmentId: 0, isActive: true };
    this.showCreateForm = false;
  }

  createRole(): void {
    if (!this.newRoleName.trim()) {
      alert('Please enter role name');
      return;
    }
    
    this.userService.createRole(this.newRoleName).subscribe({
      next: () => {
        alert('Role created successfully!');
        this.loadRoles();
        this.newRoleName = '';
        this.showRoleForm = false;
      },
      error: (err) => {
        console.error('Create role failed:', err);
        alert('Failed to create role');
      }
    });
  }

  createDepartment(): void {
    if (!this.newDeptName.trim()) {
      alert('Please enter department name');
      return;
    }
    
    this.userService.createDepartment(this.newDeptName).subscribe({
      next: () => {
        alert('Department created successfully!');
        this.loadDepartments();
        this.newDeptName = '';
        this.showDeptForm = false;
      },
      error: (err) => {
        console.error('Create department failed:', err);
        alert('Failed to create department');
      }
    });
  }
}
