# Purchase Order API Payload Documentation

This document provides comprehensive information about the Purchase Order API endpoints, request/response structures, and requirements for frontend integration.

## Base URL
All endpoints are prefixed with: `inventory`

## Authentication
All requests require a valid tenant ID passed as a query parameter: `?tenantId=<tenant_id>`

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 25,
    "totalPages": 3,
    "sortby": "DESC"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR|INTERNAL_ERROR|NOT_FOUND",
    "message": "Error description",
    "details": [
      {
        "field": "field_name",
        "message": "Validation error message",
        "value": "provided_value"
      }
    ]
  }
}
```

---

## 1. Purchase Orders

### 1.1 Create Purchase Order
**Endpoint:** `POST /orders`

**Description:** Creates a new purchase order with items.

**Request Body:**
```json
{
  "supplier_id": "string (required)",
  "order_date": "string (optional, YYYY-MM-DD format, defaults to today)",
  "expected_delivery_date": "string (optional, YYYY-MM-DD format)",
  "items": [
    {
      "inventory_item_id": "string (required)",
      "quantity_ordered": "number (required, positive)",
      "unit_price": "number (required, non-negative)",
      "tax_rate": "number (optional, 0-100)",
      "discount_rate": "number (optional, 0-100)",
      "notes": "string (optional)"
    }
  ],
  "notes": "string (optional)"
}
```

**Example Request:**
```json
{
  "supplier_id": "SUP-001",
  "expected_delivery_date": "2025-11-20",
  "items": [
    {
      "inventory_item_id": "INV-001",
      "quantity_ordered": 100,
      "unit_price": 5.50,
      "tax_rate": 8.25,
      "discount_rate": 5.0,
      "notes": "Urgent delivery required"
    },
    {
      "inventory_item_id": "INV-002",
      "quantity_ordered": 50,
      "unit_price": 12.00,
      "tax_rate": 8.25
    }
  ],
  "notes": "Monthly restock order"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PO-1731264000000",
    "order_id": "ORD-2025-11-10-0001",
    "supplier_id": "SUP-001",
    "order_date": "2025-11-10",
    "expected_delivery_date": "2025-11-20",
    "status": "ordered",
    "total_amount": 962.50,
    "notes": "Monthly restock order",
    "created_by": null,
    "created_at": "2025-11-10T10:00:00.000Z",
    "updated_at": "2025-11-10T10:00:00.000Z",
    "supplier_name": "ABC Medical Supplies",
    "items_count": 2,
    "received_items_count": 0
  }
}
```

**Validation Rules:**
- `supplier_id`: Must exist and be active
- `items`: Must contain at least one item
- `inventory_item_id`: Must exist and be active
- `quantity_ordered`: Must be positive number
- `unit_price`: Must be non-negative
- `tax_rate` & `discount_rate`: Must be 0-100 if provided

---

### 1.2 Get Purchase Order by ID
**Endpoint:** `GET /orders/:id`

**Description:** Retrieves a specific purchase order with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PO-1731264000000",
    "order_id": "ORD-2025-11-10-0001",
    "supplier_id": "SUP-001",
    "order_date": "2025-11-10",
    "expected_delivery_date": "2025-11-20",
    "status": "ordered",
    "total_amount": 962.50,
    "notes": "Monthly restock order",
    "created_by": null,
    "created_at": "2025-11-10T10:00:00.000Z",
    "updated_at": "2025-11-10T10:00:00.000Z",
    "supplier_name": "ABC Medical Supplies",
    "items_count": 2,
    "received_items_count": 0,
    "items": [
      {
        "id": "POI-1731264000001",
        "order_id": "PO-1731264000000",
        "inventory_item_id": "INV-001",
        "quantity_ordered": 100,
        "quantity_received": 0,
        "unit_price": 5.50,
        "tax_rate": 8.25,
        "discount_rate": 5.0,
        "line_total": 577.88,
        "status": "pending",
        "notes": "Urgent delivery required",
        "created_at": "2025-11-10T10:00:00.000Z",
        "updated_at": "2025-11-10T10:00:00.000Z",
        "item_name": "Test Strip A",
        "item_sku": "TS-A-001",
        "unit": "pieces"
      }
    ]
  }
}
```

---

### 1.3 List Purchase Orders
**Endpoint:** `GET /orders`

**Description:** Retrieves a paginated list of purchase orders with optional filtering.

**Query Parameters:**
- `page`: number (optional, default: 1)
- `count`: number (optional, default: 10)
- `sortby`: "ASC" | "DESC" (optional, default: "DESC")
- `supplier_id`: string (optional)
- `status`: string | string[] (optional)
- `startDate`: string (optional, YYYY-MM-DD)
- `endDate`: string (optional, YYYY-MM-DD)
- `search`: string (optional)

