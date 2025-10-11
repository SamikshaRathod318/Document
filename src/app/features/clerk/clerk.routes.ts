import { Routes } from '@angular/router';
import { ClerkDashboardComponent } from './clerk-dashboard/clerk-dashboard.component';
import { clerkGuard } from './guards/clerk.guard';

export const CLERK_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: ClerkDashboardComponent,
    data: { title: 'Dashboard' }
  },
  {
    path: 'documents', 
    loadComponent: () => import('./components/document-list/document-list.component')
      .then(m => m.DocumentListComponent),
    data: { title: 'Documents' }
  },
  {
    path: 'upload', 
    loadComponent: () => import('./components/document-upload/document-upload.component')
      .then(m => m.DocumentUploadComponent),
    data: { title: 'Upload Document' }
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];