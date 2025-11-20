export interface Document {
  id: number;
  title: string;
  description?: string;
  type: string;
  size?: number;
  uploadedDate: Date;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  uploadedBy: string;
  department: string;
  documentType: string;
  class?: string;
  isConfidential?: boolean;
  fileUrl?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedDate?: Date;
  rejectedEditCount?: number;
}
