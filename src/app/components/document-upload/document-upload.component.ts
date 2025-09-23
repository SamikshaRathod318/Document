import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, Subscription, finalize } from 'rxjs';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, DragDropModule],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  uploadForm: FormGroup;
  isDragging = false;
  uploadedFiles: UploadedFile[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
  private destroy$ = new Subject<void>();
  private uploadSubscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.uploadForm = this.fb.group({
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.uploadSubscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!this.isFileTypeValid(file)) {
        this.addFileToQueue(file, 0, 'error', 'Invalid file type');
        continue;
      }
      
      if (file.size > this.maxFileSize) {
        this.addFileToQueue(file, 0, 'error', 'File size exceeds 10MB limit');
        continue;
      }
      
      this.addFileToQueue(file, 0, 'pending');
    }
    
    // Process the upload queue
    this.processUploadQueue();
  }

  private isFileTypeValid(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return this.acceptedFileTypes.includes(`.${extension}`);
  }

  private addFileToQueue(
    file: File, 
    progress: number, 
    status: 'pending' | 'uploading' | 'completed' | 'error', 
    error?: string
  ): void {
    this.uploadedFiles = [
      ...this.uploadedFiles,
      { file, progress, status, error }
    ];
  }

  private processUploadQueue(): void {
    const pendingFiles = this.uploadedFiles.filter(f => f.status === 'pending');
    
    pendingFiles.forEach(fileInfo => {
      const index = this.uploadedFiles.findIndex(f => f === fileInfo);
      if (index !== -1) {
        this.uploadedFiles[index].status = 'uploading';
        this.uploadFile(this.uploadedFiles[index].file, index);
      }
    });
  }

  private uploadFile(file: File, index: number): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', this.uploadForm.get('category')?.value);
    formData.append('description', this.uploadForm.get('description')?.value);

    // In a real application, replace this with your actual API endpoint
    const upload$ = this.http.post('YOUR_API_ENDPOINT', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      finalize(() => {
        // Remove this subscription when complete
        const subIndex = this.uploadSubscriptions.findIndex(sub => sub.closed);
        if (subIndex > -1) {
          this.uploadSubscriptions.splice(subIndex, 1);
        }
      })
    );

    const subscription = upload$.subscribe({
      next: (event: any) => {
        if (event.loaded && event.total) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.uploadedFiles[index].progress = progress;
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadedFiles[index].status = 'error';
        this.uploadedFiles[index].error = 'Upload failed. Please try again.';
      },
      complete: () => {
        this.uploadedFiles[index].status = 'completed';
        this.uploadedFiles[index].progress = 100;
        // You might want to refresh the document list here
      }
    });

    this.uploadSubscriptions.push(subscription);
  }

  cancelUpload(index: number): void {
    if (this.uploadSubscriptions[index]) {
      this.uploadSubscriptions[index].unsubscribe();
      this.uploadSubscriptions.splice(index, 1);
    }
    this.uploadedFiles.splice(index, 1);
  }

  retryUpload(index: number): void {
    const fileInfo = this.uploadedFiles[index];
    fileInfo.status = 'pending';
    fileInfo.error = undefined;
    this.processUploadQueue();
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.uploadedFiles.length > 0) {
      // Form is valid and there are files to upload
      console.log('Form submitted:', this.uploadForm.value);
      // The actual upload is handled by processUploadQueue()
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📑';
      case 'txt':
        return '📄';
      default:
        return '📎';
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onFileInputClick(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  isUploading(): boolean {
    return this.uploadedFiles.some(file => file.status === 'uploading');
  }
}
