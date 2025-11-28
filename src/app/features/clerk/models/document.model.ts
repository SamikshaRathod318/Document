export interface Document {
  id: string | number;
  file_url?: string;
  title?: string;
  created_by?: string;
  current_stage?: 'clerk' | 'senior_clerk' | 'accountant' | 'admin' | 'hod';
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'Pending'
    | 'Approved'
    | 'Rejected'
    | 'In Review';
  assigned_to?: string;
  created_at?: string | Date;
  updated_at?: string | Date;

  // Legacy / UI fields for backward compatibility
  description?: string;
  type?: string;
  size?: number;
  uploadedDate?: Date | string;
  uploadedBy?: string;
  department?: string;
  documentType?: string;
  class?: string;
  isConfidential?: boolean;
  effectiveDate?: Date | string;
  fileUrl?: string;
  reviewerComments?: string;
  reviewedBy?: string;
  reviewedDate?: Date;
  rejectedEditCount?: number;
  needsClerkApproval?: boolean;
}
