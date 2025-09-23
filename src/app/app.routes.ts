import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ClerkModule } from './features/clerk/clerk.module';
import { AdminModule } from './features/admin/admin.module';
import { AccountantModule } from './features/accountant/accountant.module';
import { HodModule } from './features/hod/hod.module';
import { DepartmentComponent } from './pages/department/department.component';
import { ProfileComponent } from './features/clerk/components/profile/profile.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Document Management System'
  },
  {
    path: '',
    component: LandingComponent,
    title: 'Home - Document Management System',
    canActivate: [authGuard]
  },
  // Department route
  {
    path: 'department',
    component: DepartmentComponent,
    title: 'Departments - Document Management System',
    canActivate: [authGuard]
  },
  // Clerk routes
  {
    path: 'clerk',
    loadChildren: () => import('./features/clerk/clerk.module').then(m => m.ClerkModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['adm_clerk', 'adm_sr_clerk', 'clerk', 'senior_clerk'] }
  },
  // Profile route (protected)
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'My Profile - Document Management System',
    canActivate: [authGuard]
  },
  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  // Accountant routes
  {
    path: 'accountant',
    loadChildren: () => import('./features/accountant/accountant.module').then(m => m.AccountantModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['accountant'] }
  },
  // HOD routes
  {
    path: 'hod',
    loadChildren: () => import('./features/hod/hod.module').then(m => m.HodModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['adm_hod'] }
  },
  // Contact route
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact Us - Document Management System',
    canActivate: [authGuard]
  },
  // About route
  {
    path: 'about',
    component: AboutComponent,
    title: 'About - Document Management System',
    canActivate: [authGuard]
  },
  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];
