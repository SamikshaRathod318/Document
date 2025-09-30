import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UtilityBarComponent } from './shared/components/utility-bar/utility-bar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, UtilityBarComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-utility-bar></app-utility-bar>
      <app-navbar></app-navbar>
      <main class="main-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%);
    }
    
    .main-content {
      min-height: calc(100vh - 120px);
      padding: 0;
    }
    
    .content-wrapper {
      max-width: none;
      margin: 0 auto;
      padding: 0.1rem;
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .content-wrapper {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'doc-manager';
}
