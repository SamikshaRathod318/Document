import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="document-view-container">
      <h2>{{ 'Documents' | translate }}</h2>
      
      <div class="form-container">
        <form class="document-form">
          <div class="form-group">
            <label for="title">{{ 'Document Title' | translate }}</label>
            <input type="text" id="title" class="form-control" placeholder="{{ 'Enter document title' | translate }}">
          </div>
          
          <div class="form-group">
            <label for="description">{{ 'Description' | translate }}</label>
            <textarea id="description" class="form-control" rows="4" placeholder="{{ 'Enter description' | translate }}"></textarea>
          </div>
          
          <div class="form-group">
            <label for="department">{{ 'Department' | translate }}</label>
            <select id="department" class="form-control">
              <option value="">{{ 'Select Department' | translate }}</option>
              <option value="admin">Administration</option>
              <option value="water">Water</option>
              <option value="account">Account</option>
              <option value="property">Property</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="file">{{ 'Upload Document' | translate }}</label>
            <input type="file" id="file" class="form-control">
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ 'Save Document' | translate }}</button>
            <button type="button" class="btn btn-secondary">{{ 'Cancel' | translate }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .document-view-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class DocumentViewComponent { }