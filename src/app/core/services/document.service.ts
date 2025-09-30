import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Document } from '../../shared/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiService = inject(ApiService);

  getDocument(id: string): Observable<Document> {
    return this.apiService.get<Document>(`/documents/${id}`);
  }

  getDocuments(): Observable<Document[]> {
    return this.apiService.get<Document[]>('/documents');
  }

  updateDocument(id: string, document: Partial<Document>): Observable<Document> {
    return this.apiService.put<Document>(`/documents/${id}`, document);
  }

  deleteDocument(id: string): Observable<void> {
    return this.apiService.delete<void>(`/documents/${id}`);
  }
}