import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Document } from '../../../features/clerk/models/document.model';

@Component({
  selector: 'app-document-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="preview-container">
      <div class="header">
        <h2>{{ data.title }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="meta">
        <div><strong>Uploaded By:</strong> {{ data.uploadedBy }}</div>
        <div><strong>Uploaded On:</strong> {{ data.uploadedDate | date:'medium' }}</div>
        <div><strong>Status:</strong> {{ data.status }}</div>
        <div><strong>Type:</strong> {{ data.type }}</div>
      </div>

      <div class="content" *ngIf="safeUrl; else noFile">
        <ng-container [ngSwitch]="data.type">
          <iframe *ngSwitchCase="'PDF'" [src]="safeUrl" width="100%" height="500px"></iframe>
          <img *ngSwitchCase="'PNG'" [src]="safeUrl" alt="{{ data.title }}" />
          <img *ngSwitchCase="'JPEG'" [src]="safeUrl" alt="{{ data.title }}" />
          <iframe *ngSwitchCase="'DOCX'" [src]="safeUrl" width="100%" height="500px"></iframe>
          <iframe *ngSwitchDefault [src]="safeUrl" width="100%" height="500px"></iframe>
        </ng-container>
      </div>

      <ng-template #noFile>
        <p>No file available for preview.</p>
      </ng-template>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="openNewTab()" [disabled]="!data.fileUrl">
          <mat-icon>launch</mat-icon>
          Open in New Tab
        </button>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      font-size: 14px;
    }
    .content {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class DocumentPreviewDialogComponent {
  safeUrl?: SafeResourceUrl;

  constructor(
    private dialogRef: MatDialogRef<DocumentPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Document,
    private sanitizer: DomSanitizer
  ) {
    if (data.fileUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.fileUrl);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  openNewTab(): void {
    if (!this.data.fileUrl) return;

    let url = this.data.fileUrl;
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

