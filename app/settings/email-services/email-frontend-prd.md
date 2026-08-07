# Prime Laboratory System (PLS)
# Email Module Frontend PRD

Version: 1.0  
Status: Ready for Frontend Implementation  
Audience: Frontend Engineers, UI/UX Designers, QA Engineers, Product Team

---

## 1. Purpose

This document defines the frontend requirements for the Email Module in PLS.

The backend APIs are already available. This PRD explains exactly what the frontend should build so the team can deliver a complete Email Management UI for:

- Template management
- Provider management
- Settings management
- Queue operations
- Logs monitoring

---

## 2. Goals

The frontend must allow authorized users to:

- Create and manage reusable email templates
- Configure and test SMTP providers
- Configure email retry and attachment settings
- Queue transactional/operational emails
- Process pending emails and retry failed items
- Monitor send history and outcomes

---

## 3. Current Backend Scope (Important)

The currently implemented backend supports:

- Provider type: smtp only
- Template rendering with variable placeholders like {{PatientName}}
- Queue states:
  - pending
  - processing
  - sent
  - failed
  - cancelled
  - scheduled

The frontend should be built in a way that can later support additional providers (SendGrid, SES, etc.), but the first release should expose SMTP workflows only.

---

## 4. Tenant Requirement

All requests must include tenant context using query parameter:

- tenantId
or
- tenant

Recommended frontend behavior:

- Keep active tenant ID in global state (session/auth store)
- Automatically append tenantId on every Email API request

---

## 5. Information Architecture

Create an Email section in app navigation:

- Email
  - Templates
  - Providers
  - Settings
  - Queue
  - Logs

---

## 6. Feature Requirements by Screen

## 6.1 Templates Screen

### 6.1.1 List Templates

Endpoint:

- GET /api/v1/email/templates

Display columns:

- Name
- Category
- Subject
- Status
- Created At
- Updated At
- Actions

Actions:

- View
- Edit
- Delete
- Preview
- Duplicate (frontend convenience action that pre-fills create form)

### 6.1.2 Create Template

Endpoint:

- POST /api/v1/email/templates

Form fields:

- name (required, max 150)
- category (required, enum)
  - authentication
  - patient
  - clinician
  - organization
  - internal
  - marketing
- subject (required, max 255)
- htmlBody (required)
- plainTextBody (optional)
- variables (optional array of strings)
- status (optional, default active)
  - active
  - archived
- createdBy (optional numeric)

UX rules:

- HTML body should support rich text editor
- Include variable helper chips for insert
- Validate before submit

### 6.1.3 Update Template

Endpoint:

- PUT /api/v1/email/templates/:id

Behavior:

- Partial updates allowed
- Keep save button disabled if no changes

### 6.1.4 Delete Template

Endpoint:

- DELETE /api/v1/email/templates/:id

Behavior:

- Show confirmation modal
- Warn user if template is still used in workflow (future enhancement)

### 6.1.5 Preview Template

Endpoint:

- POST /api/v1/email/templates/:id/preview

Payload:

{
  "variables": {
    "PatientName": "John Doe",
    "InvoiceNumber": "INV-0092"
  }
}

Display:

- Rendered subject
- Rendered HTML preview panel
- Rendered plain text panel

---

## 6.2 Providers Screen

### 6.2.1 List Providers

Endpoint:

- GET /api/v1/email/providers

Columns:

- Name
- Provider Type
- Host
- Port
- From Email
- Default
- Active
- Actions

### 6.2.2 Create Provider

Endpoint:

- POST /api/v1/email/providers

Fields:

- name (required)
- providerType (required, currently only smtp)
- host (required)
- port (required positive integer)
- secure (optional boolean)
- username (required)
- password (required)
- fromEmail (required, email format)
- fromName (required)
- isDefault (optional boolean)
- isActive (optional boolean)
- createdBy (optional numeric)

Security UX:

- Password field masked
- Show/Hide toggle
- Never display plain password in table

### 6.2.3 Update Provider

Endpoint:

- PUT /api/v1/email/providers/:id

### 6.2.4 Delete Provider

Endpoint:

- DELETE /api/v1/email/providers/:id

### 6.2.5 Test Provider Connection

Endpoint:

- POST /api/v1/email/providers/:id/test

Behavior:

- Button: Test Connection
- Show loading state while testing
- Show success or detailed failure message

---

## 6.3 Settings Screen

### 6.3.1 Get Settings

Endpoint:

- GET /api/v1/email/settings

### 6.3.2 Update Settings

Endpoint:

- PUT /api/v1/email/settings

Fields:

