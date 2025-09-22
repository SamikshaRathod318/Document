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
import { RouterModule } from '@angular/router';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
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
    FileSizePipe
  ]
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragging = false;

  // Document types for the dropdown
  documentClass = [
    { value: 'a', viewValue: 'A' },
    { value: 'b', viewValue: 'B' },
    { value: 'c', viewValue: 'C' },
    { value: 'd', viewValue: 'D' },
    { value: 'other', viewValue: 'Other' }
  ];

  // Departments from environment
  departments = [
    'Clerk',
    'Senior Clerk',
    'Accountant',
    'HOD'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      documentType: ['', Validators.required],
      department: ['', Validators.required],
      effectiveDate: [new Date(), Validators.required],
      isConfidential: [false],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

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
      'text/plain'
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

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.snackBar.open('Please fill in all required fields and select a file.', 'Close', {
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
      
      this.snackBar.open('Document uploaded successfully!', 'Close', {
        duration: 5000,
        panelClass: 'success-snackbar'
      });
      
      // Reset the form after successful upload
      this.uploadForm.reset({
        effectiveDate: new Date(),
        isConfidential: false
      });
      this.selectedFile = null;
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
      default:
        return 'insert_drive_file';
    }
  }
}
