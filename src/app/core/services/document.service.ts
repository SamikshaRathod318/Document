import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Document } from '../../features/clerk/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private supabase = inject(SupabaseService);
  private metadataColumnsAvailable = true;
  private metadataSupportChecked = false;
  private metadataSupportCheckPromise: Promise<void> | null = null;
  private readonly metadataColumnKeys = [
    'department',
    'description',
    'is_confidential',
    'effective_date'
  ] as const;

  /**
   * Create a new document in the database
   */
  async createDocument(document: Partial<Document>): Promise<Document> {
    await this.ensureMetadataSupportKnown();

    const insertData = this.buildInsertPayload(document, this.metadataColumnsAvailable);
    const firstAttempt = await this.supabase.getClient()
      .from('documents')
      .insert(insertData)
      .select()
      .single();

    if (firstAttempt.error && this.shouldRetryWithoutMetadata(firstAttempt.error)) {
      console.warn(
        '[DocumentService] Metadata columns missing in database. Retrying insert without metadata fields.'
      );
      this.metadataColumnsAvailable = false;
      const fallbackPayload = this.buildInsertPayload(document, false);
      const retry = await this.supabase.getClient()
        .from('documents')
        .insert(fallbackPayload)
        .select()
        .single();

      if (retry.error) {
        console.error('Error creating document after metadata fallback:', retry.error);
        throw new Error(retry.error.message || 'Failed to create document');
      }

      this.setMetadataSupportState(false);
      return this.hydrateMissingMetadata(this.mapDatabaseDocument(retry.data), document);
    }

    if (firstAttempt.error) {
      console.error('Error creating document:', firstAttempt.error);
      throw new Error(firstAttempt.error.message || 'Failed to create document');
    }

    this.setMetadataSupportState(this.metadataColumnsAvailable);
    return this.mapDatabaseDocument(firstAttempt.data);
  }

  /**
   * Get all documents
   */
  async getDocuments(): Promise<Document[]> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return (data || []).map(doc => this.mapDatabaseDocument(doc));
  }

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Document not found
      }
      console.error('Error fetching document:', error);
      throw new Error(error.message || 'Failed to fetch document');
    }

    return data ? this.mapDatabaseDocument(data) : null;
  }

  /**
   * Update a document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    await this.ensureMetadataSupportKnown();
    const updateData = this.buildUpdatePayload(updates, this.metadataColumnsAvailable);

    const firstAttempt = await this.supabase.getClient()
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (firstAttempt.error && this.shouldRetryWithoutMetadata(firstAttempt.error)) {
      console.warn(
        '[DocumentService] Metadata columns missing in database. Retrying update without metadata fields.'
      );
      this.metadataColumnsAvailable = false;
      const fallbackPayload = this.buildUpdatePayload(updates, false);
      const retry = await this.supabase.getClient()
        .from('documents')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single();

      if (retry.error) {
        console.error('Error updating document after metadata fallback:', retry.error);
        throw new Error(retry.error.message || 'Failed to update document');
      }

      this.setMetadataSupportState(false);
      return this.hydrateMissingMetadata(this.mapDatabaseDocument(retry.data), updates);
    }

    if (firstAttempt.error) {
      console.error('Error updating document:', firstAttempt.error);
      throw new Error(firstAttempt.error.message || 'Failed to update document');
    }

    this.setMetadataSupportState(this.metadataColumnsAvailable);
    return this.mapDatabaseDocument(firstAttempt.data);
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const { error } = await this.supabase.getClient()
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw new Error(error.message || 'Failed to delete document');
    }
  }

  /**
   * Get documents by current stage
   */
  async getDocumentsByStage(stage: Document['current_stage']): Promise<Document[]> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .eq('current_stage', stage)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by stage:', error);
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return (data || []).map(doc => this.mapDatabaseDocument(doc));
  }

  /**
   * Get documents by status
   */
  async getDocumentsByStatus(status: Document['status']): Promise<Document[]> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by status:', error);
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return (data || []).map(doc => this.mapDatabaseDocument(doc));
  }

  /**
   * Get documents assigned to a specific user
   */
  async getDocumentsAssignedTo(userId: string): Promise<Document[]> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned documents:', error);
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return (data || []).map(doc => this.mapDatabaseDocument(doc));
  }

  /**
   * Get documents created by a specific user
   */
  async getDocumentsCreatedBy(userId: string): Promise<Document[]> {
    await this.ensureMetadataSupportKnown();
    const { data, error } = await this.supabase.getClient()
      .from('documents')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user documents:', error);
      throw new Error(error.message || 'Failed to fetch documents');
    }

    return (data || []).map(doc => this.mapDatabaseDocument(doc));
  }

  /**
   * Move document to next stage in workflow
   */
  async moveToNextStage(id: string): Promise<Document> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    const stageOrder: Document['current_stage'][] = ['clerk', 'senior_clerk', 'accountant', 'admin', 'hod'];
    const currentIndex = stageOrder.indexOf(document.current_stage);
    
    if (currentIndex < stageOrder.length - 1) {
      return await this.updateDocument(id, {
        current_stage: stageOrder[currentIndex + 1]
      });
    } else {
      // Already at final stage, mark as completed
      return await this.updateDocument(id, {
        status: 'completed'
      });
    }
  }

  /**
   * Approve document and move to next stage in workflow
   */
  async approveAndMoveToNextStage(id: string, reviewerRole: string): Promise<Document> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    const stageOrder: Document['current_stage'][] = ['clerk', 'senior_clerk', 'accountant', 'admin', 'hod'];
    const currentIndex = stageOrder.indexOf(document.current_stage || 'clerk');
    
    // Map reviewer role to stage for validation
    const roleToStage: Record<string, Document['current_stage']> = {
      'Clerk': 'clerk',
      'Senior Clerk': 'senior_clerk',
      'Accountant': 'accountant',
      'HOD': 'hod',
      'Admin': 'admin'
    };

    const reviewerStage = roleToStage[reviewerRole];
    if (reviewerStage && document.current_stage !== reviewerStage) {
      throw new Error(`Document is not at ${reviewerRole} stage`);
    }

    // If at HOD stage, mark as approved (final stage)
    if (currentIndex === stageOrder.length - 1 || document.current_stage === 'hod') {
      return await this.updateDocument(id, {
        status: 'approved',
        reviewedBy: reviewerRole,
        reviewedDate: new Date()
      });
    }

    // Move to next stage
    if (currentIndex < stageOrder.length - 1) {
      return await this.updateDocument(id, {
        current_stage: stageOrder[currentIndex + 1],
        reviewedBy: reviewerRole,
        reviewedDate: new Date()
      });
    }

    // Fallback: mark as approved
    return await this.updateDocument(id, {
      status: 'approved',
      reviewedBy: reviewerRole,
      reviewedDate: new Date()
    });
  }

  /**
   * Map database document to application Document model
   */
  private mapDatabaseDocument(dbDoc: any): Document {
    return {
      id: dbDoc.id,
      file_url: dbDoc.file_url,
      title: dbDoc.title,
      created_by: dbDoc.created_by,
      current_stage: dbDoc.current_stage,
      status: dbDoc.status,
      assigned_to: dbDoc.assigned_to,
      created_at: dbDoc.created_at,
      updated_at: dbDoc.updated_at,
      // Map file_url to fileUrl for backward compatibility
      fileUrl: dbDoc.file_url,
      // Map created_at to uploadedDate for backward compatibility
      uploadedDate: dbDoc.created_at ? new Date(dbDoc.created_at) : new Date(),
      documentType: dbDoc.document_type,
      class: dbDoc.class,
      department: dbDoc.department,
      description: dbDoc.description,
      isConfidential: dbDoc.is_confidential,
      effectiveDate: dbDoc.effective_date
    };
  }

  private shouldRetryWithoutMetadata(error: { code?: string; message?: string } | null): boolean {
    if (!error) {
      return false;
    }
    if (error.code === 'PGRST204') {
      return true;
    }

    const message = (error.message || '').toLowerCase();
    if (!message) return false;
    return (
      message.includes('schema cache') &&
      this.metadataColumnKeys.some(key => message.includes(`'${key.replace('_', ' ')}'`))
    );
  }

  private buildInsertPayload(document: Partial<Document>, includeMetadata: boolean): Record<string, any> {
    const normalizedDocumentType = this.normalizeDocumentTypeValue(document.documentType, document.type);
    const normalizedClass = this.normalizeClassValue(document.class);

    const payload: Record<string, any> = {
      file_url: document.file_url || document.fileUrl || '',
      title: document.title || '',
      // NOTE: created_by temporarily omitted to avoid FK conflicts.
      // Once users table and IDs are aligned with this value, re-enable it.
      // created_by: document.created_by,
      current_stage: document.current_stage || 'clerk',
      status: document.status || 'pending',
      assigned_to: document.assigned_to || null,
      document_type: normalizedDocumentType,
      class: normalizedClass
    };

    if (includeMetadata) {
      payload['department'] = document.department ?? null;
      payload['description'] = document.description ?? null;
      payload['is_confidential'] = document.isConfidential ?? false;
      payload['effective_date'] =
        document.effectiveDate instanceof Date ? document.effectiveDate.toISOString() : document.effectiveDate ?? null;
    }

    return payload;
  }

  private buildUpdatePayload(updates: Partial<Document>, includeMetadata: boolean): Record<string, any> {
    const payload: Record<string, any> = {};
    if (updates.file_url !== undefined) payload['file_url'] = updates.file_url;
    if (updates.fileUrl !== undefined) payload['file_url'] = updates.fileUrl;
    if (updates.title !== undefined) payload['title'] = updates.title;
    if (updates.current_stage !== undefined) payload['current_stage'] = updates.current_stage;
    if (updates.status !== undefined) payload['status'] = updates.status;
    if (updates.assigned_to !== undefined) payload['assigned_to'] = updates.assigned_to;

    if (updates.documentType !== undefined || updates.type !== undefined) {
      payload['document_type'] = this.normalizeDocumentTypeValue(updates.documentType, updates.type);
    }
    if (updates.class !== undefined) {
      payload['class'] = this.normalizeClassValue(updates.class);
    }

    if (includeMetadata) {
      if (updates.department !== undefined) payload['department'] = updates.department;
      if (updates.description !== undefined) payload['description'] = updates.description;
      if (updates.isConfidential !== undefined) payload['is_confidential'] = updates.isConfidential;
      if (updates.effectiveDate !== undefined) {
        payload['effective_date'] =
          updates.effectiveDate instanceof Date
            ? updates.effectiveDate.toISOString()
            : (updates.effectiveDate as string | null);
      }
    }

    return payload;
  }

  private hydrateMissingMetadata(doc: Document, source: Partial<Document>): Document {
    return {
      ...doc,
      documentType: doc.documentType ?? source.documentType,
      class: doc.class ?? source.class,
      department: doc.department ?? source.department,
      description: doc.description ?? source.description,
      isConfidential: doc.isConfidential ?? source.isConfidential,
      effectiveDate: doc.effectiveDate ?? source.effectiveDate
    };
  }

  private async ensureMetadataSupportKnown(): Promise<void> {
    if (this.metadataSupportChecked) {
      return;
    }
    if (this.metadataSupportCheckPromise) {
      return this.metadataSupportCheckPromise;
    }

    this.metadataSupportCheckPromise = (async () => {
      try {
        const { data, error } = await this.supabase.getClient()
          .rpc('fn_documents_metadata_supported');

        if (error) {
          this.handleMetadataProbeFailure(error);
          return;
        }

        if (typeof data === 'boolean') {
          this.setMetadataSupportState(data);
        } else {
          // Unknown response shape, assume whatever our current default is but
          // avoid probing again.
          this.metadataSupportChecked = true;
        }
      } catch (probeError) {
        this.handleMetadataProbeFailure(probeError);
      } finally {
        this.metadataSupportCheckPromise = null;
      }
    })();

    return this.metadataSupportCheckPromise;
  }

  private setMetadataSupportState(isSupported: boolean): void {
    this.metadataColumnsAvailable = isSupported;
    this.metadataSupportChecked = true;
  }

  private handleMetadataProbeFailure(error: any): void {
    console.warn('[DocumentService] Metadata support probe failed:', error);
    if (this.isMetadataProbeFunctionMissing(error)) {
      // Assume metadata columns exist (default true) but skip future RPC calls
      // to avoid spamming the API when the helper function has not been deployed yet.
      this.metadataSupportChecked = true;
    }
  }

  private isMetadataProbeFunctionMissing(error: { code?: string; message?: string } | null): boolean {
    if (!error) {
      return false;
    }
    if (error.code === 'PGRST202') {
      return true;
    }
    const message = (error.message || '').toLowerCase();
    if (!message) {
      return false;
    }
    return message.includes('fn_documents_metadata_supported') && message.includes('function');
  }

  private normalizeClassValue(rawClass: string | null | undefined): string | null {
    if (!rawClass) {
      return 'general';
    }
    const normalized = rawClass.toString().trim().toLowerCase();
    const map: Record<string, string> = {
      a: 'confidential',
      confidential: 'confidential',
      b: 'general',
      general: 'general',
      c: 'urgent',
      urgent: 'urgent'
    };
    return map[normalized] || 'general';
  }

  private normalizeDocumentTypeValue(
    preferred: string | null | undefined,
    fallback?: string | null
  ): string | null {
    const value = preferred ?? fallback ?? '';
    if (!value) {
      return 'others';
    }
    const normalized = value.toString().trim().toLowerCase();
    if (['pdf', 'image', 'excel', 'word', 'others'].includes(normalized)) {
      return normalized;
    }
    if (normalized.includes('pdf')) return 'pdf';
    if (normalized.includes('xls') || normalized.includes('sheet')) return 'excel';
    if (normalized.includes('doc')) return 'word';
    if (normalized.startsWith('image') || normalized.includes('png') || normalized.includes('jpg') || normalized.includes('jpeg')) {
      return 'image';
    }
    return 'others';
  }
}