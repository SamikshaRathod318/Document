import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Document } from '../../models/document.model';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss', './attractive-ui.css'],
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

  displayedColumns: string[] = ['title', 'type', 'uploadedDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  
  // Paginator state
  pageSize = 5;
  
  // Backing list from store (unfiltered)
  private baseDocuments: Document[] = [];

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
      documentType: 'Annual Report'
    },
    { 
      id: 2, 
      title: 'Meeting Minutes', 
      type: 'DOCX', 
      uploadedDate: new Date('2023-01-10'), 
      status: 'Approved',
      uploadedBy: 'Jane Smith',
      department: 'HR',
      documentType: 'Minutes'
    },
    { 
      id: 3, 
      title: 'Budget Q1', 
      type: 'XLSX', 
      uploadedDate: new Date('2023-01-05'), 
      status: 'Rejected',
      uploadedBy: 'Mike Johnson',
      department: 'Finance',
      documentType: 'Budget'
    },
    { id: 4, title: 'Policy Update', type: 'PDF', uploadedDate: new Date('2023-02-02'), status: 'Approved', uploadedBy: 'Anna Lee', department: 'Legal', documentType: 'Policy' },
    { id: 5, title: 'Onboarding Guide', type: 'DOCX', uploadedDate: new Date('2023-02-10'), status: 'Pending', uploadedBy: 'Chris Green', department: 'HR', documentType: 'Guide' },
    { id: 6, title: 'Sales Forecast', type: 'XLSX', uploadedDate: new Date('2023-02-15'), status: 'In Review', uploadedBy: 'Sam Patel', department: 'Sales', documentType: 'Forecast' },
    { id: 7, title: 'Compliance Checklist', type: 'PDF', uploadedDate: new Date('2023-03-01'), status: 'Approved', uploadedBy: 'Mary Adams', department: 'Compliance', documentType: 'Checklist' },
    { id: 8, title: 'Training Plan', type: 'DOCX', uploadedDate: new Date('2023-03-05'), status: 'Pending', uploadedBy: 'Tom Brown', department: 'L&D', documentType: 'Plan' },
    { id: 9, title: 'IT Inventory', type: 'XLSX', uploadedDate: new Date('2023-03-12'), status: 'Rejected', uploadedBy: 'Ivy Chen', department: 'IT', documentType: 'Inventory' },
    { id: 10, title: 'Marketing Brief', type: 'PDF', uploadedDate: new Date('2023-03-18'), status: 'In Review', uploadedBy: 'Leo Garcia', department: 'Marketing', documentType: 'Brief' },
    { id: 11, title: 'Audit Findings', type: 'PDF', uploadedDate: new Date('2023-03-25'), status: 'Pending', uploadedBy: 'Nina Shah', department: 'Audit', documentType: 'Findings' },
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: DocumentStoreService
  ) {}

  ngOnInit(): void {
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Ensure paginator reflects current pageSize
    if (this.paginator) {
      this.paginator.pageSize = this.pageSize;
    }
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
    
    this.dataSource.data = filteredData;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  viewDocument(document: Document): void {
    // Show quick feedback for now; can be replaced with a MatDialog viewer
    this.snackBar.open(`Viewing: ${document.title}`, 'OK', { duration: 2000 });
  }

  editDocument(document: Document): void {
    // Navigate to upload/edit page with query param (placeholder flow)
    this.router.navigate(['/clerk/upload'], { queryParams: { id: document.id } });
    this.snackBar.open(`Opening editor for: ${document.title}`, 'Dismiss', { duration: 2000 });
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

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }
}