**Example:** `GET /orders?page=1&count=5&status=ordered&supplier_id=SUP-001`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PO-1731264000000",
      "order_id": "ORD-2025-11-10-0001",
      "supplier_id": "SUP-001",
      "order_date": "2025-11-10",
      "expected_delivery_date": "2025-11-20",
      "status": "ordered",
      "total_amount": 962.50,
      "notes": "Monthly restock order",
      "created_by": null,
      "created_at": "2025-11-10T10:00:00.000Z",
      "updated_at": "2025-11-10T10:00:00.000Z",
      "supplier_name": "ABC Medical Supplies",
      "items_count": 2,
      "received_items_count": 0
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

---

### 1.4 Update Purchase Order
**Endpoint:** `PUT /orders/:id`

**Description:** Updates a purchase order (only allowed before receipt processing).

**Request Body:**
```json
{
  "supplier_id": "string (optional)",
  "expected_delivery_date": "string (optional, YYYY-MM-DD)",
  "status": "ordered | partially_received | received | cancelled (optional)",
  "notes": "string (optional)"
}
```

**Example Request:**
```json
{
  "expected_delivery_date": "2025-11-25",
  "notes": "Updated delivery date"
}
```

**Response:** Same as Get Purchase Order by ID

**Restrictions:**
- Cannot update orders that are 'received' or 'cancelled'
- Status can only be set to 'cancelled' (other statuses are managed automatically)

---

### 1.5 Cancel Purchase Order
**Endpoint:** `DELETE /orders/:id/cancel`

**Description:** Cancels a purchase order and all its items.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PO-1731264000000",
    "order_id": "ORD-2025-11-10-0001",
    "supplier_id": "SUP-001",
    "order_date": "2025-11-10",
    "expected_delivery_date": "2025-11-20",
    "status": "cancelled",
    "total_amount": 962.50,
    "notes": "Monthly restock order",
    "created_by": null,
    "created_at": "2025-11-10T10:00:00.000Z",
    "updated_at": "2025-11-10T10:00:01.000Z",
    "supplier_name": "ABC Medical Supplies",
    "items_count": 2,
    "received_items_count": 0
  }
}
```

**Restrictions:**
- Cannot cancel orders that are 'received'
- Cannot cancel orders that have already been partially received

---

### 1.6 Get Purchase Order Items
**Endpoint:** `GET /orders/:id/items`

**Description:** Retrieves all items for a specific purchase order.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "POI-1731264000001",
      "order_id": "PO-1731264000000",
      "inventory_item_id": "INV-001",
      "quantity_ordered": 100,
      "quantity_received": 0,
      "unit_price": 5.50,
      "tax_rate": 8.25,
      "discount_rate": 5.0,
      "line_total": 577.88,
      "status": "pending",
      "notes": "Urgent delivery required",
      "created_at": "2025-11-10T10:00:00.000Z",
      "updated_at": "2025-11-10T10:00:00.000Z",
      "item_name": "Test Strip A",
      "item_sku": "TS-A-001",
      "unit": "pieces"
    }
  ]
}
```

---

## 2. Order Receipt Processing

### 2.1 Process Order Receipt
**Endpoint:** `POST /orders/:id/receive`

**Description:** Processes receipt of ordered items with quality control and inventory updates.

**Request Body:**
```json
{
  "received_by": "string (required)",
  "received_date": "string (optional, YYYY-MM-DD, defaults to today)",
  "receipts": [
    {
      "order_item_id": "string (required)",
      "quantity_received": "number (required, positive)",
      "received_date": "string (optional, YYYY-MM-DD)",
      "batch_number": "string (optional)",
      "expiry_date": "string (optional, YYYY-MM-DD)",
      "unit_price": "number (optional)",
      "tax_rate": "number (optional)",
      "discount_rate": "number (optional)",
      "condition_status": "good | acceptable | damaged | expired (optional, default: good)",
      "quality_check_passed": "boolean (optional, default: true)",
      "notes": "string (optional)"
    }
  ]
}
```

**Example Request:**
```json
{
  "received_by": "john.doe",
  "received_date": "2025-11-10",
  "receipts": [
    {
      "order_item_id": "POI-1731264000001",
      "quantity_received": 100,
      "batch_number": "BATCH-2025-001",
      "expiry_date": "2026-11-10",
      "unit_price": 5.50,
      "condition_status": "good",
      "quality_check_passed": true,
      "notes": "All items in excellent condition"
    }
  ]
}
```

