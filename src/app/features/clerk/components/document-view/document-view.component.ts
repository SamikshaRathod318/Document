import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Document } from '../../models/document.model';
import { DocumentService } from '../../../../core/services/document.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DatePipe
  ]
})
export class DocumentViewComponent implements OnInit {
  selectedDocument: Document | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private documentService: DocumentService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.selectedDocument = await this.documentService.getDocument(id);
      } catch (error) {
        console.error('Error loading document:', error);
        this.selectedDocument = null;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/clerk/documents']);
  }

  getClassLetter(classValue?: string): string {
    if (!classValue) return '?';
    const classUpper = classValue.toUpperCase();
    if (classUpper.includes('A')) return 'A';
    if (classUpper.includes('B')) return 'B';
    if (classUpper.includes('C')) return 'C';
    if (classUpper.includes('D')) return 'D';
    return classUpper.charAt(0);
  }

  getStatusDisplay(doc: Document): string {
    const status = (doc.status || '').toLowerCase();
    if (status === 'pending') {
      const pendingWith = this.getPendingWith(doc);
      if (pendingWith !== '-') {
        return pendingWith.toUpperCase();
      }
    }
    return (doc.status || '').toUpperCase();
  }

  getPendingWith(doc: Document): string {
    const status = (doc.status || '').toLowerCase();
    if (status === 'pending') {
      const stage = doc.current_stage;
      switch (stage) {
        case 'clerk':
          return 'Clerk';
        case 'senior_clerk':
          return 'Senior Clerk';
        case 'accountant':
          return 'Accountant';
        case 'admin':
          return 'Admin';
        case 'hod':
          return 'HOD';
        default:
          return '-';
      }
    }
    return '-';
  }

  getSafeUrl(url?: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isImageFile(type?: string): boolean {
    if (!type) return false;
    const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'];
    return imageTypes.includes(type.toUpperCase());
  }

  isTextFile(type?: string): boolean {
    if (!type) return false;
    const textTypes = ['TXT', 'DOC', 'DOCX', 'RTF'];
    return textTypes.includes(type.toUpperCase());
  }

  getFileSize(size?: number): string {
    if (!size) return 'Unknown size';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }

  getTypeIcon(doc: Document): string {
    const type = doc.type?.toUpperCase() || '';
    switch (type) {
      case 'PDF':
        return 'picture_as_pdf';
      case 'DOCX':
      case 'DOC':
        return 'description';
      case 'XLSX':
      case 'XLS':
        return 'table_chart';
      case 'PPTX':
      case 'PPT':
        return 'slideshow';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'GIF':
        return 'image';
      case 'TXT':
        return 'text_snippet';
      default:
        return 'insert_drive_file';
    }
  }

  downloadDocument(doc: Document): void {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  }
}

