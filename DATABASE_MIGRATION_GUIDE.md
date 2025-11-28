# Database Migration Guide

## Overview
This document describes the database integration for the Document Management System. All documents are now stored in a PostgreSQL database (via Supabase) instead of local storage.

## Database Schema

### Documents Table
The `documents` table has been created with the following structure:

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  title text,
  created_by text,
  current_stage text not null default 'clerk'
    check (current_stage in ('clerk', 'senior_clerk', 'accountant', 'admin', 'hod')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),
  assigned_to text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

## Workflow Stages

The document workflow follows these stages:
1. **clerk** - Initial stage when document is uploaded
2. **senior_clerk** - Senior clerk review
3. **accountant** - Accountant review
4. **admin** - Admin review
5. **hod** - Head of Department final review

## Status Values

Documents can have the following statuses:
- **pending** - Awaiting review
- **approved** - Approved by reviewer
- **rejected** - Rejected by reviewer
- **completed** - Workflow completed

## Setup Instructions

### 1. Run the Migration
Execute the SQL migration file in your Supabase SQL editor:
```
migrations/001_create_documents_table.sql
```

### 2. Configure Foreign Keys
The migration file includes commented instructions for setting up foreign keys. Choose one:

**Option A: Using Supabase Auth (auth.users)**
```sql
alter table documents add constraint fk_documents_created_by 
  foreign key (created_by) references auth.users(id) on delete cascade;
alter table documents add constraint fk_documents_assigned_to 
  foreign key (assigned_to) references auth.users(id) on delete cascade;
```

**Option B: Using Custom Users Table**
If your users table uses integer IDs:
```sql
alter table documents alter column created_by type integer using created_by::integer;
alter table documents alter column assigned_to type integer using assigned_to::integer;
alter table documents add constraint fk_documents_created_by 
  foreign key (created_by) references users(id) on delete cascade;
alter table documents add constraint fk_documents_assigned_to 
  foreign key (assigned_to) references users(id) on delete cascade;
```

## Changes Made

### 1. Document Model
- Updated to match new database schema
- `id` is now a UUID string
- Added `current_stage` and `status` fields with proper types
- Maintains backward compatibility with legacy fields

### 2. Document Service
- Now uses Supabase directly instead of API service
- Methods for CRUD operations
- Methods for workflow management (getDocumentsByStage, moveToNextStage)
- Methods for filtering (getDocumentsByStatus, getDocumentsAssignedTo)

### 3. Document Upload Component
- Saves documents directly to database
- Sets `created_by` to current user ID
- Sets `current_stage` to 'clerk' for new documents
- Sets `status` to 'pending' for new documents

### 4. Document List Component
- Fetches documents from database
- Updated status filtering to use new status values
- Updated workflow display to use `current_stage`

### 5. Document View Component
- Fetches document from database by ID
- Updated status display logic

## Usage

### Creating a Document
When a user uploads a document:
1. File is converted to base64 and stored in `file_url`
2. Document is created with `current_stage = 'clerk'` and `status = 'pending'`
3. `created_by` is set to the current user's ID

### Moving Through Workflow
Use the `moveToNextStage()` method in DocumentService to advance documents:
```typescript
await documentService.moveToNextStage(documentId);
```

### Filtering Documents
```typescript
// Get documents by stage
const clerkDocs = await documentService.getDocumentsByStage('clerk');

// Get documents by status
const pendingDocs = await documentService.getDocumentsByStatus('pending');

// Get documents assigned to a user
const myDocs = await documentService.getDocumentsAssignedTo(userId);
```

## Migration from Local Storage

If you have existing documents in local storage, you'll need to:
1. Export them from local storage
2. Import them into the database using the DocumentService
3. Map old status values to new ones:
   - 'Pending' → 'pending'
   - 'Approved' → 'approved'
   - 'Rejected' → 'rejected'
   - 'In Review' → 'pending' (and set appropriate current_stage)

## Notes

- All file URLs are stored as base64 data URLs in the `file_url` field
- The `title` field is optional but recommended
- The `created_by` and `assigned_to` fields should contain user IDs (UUIDs or integers depending on your setup)
- The `updated_at` field is automatically updated via database trigger

