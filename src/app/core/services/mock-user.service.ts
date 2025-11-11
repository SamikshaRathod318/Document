import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { UserModel, CreateUserRequest, Role, Department } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockUserService {
  private users: UserModel[] = [];
  private roles: Role[] = [
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'Clerk' },
    { roleId: 3, roleName: 'Senior Clerk' },
    { roleId: 4, roleName: 'HR' },
    { roleId: 5, roleName: 'Accountant' },
    { roleId: 6, roleName: 'HOD' },
    { roleId: 7, roleName: 'Manager' }

  ];
  private departments: Department[] = [
    { departmentId: 1, departmentName: 'Administration' },
    { departmentId: 2, departmentName: 'Water' },
    { departmentId: 3, departmentName: 'Account' }
  ];
  private nextUserId = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const savedUsers = localStorage.getItem('mock_users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
      this.nextUserId = Math.max(...this.users.map(u => u.userId), 0) + 1;
    } else {
      this.users = [{
        userId: 1,
        fullName: 'Samiksha Rathod',
        email: 'samiksharathod618@gmail.com',
        roleId: 1,
        roleName: 'Admin',
        departmentId: 1,
        departmentName: 'Administration',
        isActive: true
      }];
      this.nextUserId = 2;
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('mock_users', JSON.stringify(this.users));
  }

  // Method for authentication
  authenticateUser(email: string, password: string): Promise<any> {
    const user = this.users.find(u => u.email === email);
    if (user) {
      const role = this.roles.find(r => r.roleId === user.roleId);
      return Promise.resolve({
        id: user.userId,
        email: user.email,
        full_name: user.fullName,
        role_id: user.roleId,
        role_name: role?.roleName
      });
    }
    return Promise.resolve(null);
  }

  // Method to get role by ID
  getRoleById(roleId: number): Promise<any> {
    const role = this.roles.find(r => r.roleId === roleId);
    return Promise.resolve(role ? { role_name: role.roleName } : null);
  }

  getUsers(): Observable<UserModel[]> {
    return of(this.users).pipe(delay(100));
  }

  createUser(userData: CreateUserRequest): Observable<UserModel> {
    const role = this.roles.find(r => r.roleId === userData.roleId);
    const department = this.departments.find(d => d.departmentId === userData.departmentId);
    
    const newUser: UserModel = {
      userId: this.nextUserId++,
      fullName: userData.fullName,
      email: userData.email,
      roleId: userData.roleId,
      roleName: role?.roleName,
      departmentId: userData.departmentId,
      departmentName: department?.departmentName,
      isActive: userData.isActive ?? true
    };
    
    this.users.push(newUser);
    this.saveToStorage();
    return of(newUser).pipe(delay(100));
  }

  getRoles(): Observable<Role[]> {
    return of(this.roles).pipe(delay(100));
  }

  getDepartments(): Observable<Department[]> {
    return of(this.departments).pipe(delay(100));
  }

  createRole(roleName: string): Observable<Role> {
    const newRole: Role = {
      roleId: this.roles.length + 1,
      roleName: roleName
    };
    this.roles.push(newRole);
    return of(newRole).pipe(delay(100));
  }

  createDepartment(departmentName: string): Observable<Department> {
    const newDept: Department = {
      departmentId: this.departments.length + 1,
      departmentName: departmentName
    };
    this.departments.push(newDept);
    return of(newDept).pipe(delay(100));
  }

  toggleUserStatus(userId: number, isActive: boolean): Observable<UserModel> {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      user.isActive = isActive;
      this.saveToStorage();
    }
    return of(user!).pipe(delay(100));
  }

  deleteUser(userId: number): Observable<void> {
    this.users = this.users.filter(u => u.userId !== userId);
    this.saveToStorage();
     return of(void 0).pipe(delay(100));
  }
}