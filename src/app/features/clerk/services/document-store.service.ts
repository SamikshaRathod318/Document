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
    const docs = [...this._documents$.value];
    // Ensure unique id
    const nextId = docs.length ? Math.max(...docs.map(d => d.id)) + 1 : 1;
    const withId = { ...doc, id: doc.id ?? nextId } as Document;
    const updatedDocs = [withId, ...docs];
    this._documents$.next(updatedDocs);
    this.saveToStorage(updatedDocs);
  }

  update(updated: Document): void {
    const docs = this._documents$.value.map(d => d.id === updated.id ? { ...d, ...updated } : d);
    this._documents$.next(docs);
    this.saveToStorage(docs);
  }

  delete(id: number): void {
    const docs = this._documents$.value.filter(d => d.id !== id);
    this._documents$.next(docs);
    this.saveToStorage(docs);
  }

  setInitial(docs: Document[]): void {
    this._documents$.next(docs);
    this.saveToStorage(docs);
  }

  private loadFromStorage(): Document[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((doc: any) => ({
          ...doc,
          uploadedDate: new Date(doc.uploadedDate)
        }));
      }
    } catch (error) {
      console.error('Error loading documents from storage:', error);
    }
    return this.createInitialMock();
  }

  private saveToStorage(docs: Document[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
    } catch (error) {
      console.error('Error saving documents to storage:', error);
    }
  }

  private createInitialMock(): Document[] {
    return [
      { id: 1, title: 'Annual Report 2023', type: 'PDF', uploadedDate: new Date('2023-01-15'), status: 'Pending', uploadedBy: 'John Doe', department: 'Finance', documentType: 'Annual Report', class: 'A' },
      { id: 2, title: 'Meeting Minutes', type: 'DOCX', uploadedDate: new Date('2023-01-10'), status: 'Approved', uploadedBy: 'Jane Smith', department: 'HR', documentType: 'Minutes', class: 'B' },
      { id: 3, title: 'Budget Q1', type: 'XLSX', uploadedDate: new Date('2023-01-05'), status: 'Rejected', uploadedBy: 'Mike Johnson', department: 'Finance', documentType: 'Budget', class: 'C' },
      { id: 4, title: 'Policy Update', type: 'PDF', uploadedDate: new Date('2023-02-02'), status: 'Approved', uploadedBy: 'Anna Lee', department: 'Legal', documentType: 'Policy', class: 'D' },
      { id: 5, title: 'Onboarding Guide', type: 'DOCX', uploadedDate: new Date('2023-02-10'), status: 'Pending', uploadedBy: 'Chris Green', department: 'HR', documentType: 'Guide', class: 'A' },
      { id: 6, title: 'Sales Forecast', type: 'XLSX', uploadedDate: new Date('2023-02-15'), status: 'In Review', uploadedBy: 'Sam Patel', department: 'Sales', documentType: 'Forecast', class: 'B' },
      { id: 7, title: 'Compliance Checklist', type: 'PDF', uploadedDate: new Date('2023-03-01'), status: 'Approved', uploadedBy: 'Mary Adams', department: 'Compliance', documentType: 'Checklist', class: 'C' },
      { id: 8, title: 'Training Plan', type: 'DOCX', uploadedDate: new Date('2023-03-05'), status: 'Pending', uploadedBy: 'Tom Brown', department: 'L&D', documentType: 'Plan', class: 'D' },
      { id: 9, title: 'IT Inventory', type: 'XLSX', uploadedDate: new Date('2023-03-12'), status: 'Rejected', uploadedBy: 'Ivy Chen', department: 'IT', documentType: 'Inventory', class: 'A' },
      { id: 10, title: 'Marketing Brief', type: 'PDF', uploadedDate: new Date('2023-03-18'), status: 'In Review', uploadedBy: 'Leo Garcia', department: 'Marketing', documentType: 'Brief', class: 'B' },
      { id: 11, title: 'Audit Findings', type: 'PDF', uploadedDate: new Date('2023-03-25'), status: 'Pending', uploadedBy: 'Nina Shah', department: 'Audit', documentType: 'Findings', class: 'C' }
    ];
  }
}
