import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentStoreService {
  private readonly STORAGE_KEY = 'doc_management_documents';
  private readonly _documents$ = new BehaviorSubject<Document[]>(this.loadFromStorage());
  readonly documents$ = this._documents$.asObservable();

  get documents(): Document[] {
    return this._documents$.value;
  }

  add(doc: Document): void {
    const previous = [...this._documents$.value];
    const currentDocs = [...previous];

    if (doc.id != null) {
      const index = currentDocs.findIndex(d => d.id === doc.id);
      if (index !== -1) {
        currentDocs[index] = { ...currentDocs[index], ...doc };
      } else {
        currentDocs.unshift({ ...doc });
      }
    } else {
      const nextId = this.generateNextId(currentDocs);
      currentDocs.unshift({ ...doc, id: nextId });
    }

    const deduped = this.dedupeDocuments(currentDocs);
    this.persistWithFallback(deduped, previous);
  }

  private generateNextId(docs: Document[]): number {
    let nextId = docs.length ? Math.max(...docs.map(d => d.id ?? 0)) + 1 : 1;
    while (docs.some(d => d.id === nextId)) {
      nextId++;
    }
    return nextId;
  }

  update(updated: Document): void {
    const previous = [...this._documents$.value];
    const nextDocs = this._documents$.value.map(d => (d.id === updated.id ? { ...d, ...updated } : d));
    const deduped = this.dedupeDocuments(nextDocs);
    this.persistWithFallback(deduped, previous);
  }

  delete(id: number): void {
    const previous = [...this._documents$.value];
    const docs = this._documents$.value.filter(d => d.id !== id);
    const deduped = this.dedupeDocuments(docs);
    this.persistWithFallback(deduped, previous);
  }

  setInitial(docs: Document[]): void {
    const deduped = this.dedupeDocuments(docs);
    this.persistWithFallback(deduped, this._documents$.value);
  }

  resetToFreshData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    const freshData = this.createInitialMock();
    this._documents$.next(freshData);
    this.saveToStorage(freshData);
  }

  private loadFromStorage(): Document[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if stored data has fileUrl - if not, reset to fresh data
        const hasFileUrls = parsed.some((doc: any) => doc.fileUrl);
        if (!hasFileUrls) {
          localStorage.removeItem(this.STORAGE_KEY);
          return this.createInitialMock();
        }
        // Convert date strings back to Date objects
        const hydrated = parsed.map((doc: any) => ({
          ...doc,
          uploadedDate: new Date(doc.uploadedDate),
          reviewedDate: doc.reviewedDate ? new Date(doc.reviewedDate) : undefined
        }));
        const deduped = this.dedupeDocuments(hydrated);
        if (deduped.length !== hydrated.length) {
          this.saveToStorage(deduped);
        }
        return deduped;
      }
    } catch (error) {
      console.error('Error loading documents from storage:', error);
    }
    return this.createInitialMock();
  }

  private saveToStorage(docs: Document[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
  }

  private dedupeDocuments(docs: Document[]): Document[] {
    const result: Document[] = [];
    const seen = new Map<string, Document>();

    for (const doc of docs) {
      if (!doc) continue;
      const key = this.getDocumentKey(doc);
      const existing = seen.get(key);
      if (existing) {
        Object.assign(existing, doc);
      } else {
        const clone = { ...doc };
        seen.set(key, clone);
        result.push(clone);
      }
    }

    return result;
  }

  private persistWithFallback(next: Document[], fallback: Document[]): void {
    try {
      this._documents$.next(next);
      this.saveToStorage(next);
    } catch (error) {
      console.error('Failed to persist documents:', error);
      this._documents$.next(fallback);
      throw error;
    }
  }

  private getDocumentKey(doc: Document): string {
    if (doc.id != null) {
      return `id:${doc.id}`;
    }
    // Treat documents without an id as unique entries
    const unique = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    return `unique:${unique}`;
  }

  private createInitialMock(): Document[] {
    return [
      { 
        id: 1, 
        title: 'Annual Report 2023', 
        type: 'PDF', 
        uploadedDate: new Date('2023-01-15'), 
        status: 'Pending', 
        uploadedBy: 'John Doe', 
        department: 'Finance', 
        documentType: 'Annual Report', 
        class: 'A',
        size: 2048576,
        description: 'Comprehensive annual financial report for the year 2023',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
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
        class: 'B',
        size: 524288,
        description: 'Minutes from the monthly HR team meeting',
        fileUrl: 'https://file-examples.com/storage/fe68c8c7c66afe9b1a9c7e3/2017/10/file_example_DOC_100kB.doc'
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
        class: 'C',
        size: 1048576,
        description: 'First quarter budget allocation and expenses',
        fileUrl: 'https://file-examples.com/storage/fe68c8c7c66afe9b1a9c7e3/2017/10/file_example_XLSX_10.xlsx'
      },
      { 
        id: 4, 
        title: 'Policy Update', 
        type: 'PDF', 
        uploadedDate: new Date('2023-02-02'), 
        status: 'Approved', 
        uploadedBy: 'Anna Lee', 
        department: 'Legal', 
        documentType: 'Policy', 
        class: 'D',
        size: 1572864,
        description: 'Updated company policies and procedures',
        fileUrl: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
      },
      { 
        id: 5, 
        title: 'Company Logo', 
        type: 'PNG', 
        uploadedDate: new Date('2023-02-10'), 
        status: 'Pending', 
        uploadedBy: 'Chris Green', 
        department: 'Marketing', 
        documentType: 'Image', 
        class: 'A',
        size: 256000,
        description: 'Official company logo in PNG format',
fileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDA2NmNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbXBhbnkgTG9nbzwvdGV4dD48L3N2Zz4='
      },
      { 
        id: 6, 
        title: 'Sales Forecast', 
        type: 'XLSX', 
        uploadedDate: new Date('2023-02-15'), 
        status: 'In Review', 
        uploadedBy: 'Sam Patel', 
        department: 'Sales', 
        documentType: 'Forecast', 
        class: 'B',
        size: 786432,
        description: 'Sales projections for the next quarter',
        fileUrl: 'https://file-examples.com/storage/fe68c8c7c66afe9b1a9c7e3/2017/10/file_example_XLSX_50.xlsx'
      },
      { 
        id: 7, 
        title: 'Compliance Checklist', 
        type: 'PDF', 
        uploadedDate: new Date('2023-03-01'), 
        status: 'Approved', 
        uploadedBy: 'Mary Adams', 
        department: 'Compliance', 
        documentType: 'Checklist', 
        class: 'C',
        size: 1310720,
        description: 'Regulatory compliance checklist and guidelines',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      { 
        id: 8, 
        title: 'Training Plan', 
        type: 'DOCX', 
        uploadedDate: new Date('2023-03-05'), 
        status: 'Pending', 
        uploadedBy: 'Tom Brown', 
        department: 'L&D', 
        documentType: 'Plan', 
        class: 'D',
        size: 655360,
        description: 'Employee training and development plan',
        fileUrl: 'https://file-examples.com/storage/fe68c8c7c66afe9b1a9c7e3/2017/10/file_example_DOC_500kB.doc'
      },
      { 
        id: 9, 
        title: 'IT Inventory', 
        type: 'XLSX', 
        uploadedDate: new Date('2023-03-12'), 
        status: 'Rejected', 
        uploadedBy: 'Ivy Chen', 
        department: 'IT', 
        documentType: 'Inventory', 
        class: 'A',
        size: 2097152,
        description: 'Complete inventory of IT assets and equipment',
        fileUrl: 'https://file-examples.com/storage/fe68c8c7c66afe9b1a9c7e3/2017/10/file_example_XLSX_100.xlsx'
      },
      { 
        id: 10, 
        title: 'Marketing Brief', 
        type: 'PDF', 
        uploadedDate: new Date('2023-03-18'), 
        status: 'In Review', 
        uploadedBy: 'Leo Garcia', 
        department: 'Marketing', 
        documentType: 'Brief', 
        class: 'B',
        size: 1835008,
        description: 'Marketing campaign brief and strategy document',
        fileUrl: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
      },
      { 
        id: 11, 
        title: 'Audit Findings', 
        type: 'PDF', 
        uploadedDate: new Date('2023-03-25'), 
        status: 'Pending', 
        uploadedBy: 'Nina Shah', 
        department: 'Audit', 
        documentType: 'Findings', 
        class: 'C',
        size: 3145728,
        description: 'Internal audit findings and recommendations',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ];
  }
}
