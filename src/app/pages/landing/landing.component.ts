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
  selectedCaseStudy: any = null;
  private authService = inject(AuthService);
  private router = inject(Router);

  caseStudies = [
    {
      title: 'Government Office',
      summary: 'Streamlined document processing by 60% with our digital solution.',
      details: {
        client: 'Municipal Corporation of Mumbai',
        duration: '6 months',
        challenge: 'Manual document processing was taking 8-10 hours per day, causing delays in citizen services.',
        solution: 'Implemented automated document workflow with digital signatures and real-time tracking.',
        results: ['60% reduction in processing time', '95% accuracy in document handling', '40% cost savings', 'Improved citizen satisfaction by 80%'],
        technologies: ['Angular', 'Node.js', 'MongoDB', 'Digital Signature API']
      }
    },
    {
      title: 'Corporate Enterprise',
      summary: 'Reduced document retrieval time from hours to minutes.',
      details: {
        client: 'TechCorp Solutions Pvt Ltd',
        duration: '4 months',
        challenge: 'Employees spent 2-3 hours daily searching for documents across multiple systems.',
        solution: 'Centralized document repository with AI-powered search and smart categorization.',
        results: ['Document retrieval time reduced to 2-3 minutes', '70% increase in productivity', 'Zero document loss incidents', '50% reduction in storage costs'],
        technologies: ['React', 'Elasticsearch', 'AWS S3', 'Machine Learning']
      }
    },
    {
      title: 'Healthcare System',
      summary: 'Improved patient record management and compliance by 75%.',
      details: {
        client: 'Apollo Hospitals Network',
        duration: '8 months',
        challenge: 'Patient records were scattered across departments, causing compliance issues.',
        solution: 'Integrated patient record system with HIPAA compliance and audit trails.',
        results: ['75% improvement in compliance scores', '90% faster patient data access', 'Zero data breach incidents', '60% reduction in administrative work'],
        technologies: ['Vue.js', 'PostgreSQL', 'Blockchain', 'HIPAA Compliance Tools']
      }
    },
    {
      title: 'Educational Institute',
      summary: 'Digitized student records and reduced paperwork by 80%.',
      details: {
        client: 'University of Mumbai',
        duration: '5 months',
        challenge: 'Managing 50,000+ student records manually was error-prone and time-consuming.',
        solution: 'Digital student information system with automated workflows and parent portals.',
        results: ['80% reduction in paperwork', '95% accuracy in record keeping', '50% faster admission process', 'Enhanced parent-teacher communication'],
        technologies: ['Angular', 'MySQL', 'Firebase', 'Mobile App Integration']
      }
    },
    {
      title: 'Financial Services',
      summary: 'Enhanced security and audit trails for sensitive documents.',
      details: {
        client: 'HDFC Bank Limited',
        duration: '7 months',
        challenge: 'Regulatory compliance required detailed audit trails for all financial documents.',
        solution: 'Secure document management with blockchain-based audit trails and encryption.',
        results: ['100% regulatory compliance achieved', '99.9% document security', '80% faster audit processes', 'Zero compliance violations'],
        technologies: ['React', 'Blockchain', 'Advanced Encryption', 'Audit Management System']
      }
    },
    {
      title: 'Manufacturing Company',
      summary: 'Centralized quality control documents and improved efficiency.',
      details: {
        client: 'Tata Steel Limited',
        duration: '6 months',
        challenge: 'Quality control documents were spread across multiple locations and formats.',
        solution: 'Centralized QC document system with real-time collaboration and version control.',
        results: ['65% improvement in QC efficiency', '90% reduction in document errors', '45% faster product approvals', 'Enhanced team collaboration'],
        technologies: ['Angular', 'Oracle Database', 'Real-time Sync', 'Version Control System']
      }
    }
  ];

  ngOnInit() {
    // Allow logged-in users to view landing page
    // Remove automatic redirect to dashboard
  }

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }

  showCaseStudyDetails(caseStudy: any) {
    this.selectedCaseStudy = caseStudy;
  }

  closeCaseStudyModal() {
    this.selectedCaseStudy = null;
  }
}
