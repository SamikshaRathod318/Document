import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export interface Category {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  lastUpdated: Date;
}

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './department.component.html',
  styleUrls: ['./department-attractive.css', './modal-styles.css']
})
export class DepartmentComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchQuery = '';
  // Edit modal state
  isEditOpen = false;
  selectedCategory: Category | null = null;
  editForm = { name: '', description: '' };
  // Create modal state
  isCreateOpen = false;
  createForm: { name: string, description: string } = { name: '', description: '' };
  // Delete modal state
  isDeleteOpen = false;
  deleteTarget: Category | null = null;

  ngOnInit() {
    // TODO: Replace with actual API call
    this.categories = [
      {
        id: '1',
        name: 'Education',
        description: 'Quarterly and annual financial statements',
        documentCount: 24,
        lastUpdated: new Date('2023-10-15')
      },
      {
        id: '2',
        name: 'Accountant',
        description: 'Contracts, agreements, and legal correspondence',
        documentCount: 15,
        lastUpdated: new Date('2023-10-10')
      },
      {
        id: '3',
        name: 'Finance',
        description: 'Company policies and procedures',
        documentCount: 8,
        lastUpdated: new Date('2023-09-28')
      },
      {
        id: '4',
        name: 'Transportation',
        description: 'Client project proposals and documentation',
        documentCount: 12,
        lastUpdated: new Date('2023-10-05')
      }
    ];
    this.filteredCategories = [...this.categories];
  }

  filterCategories() {
    if (!this.searchQuery.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredCategories = this.categories.filter(
      category => category.name.toLowerCase().includes(query) ||
                 category.description.toLowerCase().includes(query)
    );
  }

  viewCategory(category: Category) {
    // TODO: Navigate to category details
    console.log('View category:', category);
  }

  createNewCategory() {
    // Open create department modal
    this.createForm = { name: '', description: '' };
    this.isCreateOpen = true;
  }

  editCategory(category: Category, event: Event) {
    event.stopPropagation();
    // Open edit modal with selected category
    this.selectedCategory = category;
    this.editForm = {
      name: category.name,
      description: category.description
    };
    this.isEditOpen = true;
  }

  closeEdit() {
    this.isEditOpen = false;
    this.selectedCategory = null;
  }

  saveEdit() {
    if (!this.selectedCategory) return;
    // Update the selected category with form values
    this.selectedCategory.name = this.editForm.name.trim();
    this.selectedCategory.description = this.editForm.description.trim();
    // Reflect in filtered list
    this.filterCategories();
    // Close modal
    this.closeEdit();
  }

  closeCreate() {
    this.isCreateOpen = false;
  }

  saveCreate() {
    const name = this.createForm.name.trim();
    const description = this.createForm.description.trim();
    if (!name) {
      // basic validation: require name
      return;
    }
    const newCategory: Category = {
      id: (Date.now()).toString(),
      name,
      description,
      documentCount: 0,
      lastUpdated: new Date()
    };
    this.categories = [newCategory, ...this.categories];
    this.filterCategories();
    this.isCreateOpen = false;
  }

  // Delete handlers
  openDelete(category: Category, event: Event) {
    event.stopPropagation();
    this.deleteTarget = category;
    this.isDeleteOpen = true;
  }

  closeDelete() {
    this.isDeleteOpen = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.categories = this.categories.filter(c => c.id !== id);
    this.filterCategories();
    this.closeDelete();
  }
}
