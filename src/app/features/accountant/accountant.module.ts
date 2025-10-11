import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AccountantDashboardComponent } from './components/accountant-dashboard/accountant-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AccountantDashboardComponent,
    title: 'Accountant Dashboard'
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
    AccountantDashboardComponent
  ]
})
export class AccountantModule { }
