import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
  `]
})
export class AdminDashboardComponent { }