**Business Logic:**
- Only 'good' and 'acceptable' items update inventory stock
- Creates transaction records for all inventory movements
- Updates order and item statuses automatically
- Supports partial receipts

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Order receipt processed successfully",
    "order_status": "received",
    "inventory_updated": true,
    "transactions_created": 1
  }
}
```

---

## 3. Transaction Management

### 3.1 List Transactions
**Endpoint:** `GET /transactions`

**Description:** Retrieves a paginated list of inventory transactions.

**Query Parameters:**
- `page`: number (optional, default: 1)
- `count`: number (optional, default: 10)
- `sortby`: "ASC" | "DESC" (optional, default: "DESC")
- `item_id`: string (optional)
- `transaction_type`: "addition | consumption | adjustment | transfer" (optional)
- `startDate`: string (optional, YYYY-MM-DD)
- `endDate`: string (optional, YYYY-MM-DD)
- `performed_by`: string (optional)
- `batch_number`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "TXN-1731264000000",
      "item_id": "INV-001",
      "transaction_type": "addition",
      "quantity": 100,
      "previous_stock": 50,
      "new_stock": 150,
      "batch_number": "BATCH-2025-001",
      "expiry_date": "2026-11-10",
      "unit_cost": 5.50,
      "total_cost": 550.00,
      "brand_name": "Brand A",
      "reason": "Purchase order receipt",
      "reference_id": "PO-1731264000000",
      "performed_by": "john.doe",
      "transaction_date": "2025-11-10T10:00:00.000Z",
      "notes": "Order receipt processing",
      "created_at": "2025-11-10T10:00:00.000Z",
      "item_name": "Test Strip A",
      "item_sku": "TS-A-001"
    }
  ],
  "pagination": {
    "page": 1,
    "count": 10,
    "total": 1,
    "totalPages": 1,
    "sortby": "DESC"
  }
}
```

---

## 4. Data Types and Enums

### Purchase Order Status
```typescript
type PurchaseOrderStatus = 'ordered' | 'partially_received' | 'received' | 'cancelled';
```

### Purchase Order Item Status
```typescript
type PurchaseOrderItemStatus = 'pending' | 'partially_received' | 'received' | 'cancelled';
```

### Condition Status
```typescript
type ConditionStatus = 'good' | 'acceptable' | 'damaged' | 'expired';
```

### Transaction Type
```typescript
type TransactionType = 'addition' | 'consumption' | 'adjustment' | 'transfer';
```

### Inventory Units
```typescript
type InventoryUnit = 'pieces' | 'boxes' | 'bottles' | 'packs' | 'liters' | 'kg' | 'mg' | 'ml' | 'units' | 'vials' | 'tubes' | 'plates' | 'strips' | 'kits';
```

---

## 5. Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
- `UNAUTHORIZED`: Authentication/authorization error

---

## 6. Business Rules

### Order Creation
- Order numbers are auto-generated: `ORD-YYYY-MM-DD-NNNN`
- Line totals calculated as: `quantity × unit_price × (1 + tax_rate/100) × (1 - discount_rate/100)`
- Order total is sum of all line totals

### Receipt Processing
- Partial receipts are allowed
- Only 'good' and 'acceptable' items update inventory
- Transaction records are created for all inventory movements
- Order status updates automatically based on item completion

### Status Progression
- Order: `ordered` → `partially_received` → `received`
- Items: `pending` → `partially_received` → `received`

### Inventory Updates
- Stock levels are updated in real-time
- Batch and expiry information is tracked
- All changes are logged in transaction history

---

## 7. Frontend Integration Notes

### Required Headers
```javascript
headers: {
  'Content-Type': 'application/json',
  // Add authentication headers as required by your system
}
```

### Query Parameters
Always include `tenantId` in query parameters for multi-tenant support:
```javascript
const response = await fetch('/api/v1/inventory/orders?tenantId=123', {
  // ... request config
});
```

### Date Format
All dates should be in `YYYY-MM-DD` format:
```javascript
const orderData = {
  expected_delivery_date: '2025-11-20', // Correct
  // expected_delivery_date: '11/20/2025', // Incorrect
};
```

### Error Handling
```javascript
try {
  const response = await fetch('/api/v1/inventory/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();

  if (!result.success) {
    // Handle error
    console.error(result.error.message);
    if (result.error.details) {
      result.error.details.forEach(detail => {
        console.error(`${detail.field}: ${detail.message}`);
      });
    }
  } else {
    // Handle success
    console.log('Order created:', result.data);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Pagination
Handle pagination for list endpoints:
```javascript
const fetchOrders = async (page = 1, filters = {}) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    count: '10',
    sortby: 'DESC',
    tenantId: '123',
    ...filters
  });

  const response = await fetch(`/api/v1/inventory/orders?${queryParams}`);
  const result = await response.json();

  return {
    orders: result.data,
    pagination: result.pagination
  };
};
```

This documentation covers all current API endpoints. Additional endpoints for receipts management and advanced transaction features will be added as the system evolves.