- defaultProviderId (optional nullable number)
- maxAttachmentSizeMb (optional positive number)
- maxRetries (optional integer 0 to 10)
- retryBackoffMinutes (optional integer array, each 1 to 1440, max 10 items)
- allowMarketingEmails (optional boolean)
- updatedBy (optional numeric)

UX notes:

- Render retryBackoffMinutes as dynamic list input
- Example default values to show users:
  - maxRetries: 3
  - retryBackoffMinutes: [2, 10, 30]

---

## 6.4 Queue Screen

### 6.4.1 List Queue Items

Endpoint:

- GET /api/v1/email/queue

Query:

- limit (optional, default 50)

Columns:

- Queue ID
- Status
- Priority
- Subject
- Recipients count
- Scheduled At
- Retry Count
- Created At
- Actions

Actions:

- Process Now
- Retry
- View Payload

### 6.4.2 Queue New Email

Endpoint:

- POST /api/v1/email/queue

Payload fields:

- templateId (optional)
- providerId (optional)
- to (required array, min 1)
- cc (optional array)
- bcc (optional array)
- subject (optional if templateId is provided)
- htmlBody (optional if templateId is provided)
- plainTextBody (optional)
- variables (optional key-value map)
- attachments (optional array)
  - filename (required)
  - path (required)
  - contentType (optional)
  - size (optional)
- scheduledAt (optional ISO datetime)
- priority (optional)
  - low
  - normal
  - high
- referenceType (optional)
- referenceId (optional)
- createdBy (optional)

Validation rule:

- If templateId is not provided, subject and htmlBody must be provided

### 6.4.3 Process Queue Batch

Endpoint:

- POST /api/v1/email/queue/process

Query:

- limit (optional, default 20)

Behavior:

- Button: Process Pending Emails
- Show summary of processed items and outcomes

### 6.4.4 Process Single Item

Endpoint:

- POST /api/v1/email/queue/:id/process

### 6.4.5 Retry Item

Endpoint:

- POST /api/v1/email/queue/:id/retry

Payload:

{
  "forceImmediate": true
}

---

## 6.5 Logs Screen

Endpoint:

- GET /api/v1/email/logs

Query:

- limit (optional, default 100)

Columns:

- Log ID
- Queue ID
- Status
- Subject
- Provider ID
- Failure Reason
- Duration (ms)
- Created At

Add a log details drawer that shows:

- Full recipient JSON
- Response payload JSON
- Error details

---

## 7. API Response Shape

Frontend should normalize around these backend response patterns:

Success examples:

{
  "status": "success",
  "statusCode": 200,
  "result": {}
}

or

{
  "status": "success",
  "statusCode": 201,
  "id": 12
}

Error examples:

{
  "status": "error",
  "statusCode": 400,
  "message": "Validation message"
}

Guideline:

- Always display message for status error
- If message is unavailable, show generic fallback

---

## 7.1 Implemented API Contract (Request Body + Expected Responses)

Important:

- Every endpoint below must include tenantId or tenant as query parameter.
- Examples in this section use tenantId.

### 7.1.1 Create Template

Route:

- POST /api/v1/email/templates?tenantId=1

Request body:

```json
{
  "name": "Result Ready",
  "category": "patient",
  "subject": "Hello {{PatientName}}, your result is ready",
  "htmlBody": "<p>Dear {{PatientName}}, your result is ready.</p>",
  "plainTextBody": "Dear {{PatientName}}, your result is ready.",
  "variables": ["PatientName"],
  "status": "active",
  "createdBy": 1,
  "updatedBy": 1
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 201,
  "id": 12
}
```

Expected validation error response:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid request payload"
}
```

### 7.1.2 List Templates

Route:

- GET /api/v1/email/templates?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 12,
      "name": "Result Ready",
      "category": "patient",
      "subject": "Hello {{PatientName}}, your result is ready",
      "html_body": "<p>Dear {{PatientName}}, your result is ready.</p>",
      "plain_text_body": "Dear {{PatientName}}, your result is ready.",
      "variables_json": "[\"PatientName\"]",
      "status": "active",
      "created_by": 1,
      "updated_by": 1,
      "created_at": "2026-08-07T10:00:00.000Z",
      "updated_at": "2026-08-07T10:00:00.000Z"
    }
  ]
}
```

### 7.1.3 Get Template By ID

Route:

- GET /api/v1/email/templates/:id?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 12,
    "name": "Result Ready"
  }
}
```

Expected not-found response:

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Email template not found"
}
```

### 7.1.4 Update Template

Route:

- PUT /api/v1/email/templates/:id?tenantId=1

Request body (partial allowed):

```json
{
  "subject": "Updated Subject",
  "status": "archived",
  "updatedBy": 4
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "updated": 1
}
```

### 7.1.5 Delete Template

Route:

