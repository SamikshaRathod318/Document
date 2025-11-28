import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DocumentStoreService } from '../services/document-store.service';
import { Document } from '../models/document.model';

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
    MatTooltipModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './senior-clerk-dashboard.component.html',
  styleUrls: ['./senior-clerk-dashboard.component.css']
})
export class SeniorClerkDashboardComponent implements OnInit, OnDestroy {
  private store = inject(DocumentStoreService);
  private sub?: Subscription;
  private router = inject(Router);

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['title', 'uploadedBy', 'uploadedDate', 'actions'];
  dataSource = new MatTableDataSource<Document>([]);

  searchText = '';
  totalPending = 0;
  totalApproved = 0;
  totalInReview = 0;

  ngOnInit(): void {
    this.sub = this.store.documents$.subscribe(docs => {
      const queueMap = new Map<string | number, Document>();
      docs
        .filter(d => {
          const status = (d.status || '').toLowerCase();
          return status === 'pending' && !d.needsClerkApproval;
        })
        .forEach(doc => queueMap.set(doc.id, doc));
      const uniqueQueue = Array.from(queueMap.values());
      this.dataSource.data = uniqueQueue;

      // Stats - exclude documents needing clerk approval from pending count
      this.totalPending = docs.filter(d => {
        const status = (d.status || '').toLowerCase();
        return status === 'pending' && !d.needsClerkApproval;
      }).length;
      this.totalApproved = docs.filter(d => {
        const status = (d.status || '').toLowerCase();
        return status === 'approved';
      }).length;
      this.totalInReview = docs.filter(d => {
        const status = (d.status || '').toLowerCase();
        return status === 'pending';
      }).length;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.sort) this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    const text = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (data) =>
      (data.title || '').toLowerCase().includes(text) ||
      (data.uploadedBy || '').toLowerCase().includes(text);
    this.dataSource.filter = text;
  }

  verifyAndForward(id: string | number): void {
    const doc = this.store.documents.find(d => d.id === id);
    if (!doc) return;
    this.store.update({
      ...doc,
      status: 'pending',
      reviewedBy: 'Senior Clerk',
      reviewedDate: new Date()
    } as any);

    // Navigate back to documents list showing all items
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
      reviewedBy: 'Senior Clerk',
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


