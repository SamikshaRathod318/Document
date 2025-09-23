import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>About DocManager</h1>
      <p>DocManager is a powerful document management system that helps you organize and manage your documents efficiently.</p>
      <p>Version: 1.0.0</p>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }
    
    p {
      margin-bottom: 1rem;
      line-height: 1.6;
    }
  `]
})
export class AboutComponent {}