- DELETE /api/v1/email/templates/:id?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "deleted": 1
}
```

### 7.1.6 Preview Template

Route:

- POST /api/v1/email/templates/:id/preview?tenantId=1

Request body:

```json
{
  "variables": {
    "PatientName": "John Doe",
    "InvoiceNumber": "INV-0092"
  }
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "subject": "Hello John Doe",
    "htmlBody": "<p>Dear John Doe, your result is ready.</p>",
    "plainTextBody": "Dear John Doe, your result is ready."
  }
}
```

### 7.1.7 Create Provider

Route:

- POST /api/v1/email/providers?tenantId=1

Request body:

```json
{
  "name": "Primary SMTP",
  "providerType": "smtp",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "username": "lab@example.com",
  "password": "app-password",
  "fromEmail": "lab@example.com",
  "fromName": "Prime Laboratory System",
  "isDefault": true,
  "isActive": true,
  "createdBy": 1,
  "updatedBy": 1
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 201,
  "id": 3
}
```

### 7.1.8 List Providers

Route:

- GET /api/v1/email/providers?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 3,
      "name": "Primary SMTP",
      "provider_type": "smtp",
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "username": "lab@example.com",
      "password": "app-password",
      "from_email": "lab@example.com",
      "from_name": "Prime Laboratory System",
      "is_default": true,
      "is_active": true
    }
  ]
}
```

### 7.1.9 Get Provider By ID

Route:

- GET /api/v1/email/providers/:id?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 3,
    "name": "Primary SMTP"
  }
}
```

Expected not-found response:

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Email provider not found"
}
```

### 7.1.10 Update Provider

Route:

- PUT /api/v1/email/providers/:id?tenantId=1

Request body (partial allowed):

```json
{
  "isDefault": true,
  "isActive": true,
  "updatedBy": 4
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "updated": 1
}
```

### 7.1.11 Delete Provider

Route:

- DELETE /api/v1/email/providers/:id?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "deleted": 1
}
```

### 7.1.12 Test Provider Connection

Route:

- POST /api/v1/email/providers/:id/test?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "connected": true
}
```

### 7.1.13 Get Settings

Route:

- GET /api/v1/email/settings?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "default_provider_id": 3,
    "max_attachment_size_mb": 10,
    "max_retries": 3,
    "retry_backoff_minutes_json": "[2,10,30]",
    "allow_marketing_emails": true
  }
}
```

### 7.1.14 Update Settings

Route:

- PUT /api/v1/email/settings?tenantId=1

Request body:

```json
{
  "defaultProviderId": 3,
  "maxAttachmentSizeMb": 15,
  "maxRetries": 4,
  "retryBackoffMinutes": [2, 10, 20, 60],
  "allowMarketingEmails": true,
  "updatedBy": 1
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 1,
    "default_provider_id": 3,
    "max_attachment_size_mb": 15,
    "max_retries": 4,
    "retry_backoff_minutes_json": "[2,10,20,60]",
    "allow_marketing_emails": true
  }
}
```

### 7.1.15 Queue Email

Route:

- POST /api/v1/email/queue?tenantId=1

Request body:

```json
{
  "templateId": 12,
  "providerId": 3,
  "to": ["patient@example.com"],
  "cc": ["doctor@example.com"],
  "bcc": [],
  "variables": {
    "PatientName": "John Doe"
  },
  "attachments": [
    {
      "filename": "result.pdf",
      "path": "uploads/results/result.pdf",
      "contentType": "application/pdf",
      "size": 210400
    }
  ],
  "scheduledAt": "2026-08-08T08:00:00.000Z",
  "priority": "normal",
  "referenceType": "billing",
  "referenceId": "INV-0092",
  "createdBy": 1
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 201,
  "result": {
    "id": 30,
    "status": "scheduled",
    "subject": "Hello John Doe, your result is ready"
  }
}
```

Expected validation/business error response:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Email subject and HTML body are required"
}
```

### 7.1.16 List Queue

Route:

- GET /api/v1/email/queue?tenantId=1&limit=50

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 30,
      "status": "pending",
      "priority": "normal",
      "subject": "Hello John Doe, your result is ready",
      "retry_count": 0
    }
  ]
}
```

### 7.1.17 Process Queue Batch

Route:

- POST /api/v1/email/queue/process?tenantId=1&limit=20

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 30,
      "status": "sent"
    }
  ]
}
```

### 7.1.18 Process Single Queue Item

Route:

- POST /api/v1/email/queue/:id/process?tenantId=1

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 30,
    "status": "sent"
  }
}
```

Expected not-found response:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Queued email not found"
}
```

### 7.1.19 Retry Queue Item

Route:

- POST /api/v1/email/queue/:id/retry?tenantId=1

