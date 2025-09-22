import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>Contact Us</h1>
      <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" formControlName="name" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" formControlName="email" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" formControlName="message" rows="5" class="form-control"></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary" [disabled]="!contactForm.valid">
          Send Message
        </button>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      color: var(--primary-color);
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      font-weight: 500;
      color: var(--text-color);
    }
    
    .form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      font-size: 1rem;
      transition: var(--transition);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    textarea.form-control {
      min-height: 150px;
      resize: vertical;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      align-self: flex-start;
    }
    
    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: var(--secondary-color);
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', this.contactForm.value);
      alert('Thank you for your message! We will get back to you soon.');
      this.contactForm.reset();
    }
  }
}
