import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  department?: string;
  activeRole?: string; // the role selected/used during login
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already authenticated
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // In a real app, you would make an HTTP request to your backend
    // This is a mock implementation
    if (email && password) {
      // Simulate API call
      return of(true).pipe(
        map(() => {
          // Mock user data - in a real app, this would come from the server
          const mockUser: User = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            roles: ['clerk', 'senior_clerk', 'accountant', 'hod'], // User's previous plain role names
            department: 'IT',
            activeRole: 'clerk' // simulate logging in with 'clerk'
          };
          
          // Store token and user in local storage
          localStorage.setItem(this.TOKEN_KEY, 'dummy-jwt-token');
          localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
          
          // Update observables
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(mockUser);
          
          return true;
        }),
        tap(() => {
          this.router.navigate(['/clerk']);
        }),
        catchError(error => {
          console.error('Login failed', error);
          return of(false);
        })
      );
    }
    return of(false);
  }

  logout(): void {
    // Remove token and user data from local storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Update observables
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(role) : false;
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
