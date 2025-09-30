import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-utility-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './utility-bar.component.html',
  styleUrls: ['./utility-bar.component.css']
})
export class UtilityBarComponent {
  private authService = inject(AuthService);
  
  currentUser$ = this.authService.currentUser$;
  currentLanguage = 'English';
  fontSize = 16;
  showLanguageDropdown = false;
  isHidden = false;
  private lastScrollTop = 0;

  constructor() {
    this.handleScroll();
  }

  private handleScroll() {
    // Utility bar always visible - no hiding logic
  }

  decreaseFontSize() {
    this.fontSize = Math.max(12, this.fontSize - 2);
    document.documentElement.style.fontSize = this.fontSize + 'px';
  }

  resetFontSize() {
    this.fontSize = 16;
    document.documentElement.style.fontSize = this.fontSize + 'px';
  }

  increaseFontSize() {
    this.fontSize = Math.min(24, this.fontSize + 2);
    document.documentElement.style.fontSize = this.fontSize + 'px';
  }

  toggleLanguageDropdown() {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  selectLanguage(language: string) {
    this.currentLanguage = language;
    this.showLanguageDropdown = false;
  }
}