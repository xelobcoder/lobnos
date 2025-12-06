# Leads API Documentation

## Overview
The Leads API provides endpoints for managing customer leads in the CRM system. It supports creating, updating, retrieving, and listing leads with multi-tenant support.

## Base URL
`/api/v1/leads`

## Authentication
All endpoints require a valid tenant ID passed as a query parameter: `?tenantId=<number>`

## Endpoints

### 1. Create a Lead
**POST** `/api/v1/leads?tenantId=<tenantId>`

#### Request Body
```json
{
  "firstname": "string (required, 1-255 chars)",
  "lastname": "string (required, 1-255 chars)",
  "middlename": "string (optional, max 255 chars)",
  "contact_person": "string (required, 1-255 chars)",
  "contact_email": "string (required, valid email, max 255 chars)",
  "contact_phone": "string (required, 1-50 chars)",
  "company_name": "string (optional, max 255 chars)",
  "industry_type": "healthcare|pharmaceutical|biotech|research (required)",
  "lead_source": "website|referral|social_media|cold_call|trade_show (required)",
  "service_interest": "string (optional)",
  "status": "new|contacted|qualified|proposal|negotiation|closed_won|closed_lost (required)",
  "priority": "low|medium|high|urgent (required)",
  "location": "string (required, 1-255 chars)",
  "assigned_to": "number (optional, positive integer)",
  "notes": "string (optional)",
  "created_by": "number (optional, positive integer)"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    // ... other fields
    "created_at": "2025-12-06T00:00:00.000Z",
    "updated_at": "2025-12-06T00:00:00.000Z"
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Failed to create lead",
  "statusCode": 400,
  "status": "error"
}
```

### 2. Update a Lead
**PUT** `/api/v1/leads/:id?tenantId=<tenantId>`

#### URL Parameters
- `id`: Lead ID (number)

#### Request Body
Same as create, but all fields optional for partial updates.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Lead updated successfully"
}
```

#### Error Responses
- 400: Validation error
- 404: Lead not found

### 3. Get All Leads
**GET** `/api/v1/leads?tenantId=<tenantId>&page=1&count=10`

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
        "firstname": "John",
        "lastname": "Doe",
        // ... other fields
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
  "message": "Failed to fetch leads",
  "statusCode": 500,
  "status": "error"
}
```

### 4. Get Lead by ID
**GET** `/api/v1/leads/:id?tenantId=<tenantId>`

#### URL Parameters
- `id`: Lead ID (number)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    // ... other fields
  }
}
```

#### Error Responses
- 404: Lead not found
- 500: Server error

## Data Validation
- All string fields are trimmed and validated for length
- Email format is validated
- Enum values are strictly enforced
- Foreign key references are checked (assigned_to, created_by to users table)
- Tenant isolation ensures data separation

## Notes
- All timestamps are in ISO 8601 format
- Pagination starts from page 1
- Default pagination: 10 items per page
- All operations are tenant-scoped via tenantId query parameter