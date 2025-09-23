import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { filter, Subscription } from 'rxjs';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

@Component({
  selector: 'app-clerk-dashboard',
  templateUrl: './clerk-dashboard.component.html',
  styleUrls: ['./clerk-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule
  ]
})
export class ClerkDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSubscription: Subscription | undefined;
  private routerEventsSubscription: Subscription;
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  constructor() {
    // Handle router events to ensure proper navigation
    this.routerEventsSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Force a reload if the URL is just /clerk
      if (this.router.url === '/clerk' || this.router.url === '/clerk/') {
        this.router.navigate(['documents'], { relativeTo: this.route });
      }
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          role: this.mapRole(user.roles?.[0]) || 'clerk',
          department: user.department || 'Clerk Department'
        };
        
        // If this is the initial load, navigate to the documents route
        if (this.router.url === '/clerk' || this.router.url === '/clerk/') {
          this.router.navigate(['documents'], { relativeTo: this.route, replaceUrl: true });
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Normalize internal role keys to a friendly display label for the UI
  private mapRole(role?: string): string {
    if (!role) return 'clerk';
    const r = role.toLowerCase();
    // Any clerk-like internal roles are shown simply as 'clerk'
    if (r.includes('clerk')) return 'clerk';
    // Fallback: return the raw role (consumer templates apply titlecase)
    return role;
  }
}
