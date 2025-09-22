import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h2>Account Settings</h2>
      
      <form class="settings-form" (ngSubmit)="saveSettings()">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            [(ngModel)]="user.email"
            class="form-control"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="notifications">Email Notifications</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="notifications" 
              name="notifications" 
              [(ngModel)]="settings.notifications"
              class="toggle-input"
            >
            <span class="toggle-slider"></span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="theme">Theme</label>
          <select 
            id="theme" 
            name="theme" 
            [(ngModel)]="settings.theme"
            class="form-control"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    .settings-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    .toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    .toggle-input:checked + .toggle-slider {
      background-color: #3f51b5;
    }
    .toggle-input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #3f51b5;
      color: white;
    }
    .btn-primary:hover {
      background-color: #303f9f;
    }
    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
    }
    .btn-secondary:hover {
      background-color: #e0e0e0;
    }
  `]
})
export class SettingsComponent {
  user = {
    email: 'john.doe@example.com'
  };
  
  settings = {
    notifications: true,
    theme: 'light'
  };
  
  saveSettings() {
    console.log('Settings saved:', this.settings);
    // TODO: Implement save settings logic
  }
}
