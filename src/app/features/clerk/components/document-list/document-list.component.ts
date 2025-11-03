import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Document } from '../../models/document.model';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss', './attractive-ui.css', './form-modal.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    DatePipe
  ]
})
export class DocumentListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'type', 'class', 'uploadedDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  
  pageSize = 5;
  currentPage = 1;
  
  private baseDocuments: Document[] = [];
  filteredDocuments: Document[] = [];

  statusOptions = [
    { value: 'all', viewValue: 'All Documents' },
    { value: 'Pending', viewValue: 'Pending' },
    { value: 'In Review', viewValue: 'In Review' },
    { value: 'Approved', viewValue: 'Approved' },
    { value: 'Rejected', viewValue: 'Rejected' }
  ];

  searchText = '';
  selectedStatus = 'all';
  isLoading = false;
  showForm = false;
  selectedDocument: Document | null = null;
  showEditForm = false;
  editForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private store: DocumentStoreService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      type: [''],
      department: ['', Validators.required],
      documentType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.store.documents$.subscribe(docs => {
      this.baseDocuments = docs;
      this.applyFilter();
    });

    // Handle query parameters for status filter
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.selectedStatus = params['status'];
        this.applyFilter();
      }
    });
  }

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      // Listen to paginator events
      this.paginator.page.subscribe((event: PageEvent) => {
        this.onPageChange(event);
      });
    }
  }

  applyFilter(): void {
    let filteredData = [...this.baseDocuments];
    
    if (this.selectedStatus !== 'all') {
      filteredData = filteredData.filter(doc => doc.status === this.selectedStatus);
    }
    
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(doc => 
        doc.title.toLowerCase().includes(searchTextLower) ||
        doc.documentType.toLowerCase().includes(searchTextLower) ||
        doc.uploadedBy.toLowerCase().includes(searchTextLower) ||
        doc.department.toLowerCase().includes(searchTextLower)
      );
    }
    
    this.filteredDocuments = filteredData;
    this.dataSource.data = filteredData;
    
    // Reset paginator to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }



  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'In Review': return 'status-in-review';
      default: return 'status-pending';
    }
  }

  getClassColor(classValue: string): string {
    switch (classValue?.toUpperCase()) {
      case 'A': return 'class-a';
      case 'B': return 'class-b';
      case 'C': return 'class-c';
      case 'D': return 'class-d';
      default: return 'class-default';
    }
  }

  viewDocument(document: Document): void {
    this.selectedDocument = document;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedDocument = null;
  }

  editDocument(document: Document): void {
    this.selectedDocument = document;
    this.editForm.patchValue({
      title: document.title,
      type: document.type,
      department: document.department,
      documentType: document.documentType
    });
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedDocument = null;
    this.editForm.reset();
  }

  saveDocument(): void {
    if (this.editForm.valid && this.selectedDocument) {
      const updatedDoc = {
        ...this.selectedDocument,
        ...this.editForm.value
      };
      this.store.update(updatedDoc);
      this.snackBar.open('Document updated successfully!', 'Close', { duration: 3000 });
      this.closeEditForm();
    }
  }

  deleteDocument(document: Document): void {
    const confirmed = window.confirm(`Delete "${document.title}"?`);
    if (!confirmed) return;
    
    this.store.delete(document.id);
    this.applyFilter();
    this.snackBar.open('Document deleted', 'Dismiss', { duration: 2000 });
  }



  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  // Document preview helper methods
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isImageFile(type: string): boolean {
    const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'];
    return imageTypes.includes(type.toUpperCase());
  }

  isTextFile(type: string): boolean {
    const textTypes = ['TXT', 'DOC', 'DOCX'];
    return textTypes.includes(type.toUpperCase());
  }

  getFileSize(sizeInBytes?: number): string {
    if (!sizeInBytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  downloadDocument(document: Document): void {
    if (document.fileUrl) {
      const link = window.document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  }
}