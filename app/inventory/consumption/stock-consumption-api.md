# Stock Consumption API Guide

## Overview

The Stock Consumption API provides comprehensive functionality for tracking and managing inventory consumption across different scenarios including manual deductions, automatic test consumptions, and wastage recording. All consumption operations are tracked as inventory transactions with full audit trails.

## Base URL
```
/api/inventory/transactions
```

## Authentication
All endpoints require tenant ID to be passed as a query parameter: `?tenantId={number}`

## Endpoints

### 1. Manual Stock Consumption

**POST** `/consume`

Records manual consumption of inventory items.

**Request Body:**
```json
{
  "item_id": "INV-001",
  "quantity": 5,
  "reason": "Used for lab preparation",
  "batch_number": "BATCH-2025-001",
  "performed_by": 123,
  "notes": "Optional additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TXN-1735689600000",
    "item_id": "INV-001",
    "transaction_type": "consumption",
    "quantity": 5,
    "previous_stock": 100,
    "new_stock": 95,
    "reason": "Used for lab preparation",
    "batch_number": "BATCH-2025-001",
    "performed_by": 123,
    "transaction_date": "2025-01-01T12:00:00.000Z",
    "notes": "Optional additional notes",
    "stock_remaining": 95
  }
}
```

### 2. Bulk Stock Consumption

**POST** `/consume/bulk`

Records multiple consumption transactions in a single request.

**Request Body:**
```json
{
  "consumptions": [
    {
      "item_id": "INV-001",
      "quantity": 3,
      "reason": "Quality control testing",
      "performed_by": 456
    },
    {
      "item_id": "INV-002",
      "quantity": 2,
      "reason": "Sample preparation",
      "batch_number": "BATCH-2025-002",
      "performed_by": 456
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "TXN-1735689600001",
      "item_id": "INV-001",
      "transaction_type": "consumption",
      "quantity": 3,
      "previous_stock": 50,
      "new_stock": 47,
      "reason": "Quality control testing",
      "performed_by": 456,
      "transaction_date": "2025-01-01T12:00:00.000Z"
    },
    {
      "id": "TXN-1735689600002",
      "item_id": "INV-002",
      "transaction_type": "consumption",
      "quantity": 2,
      "previous_stock": 25,
      "new_stock": 23,
      "reason": "Sample preparation",
      "batch_number": "BATCH-2025-002",
      "performed_by": 456,
      "transaction_date": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

### 3. Automatic Test Consumption

**POST** `/consume/test`

Automatically records consumption when tests are performed. Typically called by test execution systems.

**Request Body:**
```json
{
  "test_id": "TEST-2025-001",
  "item_id": "INV-001",
  "quantity_used": 1,
  "test_type": "Blood Glucose Test",
  "patient_id": 12345,
  "ascension_id": 67890,
  "testid": 11111,
  "performed_by": 789,
  "batch_number": "BATCH-2025-001",
  "notes": "Patient ID: 12345"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TXN-1735689600003",
    "item_id": "INV-001",
    "transaction_type": "consumption",
    "quantity": 1,
    "previous_stock": 47,
    "new_stock": 46,
    "reason": "Test consumption - Blood Glucose Test",
    "reference_id": "TEST-2025-001",
    "patient_id": 12345,
    "ascension_id": 67890,
    "testid": 11111,
    "batch_number": "BATCH-2025-001",
    "performed_by": 789,
    "transaction_date": "2025-01-01T12:00:00.000Z",
    "notes": "Patient ID: 12345",
    "stock_remaining": 46
  }
}
```

### 4. Record Wastage

**POST** `/wastage`

Records inventory wastage (expired, damaged, or spoiled items).

**Request Body:**
```json
{
  "item_id": "INV-001",
  "quantity": 2,
  "reason": "Expired reagents",
  "batch_number": "BATCH-2024-050",
  "performed_by": 101,
  "notes": "Batch expired on 2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "TXN-1735689600004",
    "item_id": "INV-001",
    "transaction_type": "consumption",
    "quantity": 2,
    "previous_stock": 46,
    "new_stock": 44,
    "reason": "Wastage - Expired reagents",
    "batch_number": "BATCH-2024-050",
    "performed_by": 101,
    "transaction_date": "2025-01-01T12:00:00.000Z",
    "notes": "Batch expired on 2024-12-31",
    "stock_remaining": 44
  }
}
```

### 5. Get Consumption Transactions

**GET** `/consumption/list`

Retrieves all consumption transactions with optional filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `count`: Items per page (default: 10)
- `sortby`: Sort order - 'ASC' or 'DESC' (default: 'DESC')
- `item_id`: Filter by specific item
- `performed_by`: Filter by user who performed consumption
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `batch_number`: Filter by batch number

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 25,
    "page": 1,
    "count": 10,
    "totalPages": 3,
    "sortby": "DESC"
  },
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 25,
    "totalPages": 3,
    "sortby": "DESC"
  }
}
```

