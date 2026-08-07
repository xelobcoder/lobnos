# Notifications Frontend Changes

This document lists the frontend updates required after the backend notification enhancements.

## What changed in backend

1. Notification definitions are auto-initialized on server startup.
2. Missing notification events, variables, and default templates are now auto-seeded.
3. New event catalog endpoints expose required references, allowed variables, and default template metadata.
4. New trigger-by-reference endpoint allows frontend or other clients to send only IDs instead of constructing full template variables manually.

## Frontend changes required

### 0. Adopt enterprise default template baseline

Backend default templates are now standardized for enterprise laboratory communication and include:
- Structured header with LABORATORY NOTIFICATION label
- Clear Details section in list format
- Event metadata footer (event_code and triggered_at)
- Professional compliance-style closing text

Frontend impact:
- When creating a new tenant template, prefill from catalog template exactly as returned by backend.
- Do not start from an empty editor for first-time event templates.
- Keep both htmlBody and plainBody present on save.

### 1. Use event catalog endpoint instead of hardcoded variables

Old behavior:
- Frontend guessed variables or relied on static mappings.

New behavior:
- Load event definitions from backend and render variable picker from API response.

Endpoints:
- GET /api/v1/notifications/events/catalog?tenantId={tenantId}
- GET /api/v1/notifications/events/{eventCode}/catalog?tenantId={tenantId}

Expected event catalog fields used by frontend:
- event
- variables
- template
- requiredReferences

UI changes:
- Variable picker must be populated from variables array.
- Required reference fields should be shown from requiredReferences.
- Template editor default subject/body should be prefilled from template when creating new tenant template.

### 2. Add one-click sync button for admin settings page

Backend already auto-bootstraps at startup, but frontend should expose a manual sync action for operators.

Endpoint:
- POST /api/v1/notifications/events/sync-definitions?tenantId={tenantId}

Recommended UI behavior:
- Add Sync Definitions button in Notifications Admin.
- Show summary returned by API:
  - eventCode
  - variablesInserted
  - templateCreated

Use cases:
- After deploying new event codes.
- After restoring a tenant database.
- After accidental data deletion.

### 3. Switch event execution flow to trigger-by-reference

Old behavior:
- Frontend or caller builds full context object manually.

New behavior:
- Caller sends eventCode plus references and optional overrides.

Endpoint:
- POST /api/v1/notifications/trigger-by-reference?tenantId={tenantId}

Request example:

```json
{
  "eventCode": "PATIENT_CREATED",
  "references": {
    "patientId": 1001
  },
  "context": {
    "custom_note": "Welcome package granted"
  },
  "priority": "normal",
  "createdBy": 12,
  "recipients": {
    "to": [],
    "cc": [],
    "bcc": []
  }
}
```

Important:
- references keys are event-dependent.
- Backend validates required references from event definition.
- Backend resolves and sanitizes context before template rendering.

### 4. Keep template editing flow, but source constants from API

Template CRUD endpoints remain valid.

Frontend update:
- Prevent manual free-form variable assumptions.
- Show constants from GET catalog or GET event variables endpoint.
- Highlight required variables from is_required.

Existing endpoints still used:
- GET /api/v1/notifications/templates
- POST /api/v1/notifications/templates
- PUT /api/v1/notifications/templates/{id}
- POST /api/v1/notifications/templates/{id}/preview

Safe editing rules for frontend template editor:
- Preserve required placeholders used by system context:
  - {{event_code}}
  - {{triggered_at}}
- Preserve event-specific required placeholders from variables list where is_required is true.
- If user removes a required placeholder, show warning before save.
- Always keep plainBody synchronized conceptually with htmlBody.
- If htmlBody is edited heavily, prompt user to regenerate plainBody preview.

### 5. Validation and UX updates

Add frontend validation before trigger call:
- If requiredReferences contains patientId, require patientId input.
- If requiredReferences contains appointmentId, require appointmentId input.
- If requiredReferences contains ascensionId, require ascensionId input.
- If requiredReferences contains billingId, require billingId input.
- If requiredReferences contains userId, require userId input.

Error handling:
- Show backend errors directly for missing required reference.
- Show queued false reason when notification is skipped.

### 6. Suggested UI sections in Notifications module

1. Event list
- Shows event_code, event_name, module, is_active.

2. Event detail panel
- Variables list with type, description, required status.
- Required reference chips.

3. Template editor
- Prefill from catalog template for first-time template creation.
- Insert variable action from catalog variables.
- Add Enterprise Layout lock hints:
  - Header block
  - Details block
  - Event metadata/footer block
- Allow full editing but show warnings when core blocks are deleted.

4. Trigger test panel
- Choose event code.
- Enter references only.
- Optional recipients overrides.
- Submit trigger-by-reference.

5. Admin utilities
- Sync definitions button.
- Last sync result table.

## Event reference matrix for frontend forms

Use this map to render the correct reference input fields:

- PATIENT_* events: patientId
- APPOINTMENT_* events: appointmentId
- SAMPLE_* events: ascensionId
- RESULT_* and CRITICAL_RESULT: ascensionId
- INVOICE_*, PAYMENT_*, REPORT_READY: billingId
- USER_*, PASSWORD_RESET and other security-style events: userId

Final source of truth:
- requiredReferences from event catalog endpoint.

## Migration steps for frontend team

1. Add event catalog query and cache it in notifications store.
2. Replace static variable maps with catalog variables.
3. Add trigger-by-reference form and API integration.
4. Add sync-definitions admin action.
5. Keep existing template CRUD screens, but use catalog constants for helper UI.
6. Test with one event in each family: patient, appointment, sample, result, billing, security.

## Enterprise template checklist for QA

For each event template created or edited by frontend:

1. Subject is not empty.
2. htmlBody is not empty and renders successfully in preview.
3. plainBody is not empty and readable.
4. Required placeholders still exist.
5. Preview endpoint renders values with no unresolved required fields.
6. Trigger-by-reference sends and queues successfully for a valid reference id.

## Backward compatibility notes

- Existing trigger endpoint still works:
  - POST /api/v1/notifications/trigger
- Recommended path for new work is trigger-by-reference.
- Auto-bootstrap reduces manual SQL dependency for notification setup.