Request body:

```json
{
  "forceImmediate": true
}
```

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "id": 30,
    "status": "pending"
  }
}
```

### 7.1.20 List Logs

Route:

- GET /api/v1/email/logs?tenantId=1&limit=100

Request body:

- none

Expected success response:

```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 90,
      "queue_id": 30,
      "provider_id": 3,
      "status": "sent",
      "recipients_json": "[\"patient@example.com\"]",
      "subject": "Hello John Doe, your result is ready",
      "response_payload_json": "{\"accepted\":[\"patient@example.com\"]}",
      "failure_reason": null,
      "duration_ms": 534,
      "created_at": "2026-08-07T10:05:00.000Z"
    }
  ]
}
```

### 7.1.21 Error Handling Expectations For Frontend

The frontend should normalize all non-success outcomes using this priority:

1. Use message from response body when available
2. Else use a generic fallback: Request failed. Please try again.
3. Keep server statusCode visible in developer/debug view

Common messages currently emitted by backend:

- Email template not found
- Email provider not found
- Provider not found
- Queued email not found
- Template not found
- Email subject and HTML body are required
- No active email provider configured
- Configured provider is unavailable

---

## 8. Frontend Validation Matrix

Template form:

- name required, max 150
- subject required, max 255
- htmlBody required

Provider form:

- host required
- port positive integer
- username required
- password required
- fromEmail valid email

Settings form:

- maxRetries in [0, 10]
- retryBackoffMinutes item in [1, 1440]

Queue form:

- to must contain at least one valid email
- subject/htmlBody required when templateId missing
- scheduledAt must be valid ISO datetime if supplied

---

## 9. UX and Interaction Requirements

Global:

- Use optimistic UI only for harmless operations (list refresh), not for send/process actions
- Every mutation must show success toast or error toast
- Support loading skeletons on list pages
- Use empty states with call-to-action buttons

Template Editor:

- Rich text editor area
- Variable chips for one-click insertion into subject/body
- Preview side panel

Queue Monitor:

- Color-coded status chips
- Quick filter chips by status
  - pending
  - processing
  - sent
  - failed
  - scheduled
  - cancelled

Provider Security:

- Password field never shown in clear text after save
- Allow secure re-entry on edit

---

## 10. State Management Requirements

Recommended state slices:

- emailTemplates
- emailProviders
- emailSettings
- emailQueue
- emailLogs
- emailUiState

Suggested cached queries:

- templates list
- providers list
- settings
- queue list
- logs list

Invalidate after mutation:

- Create/update/delete template => invalidate templates
- Provider changes => invalidate providers + settings
- Queue actions => invalidate queue + logs

---

## 11. Suggested Frontend Service Contract

Build a dedicated client module with these methods:

- getTemplates
- getTemplateById
- createTemplate
- updateTemplate
- deleteTemplate
- previewTemplate
- getProviders
- getProviderById
- createProvider
- updateProvider
- deleteProvider
- testProvider
- getSettings
- updateSettings
- queueEmail
- processQueue
- processQueueItem
- retryQueueItem
- getQueue
- getLogs

---

## 12. Non-Functional Requirements

Performance:

- Queue and logs screens should load first paint under 2 seconds for 100 rows on standard office network

Reliability:

- Frontend must gracefully handle partial API failures and show recoverable actions

Auditability:

- Display send status and timestamps consistently

Accessibility:

- Keyboard navigable forms
- Labels for all form fields
- Color status badges must include text labels

---

## 13. QA Acceptance Criteria

Templates:

- Can create, edit, preview, delete templates
- Variable replacements render correctly in preview

Providers:

- Can create SMTP provider and test connection
- Can set default provider

Settings:

- Can update retry and attachment settings
- Invalid retry config is blocked client-side

Queue:

- Can queue both template-based and direct-body emails
- Can process batch queue
- Can retry failed item

Logs:

- Can view logs and inspect failure reasons

Tenant Handling:

- All requests include tenantId

---

## 14. Future Enhancements (Design for Expansion)

Frontend should keep architecture ready for:

- Multiple provider types (SendGrid, SES, Mailgun, Resend)
- Campaign management pages
- Scheduled automation and recurring jobs
- Attachment upload manager
- Event-driven email trigger builder

---

## 15. Delivery Plan Suggestion

Phase 1:

- Templates + Providers + Settings

Phase 2:

- Queue + Logs

Phase 3:

- UX refinements, filters, advanced preview, role-based restrictions

---

## 16. Frontend Dev Notes

Current backend routes are located in:

- src/controllers/email/route.ts

Use this PRD as implementation source of truth for frontend behavior.

If backend contract changes, update this PRD and align frontend API client immediately.
