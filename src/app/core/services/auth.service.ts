import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { DatabaseService } from './database.service';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  department?: string;
  activeRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private dbService = inject(DatabaseService);
  private readonly TOKEN_KEY = environment.auth?.tokenKey || 'auth_token';
  private readonly REFRESH_TOKEN_KEY = environment.auth?.refreshTokenKey || 'refresh_token';
  private readonly USER_KEY = 'current_user';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    if (!email || !password) {
      return of(false);
    }

    return new Observable<boolean>(observer => {
      const authenticateUser = async () => {
        try {
          console.log('Authenticating with backend users table...');
          const user = await this.dbService.authenticateUser(email, password);
          
          if (user) {
            console.log('Backend authentication successful:', user);
            const userData: User = {
              id: user.user_id.toString(),
              email: user.email,
              name: user.full_name,
              roles: ['clerk'],
              department: 'Administration'
            };
            
            localStorage.setItem(this.TOKEN_KEY, 'backend-auth-token');
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(userData);
            this.router.navigate(['/clerk']);
            observer.next(true);
            observer.complete();
          } else {
            console.log('Backend authentication failed - no user found');
            observer.error({ message: 'Invalid email or password', code: 'invalid_credentials' });
          }
        } catch (error) {
          console.error('Backend authentication error:', error);
          observer.error({ message: 'Authentication failed', code: 'auth_error' });
        }
      };
      
      authenticateUser();
    });
  }

  logout(): void {
    this.supabase.signOut();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
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

  requestPasswordReset(email: string, redirectTo?: string): Observable<boolean> {
    if (!email) {
      return of(false);
    }
    return new Observable<boolean>(observer => {
      this.supabase.resetPassword(email, redirectTo).then(({ error }) => {
        if (error) {
          observer.error(error);
          return;
        }
        observer.next(true);
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }
}