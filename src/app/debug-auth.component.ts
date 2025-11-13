import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debug-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial;">
      <h2>Authentication Debug Info</h2>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3>Current Authentication Status</h3>
        <p><strong>Is Authenticated:</strong> {{isAuthenticated}}</p>
        <p><strong>Current User:</strong></p>
        <pre>{{currentUser | json}}</pre>
      </div>

      <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3>Local Storage Data</h3>
        <p><strong>Auth Token:</strong> {{authToken}}</p>
        <p><strong>User Data:</strong></p>
        <pre>{{userData | json}}</pre>
      </div>

      <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3>Quick Actions</h3>
        <button (click)="loginAsAdmin()" style="margin: 5px; padding: 10px; background: #007bff; color: white; border: none; border-radius: 3px;">
          Login as Admin
        </button>
        <button (click)="navigateToAdmin()" style="margin: 5px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 3px;">
          Go to Admin Dashboard
        </button>
        <button (click)="logout()" style="margin: 5px; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 3px;">
          Logout
        </button>
        <button (click)="createAdminUser()" style="margin: 5px; padding: 10px; background: #6f42c1; color: white; border: none; border-radius: 3px;">
          Create Admin User
        </button>
        <button (click)="fixAdminRole()" style="margin: 5px; padding: 10px; background: #fd7e14; color: white; border: none; border-radius: 3px;">
          Fix Admin Role
        </button>
        <button (click)="forceAdminAccess()" style="margin: 5px; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 3px;">
          Force Admin Access
        </button>
        <button (click)="testLogin()" style="margin: 5px; padding: 10px; background: #17a2b8; color: white; border: none; border-radius: 3px;">
          Test Login
        </button>
      </div>
    </div>
  `
})
export class DebugAuthComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = false;
  currentUser: any = null;
  authToken: string | null = null;
  userData: any = null;

  ngOnInit() {
    this.loadDebugInfo();
    
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDebugInfo() {
    this.authToken = localStorage.getItem('auth_token');
    const userDataStr = localStorage.getItem('current_user');
    this.userData = userDataStr ? JSON.parse(userDataStr) : null;
  }

  loginAsAdmin() {
    console.log('Attempting admin login...');
    this.authService.login('samiksharathod618@gmail.com', 'admin123').subscribe({
      next: (success) => {
        if (success) {
          console.log('Admin login successful');
          this.loadDebugInfo();
          // Try to navigate to admin dashboard after successful login
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1000);
        } else {
          console.log('Login failed - success is false');
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Login failed: ' + (err.message || 'Unknown error'));
      }
    });
  }

  navigateToAdmin() {
    this.router.navigate(['/admin/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.loadDebugInfo();
  }

  createAdminUser() {
    // Manually create admin user in localStorage
    const adminUser = {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      roles: ['admin'],
      department: 'Administration',
      activeRole: 'Admin',
      roleId: 1
    };
    
    localStorage.setItem('auth_token', 'admin-token');
    localStorage.setItem('current_user', JSON.stringify(adminUser));
    
    // Update auth service state
    this.authService['isAuthenticatedSubject'].next(true);
    this.authService['currentUserSubject'].next(adminUser);
    
    this.loadDebugInfo();
    alert('Admin user created and logged in!');
  }

  fixAdminRole() {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    
    // Fix the admin user role
    const fixedUser = {
      ...currentUser,
      roles: ['admin'],
      activeRole: 'Admin',
      roleId: 1
    };
    
    localStorage.setItem('current_user', JSON.stringify(fixedUser));
    
    // Update auth service
    this.authService['currentUserSubject'].next(fixedUser);
    
    this.loadDebugInfo();
    console.log('Fixed user:', fixedUser);
    alert('Admin role fixed! Now try accessing dashboard.');
  }

  forceAdminAccess() {
    // Create perfect admin user
    const adminUser = {
      id: '1',
      email: 'admin@test.com', 
      name: 'Admin User',
      roles: ['admin'],
      department: 'Administration',
      activeRole: 'Admin',
      roleId: 1
    };
    
    // Set everything
    localStorage.setItem('auth_token', 'admin-token');
    localStorage.setItem('current_user', JSON.stringify(adminUser));
    
    // Force update auth service
    this.authService['isAuthenticatedSubject'].next(true);
    this.authService['currentUserSubject'].next(adminUser);
    
    // Direct navigate
    window.location.href = '/admin/dashboard';
  }

  testLogin() {
    console.log('Testing login with samiksharathod618@gmail.com');
    this.authService.login('samiksharathod618@gmail.com', 'test123').subscribe({
      next: (success) => {
        console.log('Test login result:', success);
        this.loadDebugInfo();
        if (success) {
          alert('Login successful! Redirecting to dashboard...');
          setTimeout(() => this.router.navigate(['/admin/dashboard']), 1000);
        }
      },
      error: (err) => {
        console.error('Test login error:', err);
        alert('Login failed: ' + (err.message || 'Unknown error'));
      }
    });
  }
}