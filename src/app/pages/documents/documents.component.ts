import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="documents-container">
      <!-- Overview Section -->
      <div class="overview-section">
        <h1>Document Management</h1>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ totalDocuments }}</div>
            <div class="stat-label">Total Documents</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ recentUploads }}</div>
            <div class="stat-label">Recent Uploads</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ pendingReview }}</div>
            <div class="stat-label">Pending Review</div>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div class="documents-section">
        <div class="section-header">
          <h2>Recent Documents</h2>
          <button class="btn-upload" (click)="onUploadNew()">+ Upload New</button>
        </div>
        
        <div class="documents-grid">
          <div class="document-card" *ngFor="let doc of documents">
            <div class="doc-icon">📄</div>
            <div class="doc-info">
              <h3>{{ doc.title }}</h3>
              <p class="doc-meta">{{ doc.department }} • {{ doc.date }}</p>
              <span class="doc-status" [class]="doc.status">{{ doc.status }}</span>
            </div>
            <div class="doc-actions">
              <button class="btn-action" (click)="onViewDocument(doc)">View</button>
              <button class="btn-action" (click)="onDownloadDocument(doc)">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Form View -->
    <div class="form-overlay" *ngIf="showForm" (click)="onCloseForm()">
      <div class="form-modal" (click)="$event.stopPropagation()">
        <div class="form-header">
          <h3>Document Details</h3>
          <button class="close-btn" (click)="onCloseForm()">&times;</button>
        </div>
        <div class="form-content">
          <div class="form-field">
            <label>Title:</label>
            <input type="text" [value]="selectedDocument?.title" readonly>
          </div>
          <div class="form-field">
            <label>Department:</label>
            <input type="text" [value]="selectedDocument?.department" readonly>
          </div>
          <div class="form-field">
            <label>Upload Date:</label>
            <input type="text" [value]="selectedDocument?.date" readonly>
          </div>
          <div class="form-field">
            <label>Status:</label>
            <span class="status-badge" [class]="selectedDocument?.status">{{ selectedDocument?.status }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .documents-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .overview-section {
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 2.5rem;
      color: #2d3748;
      margin-bottom: 2rem;
      font-weight: 600;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    
    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #5b73e8;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      color: #718096;
      font-weight: 500;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    h2 {
      font-size: 1.8rem;
      color: #2d3748;
      margin: 0;
    }
    
    .btn-upload {
      background: #5b73e8;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .documents-grid {
      display: grid;
      gap: 1.5rem;
    }
    
    .document-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .doc-icon {
      font-size: 2rem;
    }
    
    .doc-info {
      flex: 1;
    }
    
    .doc-info h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
      font-size: 1.1rem;
    }
    
    .doc-meta {
      color: #718096;
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }
    
    .doc-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .doc-status.approved {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .doc-status.pending {
      background: #fef5e7;
      color: #c05621;
    }
    
    .doc-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-action {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .btn-action:hover {
      background: #f7fafc;
    }
    
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .form-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .form-header h3 {
      margin: 0;
      color: #2d3748;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #718096;
    }
    
    .form-content {
      padding: 1.5rem;
    }
    
    .form-field {
      margin-bottom: 1rem;
    }
    
    .form-field label {
      display: block;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }
    
    .form-field input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f7fafc;
    }
    
    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
    }
  `]
})
export class DocumentsComponent {
  totalDocuments = 24;
  recentUploads = 8;
  pendingReview = 3;
  showForm = false;
  selectedDocument: any = null;
  
  documents = [
    {
      title: 'Budget Report 2024',
      department: 'Finance',
      date: 'Jan 15, 2024',
      status: 'approved'
    },
    {
      title: 'Employee Handbook',
      department: 'HR',
      date: 'Jan 12, 2024',
      status: 'approved'
    },
    {
      title: 'Project Proposal',
      department: 'Operations',
      date: 'Jan 10, 2024',
      status: 'pending'
    },
    {
      title: 'Safety Guidelines',
      department: 'Safety',
      date: 'Jan 8, 2024',
      status: 'approved'
    }
  ];

  onUploadNew() {
    alert('Upload New Document clicked!');
  }

  onViewDocument(doc: any) {
    console.log('View clicked', doc);
    this.selectedDocument = doc;
    this.showForm = true;
    console.log('showForm is now:', this.showForm);
  }

  onCloseForm() {
    this.showForm = false;
    this.selectedDocument = null;
  }

  onDownloadDocument(doc: any) {
    alert(`Downloading: ${doc.title}`);
  }
}
