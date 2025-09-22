import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HodDashboardComponent } from './components/hod-dashboard/hod-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: HodDashboardComponent,
    title: 'HOD Dashboard'
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
