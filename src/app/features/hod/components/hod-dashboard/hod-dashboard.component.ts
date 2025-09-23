import { Component } from '@angular/core';

@Component({
  selector: 'app-hod-dashboard',
  template: `
    <div class="dashboard-container">
      <h2>HOD Dashboard</h2>
      <p>Welcome to the Head of Department Dashboard</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
  `]
})
export class HodDashboardComponent { }
