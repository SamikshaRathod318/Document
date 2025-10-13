import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentListComponent } from '../../features/clerk/components/document-list/document-list.component';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, DocumentListComponent],
  template: `<app-document-list></app-document-list>`
})
export class DocumentsPageComponent {
}