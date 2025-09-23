import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentStoreService {
  private readonly _documents$ = new BehaviorSubject<Document[]>(this.createInitialMock());
  readonly documents$ = this._documents$.asObservable();

  get documents(): Document[] {
    return this._documents$.value;
  }

  add(doc: Document): void {
    const docs = [...this._documents$.value];
    // Ensure unique id
    const nextId = docs.length ? Math.max(...docs.map(d => d.id)) + 1 : 1;
    const withId = { ...doc, id: doc.id ?? nextId } as Document;
    this._documents$.next([withId, ...docs]);
  }

  update(updated: Document): void {
    const docs = this._documents$.value.map(d => d.id === updated.id ? { ...d, ...updated } : d);
    this._documents$.next(docs);
  }

  delete(id: number): void {
    const docs = this._documents$.value.filter(d => d.id !== id);
    this._documents$.next(docs);
  }

  setInitial(docs: Document[]): void {
    this._documents$.next(docs);
  }

  private createInitialMock(): Document[] {
    return [
      { id: 1, title: 'Annual Report 2023', type: 'PDF', uploadedDate: new Date('2023-01-15'), status: 'Pending', uploadedBy: 'John Doe', department: 'Finance', documentType: 'Annual Report' },
      { id: 2, title: 'Meeting Minutes', type: 'DOCX', uploadedDate: new Date('2023-01-10'), status: 'Approved', uploadedBy: 'Jane Smith', department: 'HR', documentType: 'Minutes' },
      { id: 3, title: 'Budget Q1', type: 'XLSX', uploadedDate: new Date('2023-01-05'), status: 'Rejected', uploadedBy: 'Mike Johnson', department: 'Finance', documentType: 'Budget' },
      { id: 4, title: 'Policy Update', type: 'PDF', uploadedDate: new Date('2023-02-02'), status: 'Approved', uploadedBy: 'Anna Lee', department: 'Legal', documentType: 'Policy' },
      { id: 5, title: 'Onboarding Guide', type: 'DOCX', uploadedDate: new Date('2023-02-10'), status: 'Pending', uploadedBy: 'Chris Green', department: 'HR', documentType: 'Guide' },
      { id: 6, title: 'Sales Forecast', type: 'XLSX', uploadedDate: new Date('2023-02-15'), status: 'In Review', uploadedBy: 'Sam Patel', department: 'Sales', documentType: 'Forecast' },
      { id: 7, title: 'Compliance Checklist', type: 'PDF', uploadedDate: new Date('2023-03-01'), status: 'Approved', uploadedBy: 'Mary Adams', department: 'Compliance', documentType: 'Checklist' },
      { id: 8, title: 'Training Plan', type: 'DOCX', uploadedDate: new Date('2023-03-05'), status: 'Pending', uploadedBy: 'Tom Brown', department: 'L&D', documentType: 'Plan' },
      { id: 9, title: 'IT Inventory', type: 'XLSX', uploadedDate: new Date('2023-03-12'), status: 'Rejected', uploadedBy: 'Ivy Chen', department: 'IT', documentType: 'Inventory' },
      { id: 10, title: 'Marketing Brief', type: 'PDF', uploadedDate: new Date('2023-03-18'), status: 'In Review', uploadedBy: 'Leo Garcia', department: 'Marketing', documentType: 'Brief' },
      { id: 11, title: 'Audit Findings', type: 'PDF', uploadedDate: new Date('2023-03-25'), status: 'Pending', uploadedBy: 'Nina Shah', department: 'Audit', documentType: 'Findings' }
    ];
  }
}
