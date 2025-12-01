import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Document } from '../../models/document.model';
import { DocumentStoreService } from '../../services/document-store.service';
import { DocumentService } from '../../../../core/services/document.service';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./upload-attractive.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
    MatTableModule
  ]
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragging = false;
  isEditMode = false;
  editingDocumentId: string | number | null = null;

  // Document classes with colors
  documentClass = [
    { value: 'a', viewValue: 'A', color: '#4CAF50' },
    { value: 'b', viewValue: 'B', color: '#F44336' },
    { value: 'c', viewValue: 'C', color: '#2196F3' },
    { value: 'd', viewValue: 'D', color: '#9E9E9E' }
  ];

  // Document type options
  documentTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'word', label: 'Word Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'image', label: 'Image' },
    { value: 'others', label: 'Others' }
  ];

  // Departments from environment
  departments = [
    'Education',
    'Accountant',
    'Manager',
    'Finance'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private store: DocumentStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      documentType: ['', Validators.required],
      class: ['', Validators.required],
      type: [''],
      effectiveDate: [new Date(), Validators.required],
      isConfidential: [false],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.queryParams.subscribe(params => {
      const docId = params['id'];
      if (docId) {
        this.isEditMode = true;
        this.editingDocumentId = docId;
        this.loadDocumentForEdit(docId);
      }
    });
  }

  private loadDocumentForEdit(id: string | number): void {
    const document = this.store.documents.find(doc => doc.id === id);
    if (document) {
      this.uploadForm.patchValue({
        title: document.title,
        description: document.description || '',
        documentType: document.documentType,
        type: document.type || 'UNKNOWN',
        department: document.department,
        effectiveDate: document.uploadedDate,
        isConfidential: document.isConfidential || false
      });
      // Make file field not required for edit mode
      this.uploadForm.get('file')?.clearValidators();
      this.uploadForm.get('file')?.updateValueAndValidity();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
    this.isDragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  private handleFileSelection(file: File): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Invalid file type. Please upload a valid document.', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    // File size check (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.snackBar.open('File size exceeds 10MB limit.', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    this.selectedFile = file;
    this.uploadForm.patchValue({
      file: file.name,
      type: this.getReadableType(file)
    });
  }

  selectedClass: string = '';
  filteredDocuments = new MatTableDataSource<Document>();
  tableColumns: string[] = ['title', 'type', 'status', 'uploadedDate'];

  onClassChange(classValue: string): void {
    this.selectedClass = classValue;
    this.loadDocumentsByClass(classValue);
  }

  loadDocumentsByClass(classValue: string): void {
    const documents = this.store.documents.filter(doc => doc.class?.toLowerCase() === classValue.toLowerCase());
    this.filteredDocuments.data = documents;
  }

  async onSubmit(): Promise<void> {
    console.log('Upload submit triggered', {
      status: this.uploadForm.status,
      value: this.uploadForm.value,
      hasSelectedFile: !!this.selectedFile,
      isEditMode: this.isEditMode
    });
    
    // For edit mode, file is optional; for create mode, file is required
    if (this.uploadForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      this.uploadForm.markAllAsTouched();
      const message = this.isEditMode ? 
        'Please fill in all required fields.' : 
        'Please fill in all required fields and select a file.';
      this.snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 10;

    try {
      const formValue = this.uploadForm.value;
      const dataUrl = this.selectedFile ? await this.convertFileToBase64(this.selectedFile) : null;
      this.uploadProgress = 60;

      const normalizedClass = this.normalizeClass(formValue.class);
      const basePayload: Partial<Document> = {
        title: formValue.title?.trim(),
        description: formValue.description || '',
        documentType: formValue.documentType,
        class: normalizedClass,
        isConfidential: !!formValue.isConfidential,
        effectiveDate: formValue.effectiveDate,
        department: formValue.department
      };

      if (dataUrl) {
        basePayload.file_url = dataUrl;
        basePayload.fileUrl = dataUrl;
        basePayload.type = this.getReadableType(this.selectedFile);
        basePayload.size = this.selectedFile?.size;
      }

      let savedDoc: Document | null = null;
      if (this.isEditMode && this.editingDocumentId) {
        savedDoc = await this.documentService.updateDocument(String(this.editingDocumentId), basePayload);
        this.store.update(savedDoc);
      } else {
        const createPayload: Partial<Document> = {
          ...basePayload,
          status: 'pending',
          current_stage: 'clerk'
        };
        savedDoc = await this.documentService.createDocument(createPayload);
        this.store.add(savedDoc);
      }

      this.uploadProgress = 100;
      const successMessage = this.isEditMode
        ? 'Document updated successfully!'
        : 'Document uploaded successfully!';
      this.onSaveSuccess(successMessage);
    } catch (error) {
      console.error('Error saving document:', error);
      this.snackBar.open('Failed to save the document. Please try again.', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    } finally {
      this.isUploading = false;
    }
  }

  // Helper method to get file icon based on file type
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'txt':
        return 'text_snippet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  }

  private getReadableType(file?: File | null): string {
    if (!file) return 'UNKNOWN';

    const mime = file.type?.toLowerCase();
    if (mime) {
      if (mime === 'application/pdf') return 'PDF';
      if (mime.includes('msword') || mime.includes('officedocument.wordprocessingml')) return 'DOCX';
      if (mime.includes('spreadsheetml') || mime.includes('ms-excel')) return 'XLSX';
      if (mime === 'text/plain') return 'TXT';
      if (mime.startsWith('image/')) return mime.split('/')[1].toUpperCase();
    }

    const ext = file.name.split('.').pop()?.toUpperCase();
    return ext || 'UNKNOWN';
  }

  private onSaveSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: 'success-snackbar'
    });

    this.uploadForm.reset({
      effectiveDate: new Date(),
      isConfidential: false
    });
    this.selectedFile = null;

    this.router.navigate(['/documents'], { queryParams: { status: 'all' } });
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private normalizeClass(value: string): string | undefined {
    if (!value) return undefined;
    return value.trim().toUpperCase();
  }
}