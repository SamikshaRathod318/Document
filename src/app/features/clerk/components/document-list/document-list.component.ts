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

  displayedColumns: string[] = ['title', 'type', 'documentType', 'class', 'uploadedDate', 'status', 'actions'];
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

  /**
   * Derive who currently owns the document in the workflow.
   * Flow: Clerk -> Senior Clerk -> Accountant -> HOD
   */
  getPendingWith(doc: Document): string {
    if (!doc) return '-';
    if (doc.status === 'Approved' || doc.status === 'Rejected') return '-';

    const reviewedByLower = (doc.reviewedBy || '').toLowerCase();

    // Explicit Pending -> Senior Clerk
    if (doc.status === 'Pending') {
      return 'Senior Clerk';
    }

    // In Review flow
    if (doc.status === 'In Review') {
      // If reviewed by Accountant already -> next is HOD
      if (reviewedByLower.includes('account')) {
        return 'HOD';
      }
      // If reviewed by Senior Clerk or reviewer missing -> next is Accountant
      return 'Accountant';
    }

    return '-';
  }

  /**
   * Navigate to the dashboard of the role who currently owns the document.
   * Passes query params to help pre-filter/focus on the document.
   */
  navigateToPendingOwner(doc: Document): void {
    const owner = this.getPendingWith(doc);
    if (owner === '-' ) return;

    let route: string[] = [];
    switch (owner) {
      case 'Senior Clerk':
        route = ['/clerk', 'senior-dashboard'];
        break;
      case 'Accountant':
        route = ['/accountant', 'dashboard'];
        break;
      case 'HOD':
        route = ['/hod', 'dashboard'];
        break;
      default:
        route = ['/clerk', 'dashboard'];
    }

    this.router.navigate(route, {
      queryParams: {
        focusDoc: doc.id,
        status: doc.status,
        pendingWith: owner
      }
    });
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

  getDisplayType(doc: Document): string {
    if (doc.type && doc.type !== 'UNKNOWN' && doc.type !== 'OTHER') {
      return doc.type;
    }

    if (doc.fileUrl?.startsWith('data:')) {
      const mimeMatch = doc.fileUrl.match(/^data:(.*?);/);
      if (mimeMatch?.[1]) {
        return this.mapMimeToType(mimeMatch[1]);
      }
    }

    if (doc.fileUrl) {
      const urlWithoutParams = doc.fileUrl.split('?')[0];
      const ext = urlWithoutParams.split('.').pop()?.toUpperCase();
      if (ext) {
        return ext;
      }
    }

    return 'UNKNOWN';
  }

  private mapMimeToType(mime: string): string {
    if (!mime) return 'UNKNOWN';
    const lower = mime.toLowerCase();
    if (lower === 'application/pdf') return 'PDF';
    if (lower.includes('msword') || lower.includes('wordprocessingml')) return 'DOCX';
    if (lower.includes('spreadsheet') || lower.includes('ms-excel')) return 'XLSX';
    if (lower === 'text/plain') return 'TXT';
    if (lower.startsWith('image/')) return lower.split('/')[1].toUpperCase();
    return mime.toUpperCase();
  }

  getTypeIcon(doc: Document): string {
    const type = this.getDisplayType(doc);
    switch (type) {
      case 'PDF': return 'picture_as_pdf';
      case 'DOC':
      case 'DOCX': return 'description';
      case 'XLS':
      case 'XLSX': return 'table_chart';
      case 'TXT': return 'text_snippet';
      case 'PNG':
      case 'JPEG':
      case 'JPG':
      case 'GIF':
      case 'BMP':
      case 'WEBP': return 'image';
      default: return 'insert_drive_file';
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