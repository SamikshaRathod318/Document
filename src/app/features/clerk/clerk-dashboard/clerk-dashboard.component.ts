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
import { DocumentStoreService } from '../services/document-store.service';
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
  styleUrls: ['./clerk-dashboard.component.scss', './dashboard-attractive.css'],
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
  showDocuments = false;
  currentFilter = 'all';
  totalDocuments = 0;
  approvedDocuments = 0;
  pendingDocuments = 0;
  private userSubscription: Subscription | undefined;
  private routerEventsSubscription: Subscription;
  private documentsSubscription: Subscription | undefined;
  currentTheme = 'light';
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private documentStore = inject(DocumentStoreService);

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
    // Load saved theme
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = {
          id: user.id,
          name: user.name || 'User',
          email: user.email,
          role: this.mapRole(user.roles?.[0]) || 'clerk',
          department: user.department || 'Clerk Department'
        };
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.documentsSubscription = this.documentStore.documents$.subscribe(docs => {
      this.totalDocuments = docs.length;
      this.approvedDocuments = docs.filter(doc => doc.status === 'Approved').length;
      this.pendingDocuments = docs.filter(doc => doc.status === 'Pending').length;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
    if (this.documentsSubscription) {
      this.documentsSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showFilteredDocuments(filter: string): void {
    this.currentFilter = filter;
    this.showDocuments = true;
  }
  
  backToDashboard(): void {
    this.showDocuments = false;
  }
  
  getDocumentTitle(): string {
    switch(this.currentFilter) {
      case 'pending': return 'Pending Documents';
      case 'approved': return 'Approved Documents';
      case 'all': return 'All Documents';
      default: return 'Documents';
    }
  }

  navigateToDocuments(filter: string): void {
    this.router.navigate(['/clerk/documents'], { queryParams: { status: filter } });
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
