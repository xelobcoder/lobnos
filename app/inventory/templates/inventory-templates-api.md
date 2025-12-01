# Inventory Templates API Documentation

## Overview

The Inventory Templates API allows managing templates that define which inventory items should be automatically deducted when specific tests are performed. Each template is linked to a test ID and contains a list of items with their respective quantities.

## Base URL
```
/api/v1/inventory
```

## Authentication
All endpoints require tenant ID and user ID as query parameters:
- `tenantId`: The tenant identifier (number)
- `userId`: The user identifier (number)

## API Endpoints

### 1. Create Inventory Template

**Endpoint:** `POST /templates`

**Description:** Creates a new inventory template with associated items.

**Request Body:**
```json
{
  "name": "string (required, max 255 chars)",
  "description": "string (optional, max 1000 chars)",
  "testId": "string (required)",
  "items": [
    {
      "itemId": "string (required)",
      "quantity": "number (required, positive)"
    }
  ]
}
```

**Example Request:**
```json
{
  "name": "Complete Blood Count Template",
  "description": "Items required for CBC test",
  "testId": "CBC-001",
  "items": [
    {
      "itemId": "INV-123456789",
      "quantity": 2.5
    },
    {
      "itemId": "INV-987654321",
      "quantity": 1.0
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Complete Blood Count Template",
    "createby": 123,
    "description": "Items required for CBC test",
    "testId": "CBC-001",
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z",
    "creator_name": "John Doe",
    "items_count": 2
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid inventory template data",
    "details": [
      {
        "field": "name",
        "message": "Template name is required and must be a non-empty string",
        "value": ""
      }
    ]
  }
}
```

### 2. Get Inventory Template by ID

**Endpoint:** `GET /templates/{id}`

**Description:** Retrieves a specific inventory template by its ID.

**Path Parameters:**
- `id`: Template ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Complete Blood Count Template",
    "createby": 123,
    "description": "Items required for CBC test",
    "testId": "CBC-001",
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-01T10:00:00.000Z",
    "creator_name": "John Doe",
    "items_count": 2
  }
}
```

### 3. Get Inventory Template by Test ID

**Endpoint:** `GET /templates/test/{testId}`

**Description:** Retrieves the inventory template associated with a specific test ID.

**Path Parameters:**
- `testId`: Test identifier (string)

**Success Response (200):** Same as above

### 4. List Inventory Templates

**Endpoint:** `GET /templates`

**Description:** Retrieves a paginated list of inventory templates with optional filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `count`: Items per page (default: 10)
- `testId`: Filter by test ID
- `search`: Search in name and description
- `createby`: Filter by creator ID
- `sortby`: Sort order - 'ASC' or 'DESC' (default: 'DESC')

**Example Request:**
```
GET /templates?page=1&count=5&testId=CBC-001&sortby=DESC
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Complete Blood Count Template",
      "createby": 123,
      "description": "Items required for CBC test",
      "testId": "CBC-001",
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-01T10:00:00.000Z",
      "creator_name": "John Doe",
      "items_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "count": 5,
    "total": 1,
    "totalPages": 1,
    "sortby": "DESC"
  }
}
```

### 5. Update Inventory Template

**Endpoint:** `PUT /templates/{id}`

**Description:** Updates an existing inventory template.

**Path Parameters:**
- `id`: Template ID (number)

**Request Body:** Same as create, but all fields are optional
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "testId": "string (optional)",
  "items": [
    {
      "itemId": "string",
      "quantity": "number"
    }
  ]
}
```

**Success Response (200):** Same as create response

### 6. Delete Inventory Template

**Endpoint:** `DELETE /templates/{id}`

**Description:** Deletes an inventory template and all its associated items.

**Path Parameters:**
- `id`: Template ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Inventory template deleted successfully"
  }
}
```

### 7. Get Template Items

**Endpoint:** `GET /templates/{id}/items`

**Description:** Retrieves all items associated with a specific template.

**Path Parameters:**
- `id`: Template ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_id": 1,
      "itemId": "INV-123456789",
      "quantity": 2.5,
      "created_at": "2025-12-01T10:00:00.000Z",
      "item_name": "Blood Collection Tube",
      "item_sku": "BCT-001",
      "unit": "pieces"
    },
    {
      "id": 2,
      "template_id": 1,
      "itemId": "INV-987654321",
      "quantity": 1.0,
      "created_at": "2025-12-01T10:00:00.000Z",
      "item_name": "Lancet",
      "item_sku": "LANCET-001",
      "unit": "pieces"
    }
  ]
}
```

### 8. Add Item to Template

**Endpoint:** `POST /templates/{id}/items`

**Description:** Adds a new item to an existing template.

**Path Parameters:**
- `id`: Template ID (number)

**Request Body:**
```json
{
  "itemId": "string (required)",
  "quantity": "number (required, positive)"
}
```

**Success Response (201):** Returns the created template item object

### 9. Update Template Item

**Endpoint:** `PUT /templates/{id}/items/{itemId}`

**Description:** Updates a specific item in a template.

**Path Parameters:**
- `id`: Template ID (number)
- `itemId`: Template item ID (number)

**Request Body:**
```json
{
  "itemId": "string (optional)",
  "quantity": "number (optional)"
}
```

**Success Response (200):** Returns the updated template item object

### 10. Remove Item from Template

**Endpoint:** `DELETE /templates/{id}/items/{itemId}`

**Description:** Removes a specific item from a template.

**Path Parameters:**
- `id`: Template ID (number)
- `itemId`: Template item ID (number)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Template item removed successfully"
  }
}
```

### 11. Bulk Get Templates by Test IDs

**Endpoint:** `POST /templates/bulk/test-ids`

**Description:** Retrieves multiple templates by their test IDs in a single request.

**Request Body:**
```json
{
  "testIds": ["string"]
}
```

**Example Request:**
```json
{
  "testIds": ["CBC-001", "LFT-001", "URINE-001"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Complete Blood Count Template",
      "createby": 123,
      "description": "Items required for CBC test",
      "testId": "CBC-001",
      "created_at": "2025-12-01T10:00:00.000Z",
      "updated_at": "2025-12-01T10:00:00.000Z",
      "creator_name": "John Doe",
      "items_count": 2
    }
  ]
}
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error message",
    "details": [
      {
        "field": "field_name",
        "message": "Specific validation message",
        "value": "provided_value"
      }
    ]
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Descriptive error message"
  }
}
```

## Data Types

### InventoryTemplate
```typescript
{
  id: number;
  name: string;
  createby: number;
  description?: string;
  testId: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  items_count?: number;
  items?: InventoryTemplateItem[];
}
```

### InventoryTemplateItem
```typescript
{
  id: number;
  template_id: number;
  itemId: string;
  quantity: number;
  created_at: string;
  item_name?: string;
  item_sku?: string;
  unit?: string;
}
```

## Usage Examples

### Creating a Template for a New Test
1. Create the template with required items
2. The system will automatically deduct these items when the test is performed
3. Items are validated to ensure they exist in inventory

### Updating Template Items
- Use the update endpoint to modify item quantities
- Add new items using the add item endpoint
- Remove items using the remove item endpoint

### Integration with Test System
- Templates are linked by `testId`
- When a test is processed, lookup the template by `testId`
- Deduct the specified quantities from inventory

## Notes

- All monetary values use decimal precision (10,2)
- Quantities support decimal values for partial item usage
- Templates enforce referential integrity with inventory items
- Creator information is automatically populated from the user ID
- All timestamps are in ISO 8601 format