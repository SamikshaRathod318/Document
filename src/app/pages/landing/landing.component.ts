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
  currentSlideIndex = 1;
  showDMSInfo = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  dmsInformation = {
    overview: {
      title: 'Document Management System Overview',
      description: 'A Document Management System (DMS) is a software solution that helps organizations capture, store, manage, and track electronic documents and images of paper-based information.',
      keyBenefits: [
        'Centralized document storage and organization',
        'Enhanced security and access control',
        'Improved collaboration and workflow efficiency',
        'Regulatory compliance and audit trails',
        'Cost reduction and space optimization',
        'Disaster recovery and backup capabilities'
      ]
    },
    coreFeatures: [
      {
        category: 'Document Capture & Storage',
        features: [
          'Optical Character Recognition (OCR)',
          'Batch scanning and indexing',
          'Multiple file format support',
          'Cloud and on-premise storage options',
          'Automated document classification'
        ]
      },
      {
        category: 'Security & Access Control',
        features: [
          'Role-based access permissions',
          'Document encryption and digital signatures',
          'Audit trails and activity logging',
          'Multi-factor authentication',
          'Data loss prevention (DLP)'
        ]
      },
      {
        category: 'Search & Retrieval',
        features: [
          'Full-text search capabilities',
          'Advanced filtering and sorting',
          'Metadata-based search',
          'AI-powered content discovery',
          'Quick preview and thumbnail views'
        ]
      },
      {
        category: 'Workflow & Collaboration',
        features: [
          'Automated workflow routing',
          'Document approval processes',
          'Real-time collaboration tools',
          'Version control and check-in/check-out',
          'Task assignment and notifications'
        ]
      }
    ],
    implementationTypes: [
      {
        type: 'Cloud-Based DMS',
        description: 'Hosted on cloud infrastructure, offering scalability and remote access',
        advantages: ['Lower upfront costs', 'Automatic updates', 'Global accessibility', 'Scalable storage'],
        bestFor: 'Small to medium businesses, remote teams'
      },
      {
        type: 'On-Premise DMS',
        description: 'Installed and maintained on organization\'s own servers',
        advantages: ['Complete data control', 'Customization flexibility', 'Enhanced security', 'No internet dependency'],
        bestFor: 'Large enterprises, highly regulated industries'
      },
      {
        type: 'Hybrid DMS',
        description: 'Combination of cloud and on-premise solutions',
        advantages: ['Flexible deployment', 'Cost optimization', 'Risk distribution', 'Gradual migration'],
        bestFor: 'Organizations transitioning to cloud'
      }
    ],
    industryApplications: [
      {
        industry: 'Government & Public Sector',
        applications: ['Citizen service documents', 'Policy management', 'Regulatory compliance', 'Inter-department collaboration'],
        challenges: ['High security requirements', 'Transparency needs', 'Large document volumes', 'Multiple stakeholders']
      },
      {
        industry: 'Healthcare',
        applications: ['Patient records', 'Medical imaging', 'Insurance claims', 'Regulatory documentation'],
        challenges: ['HIPAA compliance', 'Patient privacy', 'Integration with EMR', 'Mobile access needs']
      },
      {
        industry: 'Financial Services',
        applications: ['Loan documentation', 'Customer records', 'Compliance reports', 'Audit trails'],
        challenges: ['Regulatory compliance', 'Data security', 'Real-time processing', 'Risk management']
      },
      {
        industry: 'Legal',
        applications: ['Case files', 'Contracts', 'Legal research', 'Client communications'],
        challenges: ['Confidentiality', 'Version control', 'Collaboration', 'Time tracking']
      },
      {
        industry: 'Education',
        applications: ['Student records', 'Academic documents', 'Research papers', 'Administrative files'],
        challenges: ['Student privacy', 'Multi-user access', 'Long-term retention', 'Budget constraints']
      }
    ],
    bestPractices: [
      {
        category: 'Planning & Strategy',
        practices: [
          'Define clear document management policies',
          'Conduct thorough needs assessment',
          'Establish document retention schedules',
          'Plan for user training and adoption'
        ]
      },
      {
        category: 'Implementation',
        practices: [
          'Start with pilot projects',
          'Ensure proper data migration',
          'Implement robust backup strategies',
          'Test disaster recovery procedures'
        ]
      },
      {
        category: 'Ongoing Management',
        practices: [
          'Regular system maintenance and updates',
          'Monitor user adoption and feedback',
          'Conduct periodic security audits',
          'Optimize storage and performance'
        ]
      }
    ],
    roi: {
      title: 'Return on Investment (ROI)',
      metrics: [
        'Time savings: 30-50% reduction in document retrieval time',
        'Cost reduction: 25-40% decrease in paper and storage costs',
        'Productivity: 20-35% improvement in workflow efficiency',
        'Compliance: 90%+ improvement in audit readiness',
        'Security: 95%+ reduction in document loss incidents'
      ],
      paybackPeriod: '6-18 months depending on organization size and complexity'
    }
  };

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

  showDMSInformation() {
    this.showDMSInfo = true;
  }

  closeDMSInfo() {
    this.showDMSInfo = false;
  }

  currentSlide(n: number) {
    this.showSlide(this.currentSlideIndex = n);
  }

  showSlide(n: number) {
    const slides = document.getElementsByClassName('hero-img') as HTMLCollectionOf<HTMLElement>;
    const dots = document.getElementsByClassName('dot') as HTMLCollectionOf<HTMLElement>;
    
    if (n > slides.length) { this.currentSlideIndex = 1; }
    if (n < 1) { this.currentSlideIndex = slides.length; }
    
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.remove('active');
    }
    
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove('active');
    }
    
    if (slides[this.currentSlideIndex - 1]) {
      slides[this.currentSlideIndex - 1].classList.add('active');
    }
    
    if (dots[this.currentSlideIndex - 1]) {
      dots[this.currentSlideIndex - 1].classList.add('active');
    }
  }
}
