import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css', './clerk-menu.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isScrolled = false;
  isUserMenuOpen = false;
  isCategoriesOpen = false;

  private routeSubscription: Subscription | undefined;
  private authService = inject(AuthService);
  
  // User state
  isLoggedIn$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;
  isAuthenticated = false;
  isOnClerkRoute = false;
  currentRole: string | null = null;
  
  // Search functionality
  searchQuery = '';
  isSearchFocused = false;

  constructor(public router: Router) {
    // Subscribe to auth state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      console.log('Auth state changed:', isAuth);
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.authService.currentUser$.subscribe(user => {
          // Log the full user object for debugging
          console.log('Current user:', user);
          // Use the first role if available, or null if no roles
          this.currentRole = user?.roles?.[0] || null;
          console.log('Current role:', this.currentRole);
        });
      } else {
        this.currentRole = null;
        console.log('User logged out, role set to null');
      }
    });
  }

  ngOnInit() {
    // Close mobile menu when route changes
    this.routeSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMenuOpen = false;
      this.isOnClerkRoute = this.router.url.startsWith('/clerk');
    });
    
    // Initial check
    this.isOnClerkRoute = this.router.url.startsWith('/clerk');
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Toggle body scroll when mobile menu is open
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isCategoriesOpen = false;
    document.body.style.overflow = '';
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  // Check if user has any of the required roles
  hasRole(requiredRoles: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return requiredRoles.some(role => user.roles?.includes(role));
      })
    );
  }

  // Check if current route is a clerk route
  isClerkRoute(): boolean {
    return this.router.url.startsWith('/clerk') || this.currentRole === 'clerk' || this.currentRole === 'adm_clerk' || this.currentRole === 'adm_sr_clerk';
  }

  toggleCategories(event: Event, navigate: boolean = false) {
    event.preventDefault();
    event.stopPropagation();
    
    if (navigate) {
      // If we're navigating, close the menu and don't toggle the dropdown
      this.closeMenu();
      return;
    }
    
    // Toggle categories dropdown
    this.isCategoriesOpen = !this.isCategoriesOpen;
    
    // Close other menus when opening categories
    if (this.isCategoriesOpen) {
      this.isUserMenuOpen = false;
    } else {
      // If closing categories, navigate to the categories page
      this.router.navigate(['/categories']);
    }
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/login']);
  }



  // Search methods
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    // Add debounced search logic here if needed
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to search results or trigger search
      console.log('Searching for:', this.searchQuery);
      // Example: this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  clearSearch() {
    this.searchQuery = '';
  }

  onSearchFocus() {
    this.isSearchFocused = true;
  }

  onSearchBlur() {
    this.isSearchFocused = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }
}
