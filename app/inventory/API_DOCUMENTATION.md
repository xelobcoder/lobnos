# Inventory Management API Documentation

This document provides comprehensive API documentation for the Inventory Management System. All endpoints require proper authentication and tenant identification.

## Base URL
```
/api/inventory
```

## Authentication & Headers
All requests require the following headers:
- `x-tenant-id`: Tenant identifier (number)
- `Authorization`: Bearer token (if authentication is enabled)

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data provided",
    "details": [
      {
        "field": "name",
        "message": "Name is required",
        "value": ""
      }
    ]
  }
}
```

---

## Brands API

### Create Brand
**POST** `/brands`

Creates a new brand.

**Request Body:**
```json
{
  "name": "Roche Diagnostics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BRAND-1731177600000-abc123",
    "name": "Roche Diagnostics",
    "created_date": "2025-11-09",
    "item_count": 0,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z"
  }
}
```

### Get Brand by ID
**GET** `/brands/{id}`

Retrieves a specific brand by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BRAND-1731177600000-abc123",
    "name": "Roche Diagnostics",
    "created_date": "2025-11-09",
    "item_count": 5,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z"
  }
}
```

### List Brands
**GET** `/brands`

Retrieves a paginated list of brands.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `count` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by brand name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "BRAND-1731177600000-abc123",
      "name": "Roche Diagnostics",
      "created_date": "2025-11-09",
      "item_count": 5,
      "created_at": "2025-11-09T12:00:00.000Z",
      "updated_at": "2025-11-09T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Update Brand
**PUT** `/brands/{id}`

Updates an existing brand.

**Request Body:**
```json
{
  "name": "Roche Diagnostics GmbH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "BRAND-1731177600000-abc123",
    "name": "Roche Diagnostics GmbH",
    "created_date": "2025-11-09",
    "item_count": 5,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:05:00.000Z"
  }
}
```

### Delete Brand
**DELETE** `/brands/{id}`

Deletes a brand (only if no items are associated).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Brand deleted successfully"
  }
}
```

### Get Brand Statistics
**GET** `/brands-stats`

Retrieves brand statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_brands": 10,
    "total_items": 150,
    "average_items_per_brand": 15.0
  }
}
```

---

## Categories API

### Create Category
**POST** `/categories`

Creates a new category.

**Request Body:**
```json
{
  "name": "Reagents",
  "description": "Chemical reagents for laboratory testing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "CAT-1731177600000-def456",
    "name": "Reagents",
    "description": "Chemical reagents for laboratory testing",
    "item_count": 0,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z"
  }
}
```

### Get Category by ID
**GET** `/categories/{id}`

Retrieves a specific category by ID.

### List Categories
**GET** `/categories`

Retrieves a paginated list of categories.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `count` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by category name or description

### Update Category
**PUT** `/categories/{id}`

Updates an existing category.

**Request Body:**
```json
{
  "name": "Laboratory Reagents",
  "description": "Updated description for laboratory reagents"
}
```

### Delete Category
**DELETE** `/categories/{id}`

Deletes a category (only if no items are associated).

---

## Suppliers API

### Create Supplier
**POST** `/suppliers`

Creates a new supplier.

**Request Body:**
```json
{
  "name": "Medical Supplies Inc.",
  "contact": "John Doe",
  "email": "john@medsupplies.com",
  "phone": "+1-555-0123",
  "address": "123 Medical St, Health City, HC 12345",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SUP-1731177600000-ghi789",
    "name": "Medical Supplies Inc.",
    "contact": "John Doe",
    "email": "john@medsupplies.com",
    "phone": "+1-555-0123",
    "address": "123 Medical St, Health City, HC 12345",
    "is_active": true,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z"
  }
}
```

### Get Supplier by ID
**GET** `/suppliers/{id}`

Retrieves a specific supplier by ID.

### List Suppliers
**GET** `/suppliers`

Retrieves a paginated list of suppliers.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `count` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by supplier name

### Update Supplier
**PUT** `/suppliers/{id}`

Updates an existing supplier.

### Delete Supplier
**DELETE** `/suppliers/{id}`

Deletes a supplier.

---

## Storage Locations API

### Create Storage Location
**POST** `/storage-locations`

Creates a new storage location.

**Request Body:**
```json
{
  "name": "Refrigerator A",
  "description": "Temperature controlled refrigerator for sensitive reagents",
  "capacity": 100,
  "temperature_controlled": true,
  "hazardous_materials": false,
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "LOC-1731177600000-jkl012",
    "name": "Refrigerator A",
    "description": "Temperature controlled refrigerator for sensitive reagents",
    "capacity": 100,
    "temperature_controlled": true,
    "hazardous_materials": false,
    "is_active": true,
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z"
  }
}
```

### Get Storage Location by ID
**GET** `/storage-locations/{id}`

Retrieves a specific storage location by ID.

### List Storage Locations
**GET** `/storage-locations`

Retrieves a paginated list of storage locations.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `count` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by location name

### Update Storage Location
**PUT** `/storage-locations/{id}`

Updates an existing storage location.

