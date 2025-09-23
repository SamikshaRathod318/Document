import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <div class="dashboard-grid">
        <div class="dashboard-card" routerLink="/clerk/documents">
          <h3>Documents</h3>
          <p>View and manage your documents</p>
        </div>
        <div class="dashboard-card" routerLink="/clerk/upload">
          <h3>Upload</h3>
          <p>Upload new documents</p>
        </div>
        <div class="dashboard-card" routerLink="/clerk/categories">
          <h3>Categories</h3>
          <p>Manage document categories</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .dashboard-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .dashboard-card h3 {
      margin-top: 0;
      color: #333;
    }
    .dashboard-card p {
      color: #666;
      margin-bottom: 0;
    }
  `]
})
export class DashboardComponent { }
