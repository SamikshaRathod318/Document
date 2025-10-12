import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css', './landing-sections.css']
})
export class LandingComponent implements OnInit {
  openFaq: number | null = null;
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Allow logged-in users to view landing page
    // Remove automatic redirect to dashboard
  }

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }
}
