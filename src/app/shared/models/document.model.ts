export interface Document {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  uploadedBy: string;
  uploadedAt: Date;
  department: string;
  documentType: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  isConfidential: boolean;
  tags?: string[];
  version?: number;
  metadata?: {
    pages?: number;
    author?: string;
    created?: Date;
    modified?: Date;
  };
}
