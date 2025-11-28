import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../core/services/document.service';
import { Document } from '../../features/clerk/models/document.model';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-detail-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Document Details</h1>
      </div>
      
      <div *ngIf="loading" class="loading">Loading document...</div>
      
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="document && !loading" class="document-card">
        <div class="document-info">
          <h2>{{ document.title }}</h2>
          <div class="meta-info">
            <div class="meta-item">
              <label>Department:</label>
              <span>{{ document.department }}</span>
            </div>
            <div class="meta-item">
              <label>Upload Date:</label>
              <span>{{ (document.uploadedDate || document.created_at) | date:'short' }}</span>
            </div>
            <div class="meta-item">
              <label>Status:</label>
              <span class="status" [class]="(document.status || '').toLowerCase()">{{ document.status || 'pending' }}</span>
            </div>
            <div class="meta-item" *ngIf="document.description">
              <label>Description:</label>
              <span>{{ document.description }}</span>
            </div>
            <div class="meta-item" *ngIf="document.type">
              <label>File Type:</label>
              <span>{{ document.type }}</span>
            </div>
            <div class="meta-item" *ngIf="document.size">
              <label>File Size:</label>
              <span>{{ document.size | number }} bytes</span>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary" (click)="viewForm()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View
          </button>
          <button class="btn btn-secondary">Edit</button>
          <button class="btn btn-danger" (click)="deleteDocument()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-detail-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .back-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .document-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .document-info h2 {
      margin-top: 0;
      color: #333;
    }
    
    .meta-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .meta-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.875rem;
    }
    
    .meta-item span {
      color: #333;
    }
    
    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      width: fit-content;
    }
    
    .status.approved {
      background: #d4edda;
      color: #155724;
    }
    
    .status.pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status.draft {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status.rejected {
      background: #f8d7da;
      color: #721c24;
    }
    
    .loading, .error {
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
    }
    
    .error {
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }
    
    .loading {
      color: #6c757d;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentService = inject(DocumentService);
  
  document: Document | null = null;
  loading = true;
  error: string | null = null;
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(id);
    } else {
      this.error = 'Document ID not found';
      this.loading = false;
    }
  }

  private async loadDocument(id: string) {
    try {
      const document = await this.documentService.getDocument(id);
      this.document = document;
      this.loading = false;
    } catch (error) {
      this.error = 'Failed to load document';
      this.loading = false;
      console.error('Error loading document:', error);
    }
  }
  
  goBack() {
    this.router.navigate(['/clerk/dashboard']);
  }
  
  viewForm() {
    if (this.document) {
      this.router.navigate(['/documents/view', this.document.id]);
    }
  }

  async deleteDocument() {
    if (this.document && confirm('Are you sure you want to delete this document?')) {
      try {
        await this.documentService.deleteDocument(String(this.document.id));
        this.router.navigate(['/clerk/dashboard']);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      }
    }
  }
}