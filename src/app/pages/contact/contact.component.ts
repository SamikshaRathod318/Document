import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact-attractive.css', './additional-info.css', './form-styles.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  showSuccess = false;
  showError = false;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', [Validators.required]],
      message: ['', [Validators.maxLength(200)]]
    });
  }

  getCharCount(): number {
    return this.contactForm.get('message')?.value?.length || 0;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.isValidFile(file)) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && this.isValidFile(file)) {
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  private isValidFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 25 * 1024 * 1024; // 25MB
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  onSubmit() {
    this.showSuccess = false;
    this.showError = false;
    
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      this.showError = true;
      this.contactForm.markAllAsTouched();
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        this.showError = false;
      }, 3000);
    }
  }
}
