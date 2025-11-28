import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { DocumentStoreService } from '../../../clerk/services/document-store.service';
import { Router } from '@angular/router';
import { Document } from '../../../clerk/models/document.model';

@Component({
  selector: 'app-accountant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './accountant-dashboard.component.html',
  styleUrls: ['./accountant-dashboard.component.css']
})
export class AccountantDashboardComponent implements OnInit, OnDestroy {
  private store = inject(DocumentStoreService);
  private sub?: Subscription;
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'uploadedBy', 'uploadedDate', 'actions'];
  dataSource = new MatTableDataSource<Document>([]);

  searchText = '';
  totalInQueue = 0;

  ngOnInit(): void {
    this.sub = this.store.documents$.subscribe(docs => {
      const queueMap = new Map<string | number, Document>();
      docs
        .filter(d => {
          const status = (d.status || '').toLowerCase();
          return status === 'pending' && (!d.reviewedBy || d.reviewedBy.toLowerCase().includes('senior'));
        })
        .forEach(doc => queueMap.set(doc.id, doc));

      const uniqueQueue = Array.from(queueMap.values());
      this.dataSource.data = uniqueQueue;
      this.totalInQueue = uniqueQueue.length;
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilter(): void {
    const text = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (data) =>
      (data.title || '').toLowerCase().includes(text) ||
      (data.uploadedBy || '').toLowerCase().includes(text);
    this.dataSource.filter = text;
    if (this.paginator) this.paginator.firstPage();
  }

  forwardToHod(id: string | number): void {
    const doc = this.store.documents.find(d => d.id === id);
    if (!doc) return;
    this.store.update({
      ...doc,
      status: 'pending',
      reviewedBy: 'Accountant',
      reviewedDate: new Date()
    } as any);
    // After verify, return to documents page showing all entries
    this.router.navigate(['/clerk/documents'], { queryParams: { status: 'all', focusDoc: doc.id } });
  }

  viewDocument(doc: Document): void {
    this.openDocumentInNewTab(doc);
  }

  rejectDocument(id: string | number): void {
    const doc = this.store.documents.find(d => d.id === id);
    if (!doc) return;
    this.store.update({
      ...doc,
      status: 'rejected',
      reviewedBy: 'Accountant',
      reviewedDate: new Date()
    } as any);
    this.router.navigate(['/clerk/documents'], { queryParams: { status: 'rejected', focusDoc: doc.id } });
  }

  private openDocumentInNewTab(doc: Document): void {
    if (!doc.fileUrl) return;

    let url = doc.fileUrl;
    let blobUrl: string | undefined;

    if (url.startsWith('data:')) {
      const blob = this.dataUrlToBlob(url);
      blobUrl = URL.createObjectURL(blob);
      url = blobUrl;
    }

    window.open(url, '_blank');

    if (blobUrl) {
      setTimeout(() => URL.revokeObjectURL(blobUrl!), 60_000);
    }
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(base64 ?? '');
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }
}
