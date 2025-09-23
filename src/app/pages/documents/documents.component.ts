import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Documents</h1>
      <p>This is the documents page. It will display a list of all your documents.</p>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
  `]
})
export class DocumentsComponent {}
