import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Document } from '../../models/document.model';
import { DocumentService } from '../../../../core/services/document.service';
import { AuthService } from '../../../../core/services/auth.service';
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
export class DocumentListComponent implements OnInit, AfterViewInit, OnDestroy {
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
    { value: 'pending', viewValue: 'Pending' },
    { value: 'approved', viewValue: 'Approved' },
    { value: 'rejected', viewValue: 'Rejected' },
    { value: 'completed', viewValue: 'Completed' }
  ];

  searchText = '';
  selectedStatus = 'all';
  isLoading = false;
  showForm = false;
  selectedDocument: Document | null = null;
  showEditForm = false;
  editForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private documentStore: DocumentStoreService
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      type: [''],
      department: ['', Validators.required],
      documentType: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    this.documentStore.documents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(docs => {
        this.baseDocuments = docs ?? [];
        this.applyFilter();
      });

    await this.loadDocuments();

    // Handle query parameters for status filter
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.selectedStatus = params['status'];
        this.applyFilter();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadDocuments(): Promise<void> {
    try {
      this.isLoading = true;
      this.baseDocuments = await this.documentService.getDocuments();
      this.documentStore.setInitial(this.baseDocuments);
      this.applyFilter();
    } catch (error) {
      console.error('Error loading documents:', error);
      this.snackBar.open('Failed to load documents', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    } finally {
      this.isLoading = false;
    }
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
    if (doc.status === 'approved' || doc.status === 'rejected' || doc.status === 'completed') return '-';

    // Use current_stage to determine who should handle the document
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
      filteredData = filteredData.filter(doc => {
        // Handle both old and new status formats
        const docStatus = (doc.status || '').toLowerCase();
        const selectedStatusLower = this.selectedStatus.toLowerCase();
        return docStatus === selectedStatusLower;
      });
    }
    
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(doc => {
        const title = (doc.title || '').toLowerCase();
        const docType = (doc.documentType || '').toLowerCase();
        const uploadedBy = (doc.uploadedBy || '').toLowerCase();
        const department = (doc.department || '').toLowerCase();
        return title.includes(searchTextLower) ||
               docType.includes(searchTextLower) ||
               uploadedBy.includes(searchTextLower) ||
               department.includes(searchTextLower);
      });
    }
    
    this.filteredDocuments = filteredData;
    this.dataSource.data = filteredData;
    
    // Reset paginator to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }



  getStatusClass(status: string): string {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  }

  getStatusLabel(status: string | undefined | null): string {
    if (!status) {
      return 'Pending';
    }

    const normalized = status.toString().trim().toLowerCase();
    const labelMap: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      'in review': 'In Review'
    };

    return labelMap[normalized] || status;
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

  getClassColor(classValue: string | undefined): string {
    const normalized = (classValue || '').trim().toUpperCase();
    switch (normalized) {
      case 'A':
      case 'CONFIDENTIAL':
        return 'class-A';
      case 'B':
      case 'GENERAL':
        return 'class-B';
      case 'C':
      case 'URGENT':
        return 'class-C';
      case 'D':
      case 'OTHERS':
      case 'OTHER':
        return 'class-D';
      default:
        return 'class-default';
    }
  }

  getClassLabel(classValue: string | undefined): string {
    if (!classValue) {
      return 'N/A';
    }

    const normalized = classValue.trim().toUpperCase();
    const labelMap: Record<string, string> = {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      CONFIDENTIAL: 'A',
      GENERAL: 'B',
      URGENT: 'C',
      OTHERS: 'D',
      OTHER: 'D'
    };

    return labelMap[normalized] || normalized;
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

  async saveDocument(): Promise<void> {
    if (this.editForm.valid && this.selectedDocument) {
      try {
          await this.documentService.updateDocument(String(this.selectedDocument.id), {
          title: this.editForm.value.title,
          // Note: type, department, documentType are legacy fields
          // You may want to store these in a metadata field or separate table
        });
        await this.loadDocuments();
        this.snackBar.open('Document updated successfully!', 'Close', { duration: 3000 });
        this.closeEditForm();
      } catch (error) {
        console.error('Error updating document:', error);
        this.snackBar.open('Failed to update document', 'Close', { duration: 3000 });
      }
    }
  }

  async deleteDocument(document: Document): Promise<void> {
    const confirmed = window.confirm(`Delete "${document.title}"?`);
    if (!confirmed) return;
    
    try {
      await this.documentService.deleteDocument(String(document.id));
      await this.loadDocuments();
      this.snackBar.open('Document deleted', 'Dismiss', { duration: 2000 });
    } catch (error) {
      console.error('Error deleting document:', error);
      this.snackBar.open('Failed to delete document', 'Dismiss', { duration: 3000 });
    }
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

  isImageFile(type?: string): boolean {
    if (!type) return false;
    const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'];
    return imageTypes.includes(type.toUpperCase());
  }

  isTextFile(type?: string): boolean {
    if (!type) return false;
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
     if (document.fileUrl || document.file_url) {
       const link = window.document.createElement('a');
       link.href = document.fileUrl || document.file_url || '';
       link.download = document.title || 'document';
       link.target = '_blank';
       window.document.body.appendChild(link);
       link.click();
       window.document.body.removeChild(link);
     }
   }

  get isAccountant(): boolean {
    return this.auth.hasRole('accountant');
  }

  async rejectDocument(document: Document): Promise<void> {
    const confirmReject = window.confirm(`Reject "${document.title}"?`);
    if (!confirmReject) return;

    try {
      await this.documentService.updateDocument(String(document.id), {
        status: 'rejected'
      });
      await this.loadDocuments();
      this.snackBar.open('Document rejected', 'Dismiss', { duration: 2000 });
    } catch (error) {
      console.error('Error rejecting document:', error);
      this.snackBar.open('Failed to reject document', 'Dismiss', { duration: 3000 });
    }
  }

  canReupload(document: Document): boolean {
    if (!document) return false;
    const status = (document.status || '').toLowerCase();
    return status === 'rejected';
  }

  navigateToReupload(document: Document): void {
    if (!document || !document.id) return;
    this.router.navigate(['/upload'], { queryParams: { id: document.id } });
  }

  async sendForApproval(document: Document): Promise<void> {
    if (!document) return;
    try {
      await this.documentService.updateDocument(String(document.id), {
        status: 'pending'
      });
      await this.loadDocuments();
      this.snackBar.open('Sent for approval', 'Dismiss', { duration: 2000 });
      // Redirect to documents view filtered by pending
      this.router.navigate(['/documents'], { queryParams: { status: 'pending' } });
    } catch (error) {
      console.error('Error sending for approval:', error);
      this.snackBar.open('Failed to send for approval', 'Dismiss', { duration: 3000 });
    }
  }

  hasStatus(doc: Document | null | undefined, ...statuses: Array<Document['status'] | string>): boolean {
    if (!doc?.status || statuses.length === 0) {
      return false;
    }
    const docStatus = doc.status.toString().toLowerCase();
    return statuses.some(status => status?.toString().toLowerCase() === docStatus);
  }
}