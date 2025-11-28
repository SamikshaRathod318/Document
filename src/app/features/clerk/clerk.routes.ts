import { Routes } from '@angular/router';
import { ClerkDashboardComponent } from './clerk-dashboard/clerk-dashboard.component';
import { clerkGuard } from './guards/clerk.guard';
import { SeniorClerkDashboardComponent } from './senior-clerk-dashboard/senior-clerk-dashboard.component';

export const CLERK_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: ClerkDashboardComponent,
    data: { title: 'Dashboard' }
  },
  {
    path: 'senior-dashboard',
    component: SeniorClerkDashboardComponent,
    data: { title: 'Senior Clerk Dashboard' }
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
    path: 'document/:id',
    loadComponent: () => import('./components/document-view/document-view.component')
      .then(m => m.DocumentViewComponent),
    data: { title: 'View Document' }
  },
  {
    path: 'document/:id/edit',
    loadComponent: () => import('./components/document-edit/document-edit.component')
      .then(m => m.DocumentEditComponent),
    data: { title: 'Edit Document' }
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];