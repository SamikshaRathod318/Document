import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HodDashboardComponent } from './components/hod-dashboard/hod-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: HodDashboardComponent,
    title: 'HOD Dashboard'
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HodDashboardComponent
  ]
})
export class HodModule { }