### 6. Get Consumption Report

**GET** `/consumption/report`

Retrieves comprehensive consumption reports with filtering and summary statistics.

**Query Parameters:**
- `page`: Page number (default: 1)
- `count`: Items per page (default: 10)
- `sortby`: Sort order - 'ASC' or 'DESC' (default: 'DESC')
- `item_id`: Filter by specific item
- `performed_by`: Filter by user who performed consumption
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `reason`: Filter by reason text

**Response:**
```json
{
  "success": true,
  "data": {
    "consumptions": [
      {
        "id": "TXN-1735689600001",
        "item_id": "INV-001",
        "item_name": "Glucose Test Strips",
        "item_sku": "GTS-001",
        "consumption_type": "manual",
        "quantity": 5,
        "reason": "Used for lab preparation",
        "batch_number": "BATCH-2025-001",
        "patient_id": 12345,
        "ascension_id": 67890,
        "testid": 11111,
        "performed_by": 123,
        "transaction_date": "2025-01-01T12:00:00.000Z",
        "notes": "Optional additional notes"
      }
    ],
    "total": 1,
    "page": 1,
    "count": 10,
    "totalPages": 1,
    "sortby": "DESC",
    "summary": {
      "total_consumptions": 1,
      "manual_consumptions": 1,
      "test_consumptions": 0,
      "wastage_consumptions": 0,
      "total_quantity_consumed": 5,
      "period_start": "2024-12-01",
      "period_end": "2025-01-01"
    }
  },
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 1,
    "totalPages": 1,
    "sortby": "DESC"
  }
}
```

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Quantity must be greater than 0"
  }
}
```

### Insufficient Stock
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock. Requested: 10, Available: 5"
  }
}
```

### Item Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Inventory item not found or inactive"
  }
}
```

## Business Rules

1. **Stock Validation**: All consumption requests validate available stock before processing
2. **Transaction Logging**: Every consumption creates a complete audit trail
3. **Batch Tracking**: Optional batch number tracking for traceability
4. **Employee Tracking**: All consumptions are attributed to specific users
5. **Patient Tracking**: Test consumptions require patient_id and ascension_id for proper tracking
6. **Reason Documentation**: Consumption reasons help categorize usage types
7. **Automatic Updates**: Inventory stock levels are automatically updated
8. **Type Classification**: Consumptions are automatically classified as manual, test, or wastage

## Integration Examples

### JavaScript/Node.js
```javascript
// Manual consumption
const response = await fetch('/api/inventory/transactions/consume?tenantId=1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    item_id: 'INV-001',
    quantity: 5,
    reason: 'Lab testing',
    performed_by: 123
  })
});

// Automatic test consumption
const testResponse = await fetch('/api/inventory/transactions/consume/test?tenantId=1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    test_id: 'TEST-001',
    item_id: 'INV-001',
    quantity_used: 1,
    test_type: 'Glucose Test',
    patient_id: 12345,
    ascension_id: 67890,
    performed_by: 789
  })
});
```

### Python
```python
import requests

# Manual consumption
response = requests.post(
    '/api/inventory/transactions/consume?tenantId=1',
    json={
        'item_id': 'INV-001',
        'quantity': 5,
        'reason': 'Lab testing',
        'performed_by': 123
    }
)

# Get consumption report
report = requests.get(
    '/api/inventory/transactions/consumption/report?tenantId=1&startDate=2025-01-01'
)
```

## Data Types

- **Consumption Types**: `manual`, `test`, `wastage`
- **Quantities**: Positive integers only
- **Dates**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **User IDs**: Numeric employee identifiers
- **Patient IDs**: Integer patient identifiers (required for test consumption)
- **Ascension IDs**: Integer ascension identifiers (required for test consumption)
- **Test IDs**: Integer test identifiers (optional for test consumption)
- **Batch Numbers**: Optional string identifiers for batch tracking
- **Reasons**: Free text descriptions of consumption purpose

## Performance Considerations

- Bulk operations are preferred for multiple consumptions
- Reports support pagination for large datasets
- Database indexes optimize common query patterns
- Transaction isolation ensures data consistency</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server\docs\stock-consumption-api.md