import { Component, OnInit, ViewChild } from '@angular/core';
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
export class DocumentListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'type', 'class', 'uploadedDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  
  // Paginator state
  pageSize = 5;
  currentPage = 4;
  totalPages = 8;
  
  // Backing list from store (unfiltered)
  private baseDocuments: Document[] = [];
  private filteredDocuments: Document[] = [];

  // Status options for filter
  statusOptions = [
    { value: 'all', viewValue: 'All Documents' },
    { value: 'Pending', viewValue: 'Pending' },
    { value: 'In Review', viewValue: 'In Review' },
    { value: 'Approved', viewValue: 'Approved' },
    { value: 'Rejected', viewValue: 'Rejected' }
  ];

  // Search filter
  searchText = '';
  selectedStatus = 'all';
  isLoading = false;
  showForm = false;
  selectedDocument: Document | null = null;
  showEditForm = false;
  editForm: FormGroup;
  
  // Mock data (legacy) - replaced by DocumentStoreService; kept for fallback
  mockDocuments: Document[] = [
    { 
      id: 1, 
      title: 'Annual Report 2023', 
      type: 'PDF', 
      uploadedDate: new Date('2023-01-15'), 
      status: 'Pending',
      uploadedBy: 'John Doe',
      department: 'Finance',
      documentType: 'Annual Report',
      class: 'A'
    },
    { 
      id: 2, 
      title: 'Meeting Minutes', 
      type: 'DOCX', 
      uploadedDate: new Date('2023-01-10'), 
      status: 'Approved',
      uploadedBy: 'Jane Smith',
      department: 'HR',
      documentType: 'Minutes',
      class: 'B'
    },
    { 
      id: 3, 
      title: 'Budget Q1', 
      type: 'XLSX', 
      uploadedDate: new Date('2023-01-05'), 
      status: 'Rejected',
      uploadedBy: 'Mike Johnson',
      department: 'Finance',
      documentType: 'Budget',
      class: 'C'
    },
    { id: 4, title: 'Policy Update', type: 'PDF', uploadedDate: new Date('2023-02-02'), status: 'Approved', uploadedBy: 'Anna Lee', department: 'Legal', documentType: 'Policy', class: 'D' },
    { id: 5, title: 'Onboarding Guide', type: 'DOCX', uploadedDate: new Date('2023-02-10'), status: 'Pending', uploadedBy: 'Chris Green', department: 'HR', documentType: 'Guide', class: 'A' },
    { id: 6, title: 'Sales Forecast', type: 'XLSX', uploadedDate: new Date('2023-02-15'), status: 'In Review', uploadedBy: 'Sam Patel', department: 'Sales', documentType: 'Forecast', class: 'B' },
    { id: 7, title: 'Compliance Checklist', type: 'PDF', uploadedDate: new Date('2023-03-01'), status: 'Approved', uploadedBy: 'Mary Adams', department: 'Compliance', documentType: 'Checklist', class: 'C' },
    { id: 8, title: 'Training Plan', type: 'DOCX', uploadedDate: new Date('2023-03-05'), status: 'Pending', uploadedBy: 'Tom Brown', department: 'L&D', documentType: 'Plan', class: 'D' },
    { id: 9, title: 'IT Inventory', type: 'XLSX', uploadedDate: new Date('2023-03-12'), status: 'Rejected', uploadedBy: 'Ivy Chen', department: 'IT', documentType: 'Inventory', class: 'A' },
    { id: 10, title: 'Marketing Brief', type: 'PDF', uploadedDate: new Date('2023-03-18'), status: 'In Review', uploadedBy: 'Leo Garcia', department: 'Marketing', documentType: 'Brief', class: 'B' },
    { id: 11, title: 'Audit Findings', type: 'PDF', uploadedDate: new Date('2023-03-25'), status: 'Pending', uploadedBy: 'Nina Shah', department: 'Audit', documentType: 'Findings', class: 'C' },
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private store: DocumentStoreService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      type: [''],
      department: ['', Validators.required],
      documentType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Add class to documents that don't have it
    this.store.documents.forEach((doc, index) => {
      if (!doc.class) {
        const classes = ['A', 'B', 'C', 'D'];
        doc.class = classes[index % 4];
      }
    });
    
    // Subscribe to documents from the store
    this.store.documents$.subscribe(docs => {
      this.baseDocuments = docs;
      this.applyFilter();
    });
    
    // Check for filter query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam) {
      if (filterParam === 'pending') {
        this.selectedStatus = 'Pending';
      } else if (filterParam === 'approved') {
        this.selectedStatus = 'Approved';
      } else if (filterParam === 'all') {
        this.selectedStatus = 'all';
      }
      this.applyFilter();
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadDocuments(): void {
    // Legacy method: set from store immediately
    this.isLoading = false;
    this.baseDocuments = this.store.documents;
    this.applyFilter();
  }

  applyFilter(): void {
    let filteredData = [...this.baseDocuments];
    
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filteredData = filteredData.filter(doc => doc.status === this.selectedStatus);
    }
    
    // Apply search filter
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(doc => 
        doc.title.toLowerCase().includes(searchTextLower) ||
        doc.documentType.toLowerCase().includes(searchTextLower) ||
        doc.uploadedBy.toLowerCase().includes(searchTextLower) ||
        doc.department.toLowerCase().includes(searchTextLower)
      );
    }
    
    // Store filtered data
    this.filteredDocuments = filteredData;
    
    // Calculate total pages
    this.totalPages = Math.max(1, Math.ceil(filteredData.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Apply pagination
    this.updateDisplayedData();
  }

  private updateDisplayedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedData = this.filteredDocuments.slice(startIndex, endIndex);
    console.log('Pagination:', { currentPage: this.currentPage, totalPages: this.totalPages, filteredCount: this.filteredDocuments.length, displayedCount: paginatedData.length });
    this.dataSource.data = paginatedData;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'In Review':
        return 'status-in-review';
      case 'Pending':
      default:
        return 'status-pending';
    }
  }

  getClassColor(classValue: string): string {
    switch (classValue?.toUpperCase()) {
      case 'A':
        return 'class-a';
      case 'B':
        return 'class-b';
      case 'C':
        return 'class-c';
      case 'D':
        return 'class-d';
      default:
        return 'class-default';
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
    if (!confirmed) {
      return;
    }
    // Delete via store so all subscribers update
    this.store.delete(document.id);
    this.applyFilter();
    this.snackBar.open('Document deleted', 'Dismiss', { duration: 2000 });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== this.totalPages) {
        pages.push(i);
      }
    }
    return pages;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }
}
