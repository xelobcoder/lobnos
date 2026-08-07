# Notifications API (Event + Template System)

This module provides an event-driven notification pipeline that renders templates and creates delivery jobs in the email queue.

## Base Notes
- Tenant context is read from query parameter `tenantId` (fallback: `tenant`).
- All endpoints are mounted in `src/controllers/notifications/route.ts`.
- Trigger API writes to:
  - `notification_queue` (event-level queue)
  - `email_queue` (delivery queue used by existing email processor)

## Endpoints

### 1) List Events
- `GET /api/v1/notifications/events?tenantId=1`

Response:
```json
{
  "status": "success",
  "statusCode": 200,
  "result": [
    {
      "id": 1,
      "event_code": "RESULT_READY",
      "event_name": "RESULT READY",
      "module": "result",
      "is_active": true
    }
  ]
}
```

### 2) Get Event
- `GET /api/v1/notifications/events/:eventCode?tenantId=1`

### 3) Event Variables
- `GET /api/v1/notifications/events/:eventCode/variables?tenantId=1`

### 4) Event Settings
- `GET /api/v1/notifications/settings/:eventCode?tenantId=1`
- `PUT /api/v1/notifications/settings/:eventCode?tenantId=1`

Request body (PUT):
```json
{
  "emailEnabled": true,
  "smsEnabled": false,
  "whatsappEnabled": false,
  "inAppEnabled": true,
  "defaultTemplateId": 5
}
```

### 5) Templates
- `GET /api/v1/notifications/templates?tenantId=1`
- `GET /api/v1/notifications/templates/:id?tenantId=1`
- `GET /api/v1/notifications/templates/:id/versions?tenantId=1`
- `POST /api/v1/notifications/templates?tenantId=1`
- `PUT /api/v1/notifications/templates/:id?tenantId=1`
- `DELETE /api/v1/notifications/templates/:id?tenantId=1`
- `POST /api/v1/notifications/templates/:id/preview?tenantId=1`

Create template request body:
```json
{
  "eventCode": "RESULT_READY",
  "templateName": "Tenant Result Ready",
  "subject": "Result Ready | {{InvoiceNumber}}",
  "htmlBody": "<p>Dear {{PatientName}}, your result is ready.</p>",
  "plainBody": "Dear {{PatientName}}, your result is ready.",
  "isDefault": false,
  "isActive": true,
  "createdBy": 9
}
```

Preview request body:
```json
{
  "variables": {
    "PatientName": "John Doe",
    "InvoiceNumber": "INV-10023"
  }
}
```

### 6) Trigger Notification
- `POST /api/v1/notifications/trigger?tenantId=1`

Request body:
```json
{
  "eventCode": "RESULT_READY",
  "priority": "normal",
  "createdBy": 12,
  "context": {
    "PatientName": "John Doe",
    "PatientEmail": "john@example.com",
    "ResultName": "Full Blood Count",
    "InvoiceNumber": "INV-10023",
    "BranchName": "Prime Lab Main Branch"
  },
  "recipients": {
    "to": ["manual.override@example.com"],
    "cc": [],
    "bcc": []
  }
}
```

