import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css', './landing-sections.css']
})
export class LandingComponent {
  openFaq: number | null = null;

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }
}
