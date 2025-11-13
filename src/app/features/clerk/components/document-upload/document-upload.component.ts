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
  editingDocumentId: number | null = null;

  // Document classes with colors
  documentClass = [
    { value: 'a', viewValue: 'A', color: '#4CAF50' },
    { value: 'b', viewValue: 'B', color: '#F44336' },
    { value: 'c', viewValue: 'C', color: '#2196F3' },
    { value: 'd', viewValue: 'D', color: '#9E9E9E' }
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
    private route: ActivatedRoute
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      documentType: ['', Validators.required],
      class: ['', Validators.required],

      effectiveDate: [new Date(), Validators.required],
      isConfidential: [false],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.editingDocumentId = +params['id'];
        this.loadDocumentForEdit(this.editingDocumentId);
      }
    });
  }

  private loadDocumentForEdit(id: number): void {
    const document = this.store.documents.find(doc => doc.id === id);
    if (document) {
      this.uploadForm.patchValue({
        title: document.title,
        description: document.description || '',
        documentType: document.documentType,
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
    const file = event.target.files[0];
    this.handleFileSelection(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
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
    if (!file) return;
    
    // Basic file type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/jpg',
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
      file: file.name
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

  onSubmit(): void {
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
    this.uploadProgress = 0;

    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += Math.floor(Math.random() * 10) + 5;
      if (this.uploadProgress >= 95) {
        clearInterval(progressInterval);
      }
    }, 300);

    // In a real app, you would make an HTTP request to upload the file
    // and handle the response accordingly
    setTimeout(() => {
      clearInterval(progressInterval);
      this.uploadProgress = 100;
      this.isUploading = false;
      
      const successMessage = this.isEditMode ? 
        'Document updated successfully!' : 
        'Document uploaded successfully!';
      
      this.snackBar.open(successMessage, 'Close', {
        duration: 5000,
        panelClass: 'success-snackbar'
      });
      
      const formValue = this.uploadForm.value;
      
      if (this.isEditMode && this.editingDocumentId) {
        // Update existing document
        const existingDoc = this.store.documents.find(doc => doc.id === this.editingDocumentId);
        if (existingDoc) {
          const effectiveDate = formValue.effectiveDate ? new Date(formValue.effectiveDate) : existingDoc.uploadedDate;
          const updatedDoc: Document = {
            ...existingDoc,
            title: formValue.title,
            description: formValue.description || '',
            department: formValue.department,
            documentType: formValue.documentType,
            class: formValue.class,
            isConfidential: !!formValue.isConfidential,
            uploadedDate: effectiveDate,
            // Only update file info if new file was selected
            ...(this.selectedFile && {
              type: this.getDocTypeFromFile(this.selectedFile.name),
              size: this.selectedFile.size
            })
          };
          this.store.update(updatedDoc);
        }
      } else {
        // Create new document with file URL
        this.convertFileToBase64(this.selectedFile!).then(fileUrl => {
          const effectiveDate = formValue.effectiveDate ? new Date(formValue.effectiveDate) : new Date();
          const newDoc: Document = {
            id: 0, // will be assigned by store
            title: formValue.title,
            description: formValue.description || '',
            type: this.getDocTypeFromFile(this.selectedFile?.name || ''),
            size: this.selectedFile?.size,
            uploadedDate: effectiveDate,
            status: 'Pending',
            uploadedBy: 'Current User',
            department: 'General',
            documentType: formValue.documentType,
            class: formValue.class,
            isConfidential: !!formValue.isConfidential,
            fileUrl: fileUrl
          };
          this.store.add(newDoc);
        });
      }

      // Reset the form after successful upload
      this.uploadForm.reset({
        effectiveDate: new Date(),
        isConfidential: false
      });
      this.selectedFile = null;

      // Navigate back to documents list
      this.router.navigate(['/documents']);
    }, 3000);
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

  private getDocTypeFromFile(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOCX';
      case 'xls':
      case 'xlsx':
        return 'XLSX';
      case 'txt':
        return 'TXT';
      case 'jpg':
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'gif':
        return 'GIF';
      default:
        return 'OTHER';
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