### Delete Storage Location
**DELETE** `/storage-locations/{id}`

Deletes a storage location.

---

## Inventory Items API

### Create Inventory Item
**POST** `/items`

Creates a new inventory item.

**Request Body:**
```json
{
  "name": "Glucose Test Strips",
  "sku": "GLUCOSE-001",
  "description": "Blood glucose monitoring test strips",
  "category_id": "CAT-1731177600000-def456",
  "brand_id": "BRAND-1731177600000-abc123",
  "supplier_id": "SUP-1731177600000-ghi789",
  "unit": "strips",
  "current_stock": 500,
  "min_stock": 50,
  "max_stock": 1000,
  "unit_price": 0.25,
  "location_id": "LOC-1731177600000-jkl012",
  "expiry_date": "2026-11-09",
  "batch_number": "BATCH-2025-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ITEM-1731177600000-mno345",
    "name": "Glucose Test Strips",
    "sku": "GLUCOSE-001",
    "description": "Blood glucose monitoring test strips",
    "category_id": "CAT-1731177600000-def456",
    "brand_id": "BRAND-1731177600000-abc123",
    "supplier_id": "SUP-1731177600000-ghi789",
    "unit": "strips",
    "current_stock": 500,
    "min_stock": 50,
    "max_stock": 1000,
    "unit_price": 0.25,
    "total_value": 125.00,
    "location_id": "LOC-1731177600000-jkl012",
    "expiry_date": "2026-11-09",
    "batch_number": "BATCH-2025-001",
    "status": "in_stock",
    "is_active": true,
    "last_updated": "2025-11-09T12:00:00.000Z",
    "created_at": "2025-11-09T12:00:00.000Z",
    "updated_at": "2025-11-09T12:00:00.000Z",
    "category_name": "Reagents",
    "brand_name": "Roche Diagnostics",
    "supplier_name": "Medical Supplies Inc.",
    "location_name": "Refrigerator A"
  }
}
```

### Get Inventory Item by ID
**GET** `/items/{id}`

Retrieves a specific inventory item by ID.

### List Inventory Items
**GET** `/items`

Retrieves a paginated list of inventory items with advanced filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `count` (number, optional): Items per page (default: 10)
- `category_id` (string, optional): Filter by category
- `brand_id` (string, optional): Filter by brand
- `supplier_id` (string, optional): Filter by supplier
- `location_id` (string, optional): Filter by storage location
- `status` (string, optional): Filter by status (`in_stock`, `low_stock`, `out_of_stock`, `expired`)
- `search` (string, optional): Search by name or SKU

### Update Inventory Item
**PUT** `/items/{id}`

Updates an existing inventory item.

### Delete Inventory Item
**DELETE** `/items/{id}`

Deletes an inventory item.

### Get Low Stock Alerts
**GET** `/items-alerts/low-stock`

Retrieves items that are below minimum stock levels.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "item_id": "ITEM-1731177600000-mno345",
      "item_name": "Glucose Test Strips",
      "sku": "GLUCOSE-001",
      "current_stock": 25,
      "min_stock": 50,
      "supplier_name": "Medical Supplies Inc.",
      "last_updated": "2025-11-09T12:00:00.000Z"
    }
  ]
}
```

### Get Expiring Items
**GET** `/items-alerts/expiring`

Retrieves items that are expiring soon.

**Query Parameters:**
- `days` (number, optional): Days until expiry threshold (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "item_id": "ITEM-1731177600000-mno345",
      "item_name": "Glucose Test Strips",
      "sku": "GLUCOSE-001",
      "expiry_date": "2025-11-15",
      "days_until_expiry": 6,
      "current_stock": 500
    }
  ]
}
```

### Get Inventory Summary
**GET** `/items-summary`

Retrieves overall inventory statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_items": 150,
    "total_value": 25000.00,
    "low_stock_items": 5,
    "expired_items": 2,
    "out_of_stock_items": 3,
    "categories_count": 8,
    "suppliers_count": 12,
    "pending_orders": 3
  }
}
```

---

## Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions

## Data Types

### Inventory Units
- `pieces`, `boxes`, `bottles`, `packs`, `liters`, `kg`, `mg`, `ml`, `units`, `vials`, `tubes`, `plates`, `strips`, `kits`

### Inventory Status
- `in_stock`: Item is available
- `low_stock`: Below minimum stock level
- `out_of_stock`: No stock remaining
- `expired`: Item has expired

### Purchase Order Status
- `draft`: Order being prepared
- `sent`: Order sent to supplier
- `confirmed`: Supplier confirmed order
- `partially_received`: Some items received
- `received`: All items received
- `cancelled`: Order cancelled

### Transaction Types
- `consumption`: Items used/consumed
- `addition`: Items added to inventory
- `adjustment`: Stock level correction
- `transfer`: Items moved between locations

## Notes

1. All dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
2. IDs are auto-generated UUID-style strings
3. Pagination starts from page 1
4. Search is case-insensitive and supports partial matches
5. All monetary values are in the system's base currency
6. Stock levels are automatically updated based on transactions
7. Item counts on brands/categories are maintained automatically