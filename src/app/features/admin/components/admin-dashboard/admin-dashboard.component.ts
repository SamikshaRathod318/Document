import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { UserModel } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard</p>

      <div class="users" *ngIf="users?.length; else noUsers">
        <h3>Users</h3>
        <ul>
          <li *ngFor="let u of users">
            <strong>{{ u.fullName }}</strong> — {{ u.email }}
          </li>
        </ul>
      </div>
      <ng-template #noUsers>
        <p>No users loaded.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  users: UserModel[] = [];

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.users = []
    });
  }
}
