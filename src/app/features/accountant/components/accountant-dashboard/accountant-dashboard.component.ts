import { Component } from '@angular/core';

@Component({
  selector: 'app-accountant-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-container">
      <h2>Accountant Dashboard</h2>
      <p>Welcome to the Accountant Dashboard</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
  `]
})
export class AccountantDashboardComponent { }
