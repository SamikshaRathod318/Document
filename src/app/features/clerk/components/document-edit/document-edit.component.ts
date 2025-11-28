import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class DocumentEditComponent implements OnInit {
  editForm!: FormGroup;
  selectedDocument: Document | null = null;
  
  // Mock data - Replace with API call
  mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Annual Report 2023',
      type: 'PDF',
      uploadedDate: new Date('2023-01-15'),
      status: 'Pending',
      uploadedBy: 'John Doe',
      department: 'Finance',
      documentType: 'Annual Report',
      class: 'B'
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
      class: 'B'
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
      class: 'D'
    },
    {
      id: 4,
      title: 'Company Logo',
      type: 'PNG',
      uploadedDate: new Date('2023-02-02'),
      status: 'Pending',
      uploadedBy: 'Sarah Wilson',
      department: 'Marketing',
      documentType: 'Image',
      class: 'A'
    },
    {
      id: 5,
      title: 'Policy Update',
      type: 'PDF',
      uploadedDate: new Date('2023-01-20'),
      status: 'Approved',
      uploadedBy: 'David Brown',
      department: 'HR',
      documentType: 'Policy',
      class: 'D'
    },
    {
      id: 6,
      title: 'Compliance Checklist',
      type: 'DOCX',
      uploadedDate: new Date('2023-01-25'),
      status: 'Approved',
      uploadedBy: 'Emily Davis',
      department: 'Legal',
      documentType: 'Checklist',
      class: 'C'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      department: ['', Validators.required],
      documentType: ['', Validators.required],
      class: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const documentId = parseInt(id, 10);
      this.selectedDocument = this.mockDocuments.find(doc => doc.id === documentId) || null;
      
      if (this.selectedDocument) {
        this.editForm.patchValue({
          title: this.selectedDocument.title,
          type: this.selectedDocument.type,
          department: this.selectedDocument.department,
          documentType: this.selectedDocument.documentType,
          class: this.selectedDocument.class || ''
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/clerk/documents']);
  }

  saveDocument(): void {
    if (this.editForm.valid && this.selectedDocument) {
      // Update the document with form values
      const formValue = this.editForm.value;
      const index = this.mockDocuments.findIndex(d => d.id === this.selectedDocument!.id);
      if (index !== -1) {
        this.mockDocuments[index] = {
          ...this.mockDocuments[index],
          ...formValue
        };
        // Navigate back to documents list after saving
        this.router.navigate(['/clerk/documents']);
      }
    }
  }
}





