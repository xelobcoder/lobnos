# Lead Follow-ups API Documentation

## Overview
The Lead Follow-ups API provides endpoints for managing follow-up activities for customer leads in the CRM system. It supports creating, updating, retrieving, and managing follow-ups with multi-tenant support.

## Base URL
`/api/v1/followups`

## Authentication
All endpoints require a valid tenant ID passed as a query parameter: `?tenantId=<number>`

## Endpoints

### 1. Create a Follow-up
**POST** `/api/v1/followups?tenantId=<tenantId>`

#### Request Body
```json
{
  "lead_id": "number (required, positive integer)",
  "followup_type": "call|email|meeting|visit|other (required)",
  "followup_date": "string (optional, date string)",
  "notes": "string (required, min 1 char)",
  "next_followup_date": "string (optional, date string)",
  "priority": "low|medium|high|urgent (required)",
  "status": "pending|completed|cancelled (required)",
  "created_by": "number (optional, positive integer)"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lead_id": 123,
    "followup_type": "call",
    "followup_date": "2025-12-06",
    "notes": "Called the lead to discuss services",
    "next_followup_date": "2025-12-10",
    "priority": "high",
    "status": "pending",
    "created_by": 456,
    "created_at": "2025-12-06T00:00:00.000Z",
    "updated_at": "2025-12-06T00:00:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Failed to create follow-up",
  "statusCode": 400,
  "status": "error"
}
```

### 2. Update a Follow-up
**PUT** `/api/v1/followups/:id?tenantId=<tenantId>`

#### URL Parameters
- `id`: Follow-up ID (number)

#### Request Body
Same as create, but all fields optional for partial updates.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Follow-up updated successfully"
}
```

#### Error Responses
- 400: Validation error
- 404: Follow-up not found

### 3. Get All Follow-ups
**GET** `/api/v1/followups?tenantId=<tenantId>&page=1&count=10`

#### Query Parameters
- `tenantId`: Tenant ID (required)
- `page`: Page number (optional, default 1)
- `count`: Items per page (optional, default 10)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "lead_id": 123,
        "followup_type": "call",
        "notes": "Called the lead to discuss services",
        "priority": "high",
        "status": "pending",
        "created_at": "2025-12-06T00:00:00.000Z",
        "updated_at": "2025-12-06T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "message": "Failed to fetch follow-ups",
  "statusCode": 500,
  "status": "error"
}
```

### 4. Get Follow-up by ID
**GET** `/api/v1/followups/:id?tenantId=<tenantId>`

#### URL Parameters
- `id`: Follow-up ID (number)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "lead_id": 123,
    "followup_type": "call",
    "notes": "Called the lead to discuss services",
    "priority": "high",
    "status": "pending",
    "created_at": "2025-12-06T00:00:00.000Z",
    "updated_at": "2025-12-06T00:00:00.000Z"
  }
}
```

#### Error Responses
- 404: Follow-up not found
- 500: Server error

### 5. Get Follow-ups by Lead ID
**GET** `/api/v1/followups/lead/:leadId?tenantId=<tenantId>`

#### URL Parameters
- `leadId`: Lead ID (number)

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 123,
      "followup_type": "call",
      "notes": "Initial contact call",
      "status": "completed",
      "created_at": "2025-12-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "lead_id": 123,
      "followup_type": "email",
      "notes": "Sent proposal email",
      "status": "pending",
      "created_at": "2025-12-05T00:00:00.000Z"
    }
  ]
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "message": "Failed to fetch follow-ups for lead",
  "statusCode": 500,
  "status": "error"
}
```

### 6. Get Follow-ups by Status
**GET** `/api/v1/followups/status/:status?tenantId=<tenantId>`

#### URL Parameters
- `status`: Follow-up status (pending|completed|cancelled)

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 123,
      "followup_type": "call",
      "notes": "Follow-up call needed",
      "status": "pending",
      "priority": "high",
      "next_followup_date": "2025-12-08"
    }
  ]
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "message": "Failed to fetch follow-ups by status",
  "statusCode": 500,
  "status": "error"
}
```

### 7. Get Pending Follow-ups
**GET** `/api/v1/followups/pending/all?tenantId=<tenantId>`

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "lead_id": 123,
      "followup_type": "meeting",
      "notes": "Schedule product demo",
      "status": "pending",
      "priority": "urgent",
      "next_followup_date": "2025-12-07"
    }
  ]
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "message": "Failed to fetch pending follow-ups",
  "statusCode": 500,
  "status": "error"
}
```

### 8. Delete a Follow-up
**DELETE** `/api/v1/followups/:id?tenantId=<tenantId>`

#### URL Parameters
- `id`: Follow-up ID (number)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Follow-up deleted successfully"
}
```

#### Error Responses
- 404: Follow-up not found
- 500: Server error

## Data Validation
- All string fields are trimmed and validated for length
- Enum values are strictly enforced (followup_type, priority, status)
- Foreign key references are checked (lead_id to leads table, created_by to users table)
- Tenant isolation ensures data separation
- Dates are validated for proper format

## Notes
- All timestamps are in ISO 8601 format
- Pagination starts from page 1
- Default pagination: 10 items per page
- All operations are tenant-scoped via tenantId query parameter
- Pending follow-ups include those with status 'pending' and next_followup_date in the past or today