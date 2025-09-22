import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss'],
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
    DatePipe
  ]
})
export class DocumentListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'type', 'uploadedDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Document>();
  
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
  
  // Mock data - replace with actual API call
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
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDocuments(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.dataSource.data = this.mockDocuments;
      this.isLoading = false;
    }, 1000);
  }

  applyFilter(): void {
    let filteredData = [...this.mockDocuments];
    
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
    // Implement view document logic
    console.log('View document:', document);
  }

  editDocument(document: Document): void {
    // Implement edit document logic
    console.log('Edit document:', document);
  }

  deleteDocument(document: Document): void {
    // Implement delete document logic
    console.log('Delete document:', document);
  }
}