Response (queued):
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "queued": true,
    "notificationQueueId": 101,
    "emailQueueId": 502,
    "recipients": {
      "to": ["john@example.com", "manual.override@example.com"],
      "cc": [],
      "bcc": []
    }
  }
}
```

Response (not queued):
```json
{
  "status": "success",
  "statusCode": 200,
  "result": {
    "queued": false,
    "reason": "No valid recipients found for event"
  }
}
```

### 7) Queue + Logs
- `GET /api/v1/notifications/queue?tenantId=1&limit=100`
- `GET /api/v1/notifications/queue/:id?tenantId=1`
- `POST /api/v1/notifications/queue/:id/retry?tenantId=1`
- `POST /api/v1/notifications/queue/:id/cancel?tenantId=1`
- `GET /api/v1/notifications/logs?tenantId=1&limit=100`

## Internal Trigger Usage (Server-Side)

```ts
await notificationService.trigger({
  eventCode: 'RESULT_READY',
  context: {
    PatientName: patient.name,
    PatientEmail: patient.email,
    ResultName: testName,
    InvoiceNumber: invoiceNo,
    BranchName: organization.branch_name,
  },
  priority: 'normal',
  createdBy: currentUserId,
});
```

## Seeded Defaults
Initial migration seeds include:
- Notification events catalog (patient/appointment/sample/result/billing/report/security)
- Variables for `RESULT_READY`, `SAMPLE_REJECTED`, `PATIENT_CREATED`
- Recipient rules for those events
- Default system templates and version history rows
- Global event settings rows (`tenant_id = null`)

## Frontend Implementation Guide

### Template Editor Data Flow
1. Load event catalog with `GET /api/v1/notifications/events?tenantId={id}`.
2. When event is selected, load event variables with `GET /api/v1/notifications/events/{eventCode}/variables?tenantId={id}`.
3. Load template candidates with `GET /api/v1/notifications/templates?tenantId={id}` and filter by selected `event_id`.
4. If no tenant template exists for event, prefill editor with the system default template below.
5. Use `POST /api/v1/notifications/templates/{id}/preview?tenantId={id}` while user edits subject/body.
6. Save template with `POST /api/v1/notifications/templates?tenantId={id}` (new) or `PUT /api/v1/notifications/templates/{id}?tenantId={id}` (update).

### Required Editor Fields
- `templateName`
- `subject`
- `htmlBody`
- `plainBody`
- `isDefault`
- `isActive`

### Recommended Frontend Blocks
- Event list panel (by module)
- Channel toggles (`emailEnabled`, `smsEnabled`, `whatsappEnabled`, `inAppEnabled`)
- Variable picker with insert action
- Subject editor
- HTML editor
- Plain text editor
- Live preview pane
- Version history pane (`GET /api/v1/notifications/templates/{id}/versions`)

## Event Template Catalog (Default HTML + Plain Text)

Use these templates as frontend defaults when creating a tenant template for an event. The syntax uses handlebars-style placeholders, for example `{{PatientName}}`.

### 1) PATIENT_CREATED
Recipients:
- PATIENT

Variables:
- `{{PatientName}}`
- `{{PatientNumber}}`
- `{{BranchName}}`
- `{{BranchPhone}}`

Subject:
- `Welcome to {{BranchName}}, {{PatientName}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Welcome to {{BranchName}}</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your patient account has been created successfully.</p>
  <p><strong>Patient Number:</strong> {{PatientNumber}}</p>
  <p>If you need help, contact us on {{BranchPhone}}.</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your patient account has been created at {{BranchName}}.
Patient Number: {{PatientNumber}}.
For support contact {{BranchPhone}}.
```

### 2) APPOINTMENT_CONFIRMED
Recipients:
- PATIENT

Variables:
- `{{PatientName}}`
- `{{AppointmentDate}}`
- `{{AppointmentTime}}`
- `{{BranchName}}`
- `{{BranchPhone}}`

Subject:
- `Appointment Confirmed for {{PatientName}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Appointment Confirmed</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your appointment is confirmed for <strong>{{AppointmentDate}}</strong> at <strong>{{AppointmentTime}}</strong>.</p>
  <p>Location: {{BranchName}}</p>
  <p>Contact: {{BranchPhone}}</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your appointment is confirmed for {{AppointmentDate}} at {{AppointmentTime}} at {{BranchName}}.
Contact {{BranchPhone}} for support.
```

### 3) APPOINTMENT_REMINDER
Recipients:
- PATIENT

Variables:
- `{{PatientName}}`
- `{{AppointmentDate}}`
- `{{AppointmentTime}}`
- `{{BranchName}}`

Subject:
- `Reminder: Appointment on {{AppointmentDate}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Appointment Reminder</h2>
  <p>Hello {{PatientName}},</p>
  <p>This is a reminder for your appointment on {{AppointmentDate}} at {{AppointmentTime}}.</p>
  <p>Branch: {{BranchName}}</p>
</div>
```

Plain Text:
```text
Hello {{PatientName}}, this is a reminder for your appointment on {{AppointmentDate}} at {{AppointmentTime}}.
Branch: {{BranchName}}.
```

### 4) SAMPLE_REJECTED
Recipients:
- PATIENT
- DOCTOR

Variables:
- `{{PatientName}}`
- `{{SampleNumber}}`
- `{{RejectionReason}}`
- `{{DoctorName}}`
- `{{BranchName}}`

Subject:
- `Sample {{SampleNumber}} Rejected`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Sample Rejected</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your sample <strong>{{SampleNumber}}</strong> has been rejected.</p>
  <p><strong>Reason:</strong> {{RejectionReason}}</p>
  <p>Please contact {{BranchName}} for recollection steps.</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, sample {{SampleNumber}} has been rejected.
Reason: {{RejectionReason}}.
Please contact {{BranchName}} for recollection guidance.
```

### 5) SAMPLE_RECALL_REQUIRED
Recipients:
- PATIENT
- DOCTOR

Variables:
- `{{PatientName}}`
- `{{SampleNumber}}`
- `{{RecallReason}}`
- `{{RequiredAction}}`
- `{{BranchName}}`

Subject:
- `Sample Recall Required: {{SampleNumber}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Sample Recall Required</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your sample {{SampleNumber}} needs recollection.</p>
  <p><strong>Reason:</strong> {{RecallReason}}</p>
  <p><strong>Action:</strong> {{RequiredAction}}</p>
  <p>Please visit {{BranchName}}.</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, sample {{SampleNumber}} requires recollection.
Reason: {{RecallReason}}.
Action: {{RequiredAction}}.
Please visit {{BranchName}}.
```

### 6) RESULT_READY
Recipients:
- PATIENT
- DOCTOR (optional)

Variables:
- `{{PatientName}}`
- `{{PatientNumber}}`
- `{{InvoiceNumber}}`
- `{{ResultName}}`
- `{{ResultDate}}`
- `{{DoctorName}}`
- `{{BranchName}}`
- `{{BranchPhone}}`
- `{{ResultLink}}`

Subject:
- `Prime Lab - Your Result Is Ready | {{InvoiceNumber}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Result Ready</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your <strong>{{ResultName}}</strong> result is ready as of {{ResultDate}}.</p>
  <p><strong>Invoice:</strong> {{InvoiceNumber}}</p>
  <p>You can access your result here: <a href="{{ResultLink}}">View Result</a></p>
  <p>{{BranchName}} | {{BranchPhone}}</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your {{ResultName}} result is ready as of {{ResultDate}}.
Invoice: {{InvoiceNumber}}.
View Result: {{ResultLink}}
{{BranchName}} | {{BranchPhone}}
```

### 7) RESULT_RELEASED
Recipients:
- PATIENT
- DOCTOR

Variables:
- `{{PatientName}}`
- `{{ResultName}}`
- `{{ResultDate}}`
- `{{ResultLink}}`

Subject:
- `Result Released: {{ResultName}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Result Released</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your result for {{ResultName}} has been officially released on {{ResultDate}}.</p>
  <p><a href="{{ResultLink}}">Open Result</a></p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your result for {{ResultName}} has been released on {{ResultDate}}.
Open Result: {{ResultLink}}
```

### 8) CRITICAL_RESULT
Recipients:
- DOCTOR
- STAFF

Variables:
- `{{PatientName}}`
- `{{ResultName}}`
- `{{CriticalFlag}}`
- `{{DoctorName}}`
- `{{BranchName}}`

Subject:
- `Critical Result Alert: {{ResultName}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #7f1d1d; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Critical Result Alert</h2>
  <p>Attention {{DoctorName}},</p>
  <p>A critical result has been recorded for patient {{PatientName}}.</p>
  <p><strong>Test:</strong> {{ResultName}}</p>
  <p><strong>Flag:</strong> {{CriticalFlag}}</p>
  <p>Please follow urgent clinical escalation protocol at {{BranchName}}.</p>
</div>
```

Plain Text:
```text
Critical result alert for patient {{PatientName}}.
Test: {{ResultName}} | Flag: {{CriticalFlag}}.
Please follow urgent clinical escalation protocol at {{BranchName}}.
```

### 9) INVOICE_CREATED
Recipients:
- PATIENT
- ORGANIZATION

Variables:
- `{{PatientName}}`
- `{{InvoiceNumber}}`
- `{{InvoiceAmount}}`
- `{{DueDate}}`
- `{{BranchName}}`

Subject:
- `Invoice Created: {{InvoiceNumber}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Invoice Created</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your invoice <strong>{{InvoiceNumber}}</strong> has been generated.</p>
  <p><strong>Amount:</strong> {{InvoiceAmount}}</p>
  <p><strong>Due Date:</strong> {{DueDate}}</p>
  <p>{{BranchName}}</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your invoice {{InvoiceNumber}} has been generated.
Amount: {{InvoiceAmount}}. Due Date: {{DueDate}}.
{{BranchName}}
```

### 10) PAYMENT_RECEIVED
Recipients:
- PATIENT
- ACCOUNTANT

Variables:
- `{{PatientName}}`
- `{{InvoiceNumber}}`
- `{{AmountPaid}}`
- `{{PaymentDate}}`
- `{{ReceiptNumber}}`

Subject:
- `Payment Received for Invoice {{InvoiceNumber}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Payment Received</h2>
  <p>Dear {{PatientName}},</p>
  <p>We have received your payment for invoice {{InvoiceNumber}}.</p>
  <p><strong>Amount:</strong> {{AmountPaid}}</p>
  <p><strong>Date:</strong> {{PaymentDate}}</p>
  <p><strong>Receipt:</strong> {{ReceiptNumber}}</p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, we received your payment for invoice {{InvoiceNumber}}.
Amount: {{AmountPaid}} | Date: {{PaymentDate}} | Receipt: {{ReceiptNumber}}.
```

### 11) REPORT_READY
Recipients:
- PATIENT
- DOCTOR

Variables:
- `{{PatientName}}`
- `{{ReportName}}`
- `{{ReportDate}}`
- `{{ReportLink}}`

Subject:
- `Report Ready: {{ReportName}}`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Report Ready</h2>
  <p>Dear {{PatientName}},</p>
  <p>Your report for {{ReportName}} is ready on {{ReportDate}}.</p>
  <p><a href="{{ReportLink}}">View Report</a></p>
</div>
```

Plain Text:
```text
Dear {{PatientName}}, your report for {{ReportName}} is ready on {{ReportDate}}.
View Report: {{ReportLink}}
```

### 12) PASSWORD_RESET
Recipients:
- STAFF
- PATIENT

Variables:
- `{{UserName}}`
- `{{ResetLink}}`
- `{{ExpiryMinutes}}`
- `{{BranchName}}`

Subject:
- `Password Reset Request`

HTML:
```html
<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">Password Reset</h2>
  <p>Hello {{UserName}},</p>
  <p>Use the link below to reset your password:</p>
  <p><a href="{{ResetLink}}">Reset Password</a></p>
  <p>This link expires in {{ExpiryMinutes}} minutes.</p>
  <p>{{BranchName}}</p>
</div>
```

Plain Text:
```text
Hello {{UserName}}, use this link to reset your password: {{ResetLink}}
This link expires in {{ExpiryMinutes}} minutes.
{{BranchName}}
```

## Frontend Validation Rules
- Keep placeholders exactly in `{{VariableName}}` format.
- Do not allow unknown variables when user saves template; validate against event variable list endpoint.
- Require both `subject` and at least one of `htmlBody` or `plainBody`.
- Warn if required event variables are missing from subject/body.
- For preview, always send `variables` object with test values.

## Example Frontend Default Catalog Payload

This is a suggested in-memory frontend mapping (for fallback UI defaults):

```json
{
  "RESULT_READY": {
    "subject": "Prime Lab - Your Result Is Ready | {{InvoiceNumber}}",
    "htmlBody": "<p>Dear {{PatientName}},</p><p>Your {{ResultName}} result is ready.</p><p><a href='{{ResultLink}}'>View Result</a></p>",
    "plainBody": "Dear {{PatientName}}, your {{ResultName}} result is ready. View: {{ResultLink}}"
  },
  "SAMPLE_REJECTED": {
    "subject": "Sample {{SampleNumber}} Rejected",
    "htmlBody": "<p>Dear {{PatientName}}, your sample {{SampleNumber}} was rejected. Reason: {{RejectionReason}}</p>",
    "plainBody": "Dear {{PatientName}}, sample {{SampleNumber}} was rejected. Reason: {{RejectionReason}}"
  },
  "PATIENT_CREATED": {
    "subject": "Welcome to {{BranchName}}, {{PatientName}}",
    "htmlBody": "<p>Dear {{PatientName}}, your patient account has been created.</p>",
    "plainBody": "Dear {{PatientName}}, your patient account has been created."
  }
}
```
