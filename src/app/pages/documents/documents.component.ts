import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentListComponent } from '../../features/clerk/components/document-list/document-list.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DocumentListComponent],
  template: `
    <div class="documents-page">
      <app-document-list></app-document-list>
    </div>
  `,
  styles: [`
    .documents-page {
      padding: 20px;
      min-height: calc(100vh - 200px);
    }
  `]
})
export class DocumentsComponent {
}