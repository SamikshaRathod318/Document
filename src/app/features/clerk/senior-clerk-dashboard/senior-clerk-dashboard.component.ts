import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DocumentStoreService } from '../services/document-store.service';

@Component({
  selector: 'app-senior-clerk-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './senior-clerk-dashboard.component.html',
  styleUrls: ['./senior-clerk-dashboard.component.css']
})
export class SeniorClerkDashboardComponent implements OnInit, OnDestroy {
  private store = inject(DocumentStoreService);
  private sub?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'uploadedBy', 'uploadedDate', 'actions'];
  dataSource = new MatTableDataSource<{ id: number; title: string; uploadedBy: string; uploadedDate: Date }>([]);

  searchText = '';
  totalPending = 0;
  totalApproved = 0;
  totalInReview = 0;

  ngOnInit(): void {
    this.sub = this.store.documents$.subscribe(docs => {
      const queue = docs
        .filter(d => d.status === 'Pending')
        .map(d => ({
          id: d.id,
          title: d.title,
          uploadedBy: d.uploadedBy,
          uploadedDate: d.uploadedDate
        }));
      this.dataSource.data = queue;

      // Stats
      this.totalPending = docs.filter(d => d.status === 'Pending').length;
      this.totalApproved = docs.filter(d => d.status === 'Approved').length;
      this.totalInReview = docs.filter(d => d.status === 'In Review').length;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    const text = this.searchText.trim().toLowerCase();
    this.dataSource.filter = text;
    this.dataSource.filterPredicate = (data) =>
      data.title.toLowerCase().includes(text) ||
      data.uploadedBy.toLowerCase().includes(text);
    if (this.paginator) this.paginator.firstPage();
  }

  verifyAndForward(id: number): void {
    const doc = this.store.documents.find(d => d.id === id);
    if (!doc) return;
    this.store.update({
      ...doc,
      status: 'In Review',
      reviewedBy: 'Senior Clerk',
      reviewedDate: new Date()
    } as any);
  }
}


