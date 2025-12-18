# Inventory Unit Conversion System - API Documentation

## Overview

The Inventory Unit Conversion System has been redesigned to handle flexible purchasing scenarios where different suppliers provide varying quantities per package. The system now separates consumption units (what you actually use) from purchase units (how items are packaged by suppliers) through a comprehensive purchase order workflow.

*Last Updated: December 18, 2025*

## Key Changes (December 2025)

### Architecture Changes

1. **Purchase Order Integration**
   - Complete procurement workflow with suppliers, orders, and receipts
   - Unit conversion happens during order receipt, not during item creation
   - Proper audit trail for all inventory movements

2. **Item-Level vs Transaction-Level Conversion**
   - **Before**: Items stored `purchase_unit`, `consumption_unit`, and `units_per_purchase_unit`
   - **After**: Items store only `consumption_unit`; conversions happen at receipt level

3. **Flexible Supplier Packaging**
   - Each purchase transaction can specify different package sizes
   - Example: Supplier A provides EDTA tubes in boxes of 100, Supplier B provides boxes of 300

4. **Stock Tracking**
   - All stock is tracked in consumption units internally
   - Automatic conversion during order receipt transactions

5. **Database Standardization**
   - Integer auto-incrementing unit IDs
   - DECIMAL(10,2) for monetary values
   - int(10) unsigned for quantities

## API Endpoints

### Base URL
```
/api/v1/inventory
```

### Authentication
All endpoints require `tenantId` as a query parameter: `?tenantId={number}`

---

## Purchase Order Management

### 1. Create Purchase Order

**POST** `/orders`

Creates a new purchase order with items that can have unit conversion during receipt.

### Request Body
```json
{
  "supplier_id": "SUP-123456789",
  "order_date": "2025-12-18",
  "expected_delivery_date": "2025-12-25",
  "notes": "Monthly reagent supply",
  "items": [
    {
      "inventory_item_id": "INV-123456789",
      "quantity_ordered": 10,
      "unit_price": 25.50,
      "tax_rate": 0,
      "discount_rate": 0,
      "notes": "EDTA tubes for hematology"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "PO-20251218-1234",
    "order_number": "ORD-20251218-1234",
    "supplier_id": "SUP-123456789",
    "supplier_name": "LabCorp Supplies",
    "status": "pending",
    "order_date": "2025-12-18",
    "expected_delivery_date": "2025-12-25",
    "total_amount": 255.00,
    "notes": "Monthly reagent supply",
    "items_count": 1,
    "received_items_count": 0,
    "created_at": "2025-12-18T10:00:00.000Z",
    "updated_at": "2025-12-18T10:00:00.000Z",
    "items": [
      {
        "id": "POI-17345184000001",
        "order_id": "PO-20251218-1234",
        "inventory_item_id": "INV-123456789",
        "item_name": "EDTA Tubes",
        "quantity_ordered": 10,
        "quantity_received": 0,
        "unit_price": 25.50,
        "line_total": 255.00,
        "status": "pending"
      }
    ]
  }
}
```

---

### 2. Get Purchase Orders

**GET** `/orders`

Retrieves purchase orders with optional filtering.

### Query Parameters
- `tenantId` (required): Tenant identifier
- `page` (optional): Page number (default: 1)
- `count` (optional): Items per page (default: 10)
- `supplier_id` (optional): Filter by supplier
- `status` (optional): Filter by status (`pending`, `partially_received`, `received`, `cancelled`)
- `startDate` (optional): Filter by order date (YYYY-MM-DD)
- `endDate` (optional): Filter by order date (YYYY-MM-DD)
- `search` (optional): Search in order number or notes

### Response
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "PO-20251218-1234",
        "order_number": "ORD-20251218-1234",
        "supplier_name": "LabCorp Supplies",
        "status": "pending",
        "order_date": "2025-12-18",
        "total_amount": 255.00,
        "items_count": 1,
        "received_items_count": 0
      }
    ],
    "total": 1,
    "page": 1,
    "count": 10,
    "totalPages": 1
  }
}
```

---

### 3. Get Purchase Order by ID

**GET** `/orders/{id}`

Retrieves a specific purchase order with full details.

### Response
```json
{
  "success": true,
  "data": {
    "id": "PO-20251218-1234",
    "order_number": "ORD-20251218-1234",
    "supplier_id": "SUP-123456789",
    "supplier_name": "LabCorp Supplies",
    "status": "pending",
    "order_date": "2025-12-18",
    "expected_delivery_date": "2025-12-25",
    "total_amount": 255.00,
    "notes": "Monthly reagent supply",
    "items_count": 1,
    "received_items_count": 0,
    "created_at": "2025-12-18T10:00:00.000Z",
    "updated_at": "2025-12-18T10:00:00.000Z",
    "items": [
      {
        "id": "POI-17345184000001",
        "inventory_item_id": "INV-123456789",
        "item_name": "EDTA Tubes",
        "quantity_ordered": 10,
        "quantity_received": 0,
        "unit_price": 25.50,
        "line_total": 255.00,
        "status": "pending"
      }
    ]
  }
}
```

---

### 4. Receive Purchase Order

**POST** `/orders/{id}/receive`

Receives items from a purchase order with unit conversion support. This is where unit conversion happens - purchase units are converted to consumption units and added to inventory stock.

### Request Body
```json
{
  "received_by": 123,
  "received_date": "2025-12-18",
  "receipts": [
    {
      "order_item_id": "POI-17345184000001",
      "quantity_received": 10,
      "batch_number": "BATCH-2025-001",
      "expiry_date": "2026-12-18",
      "unit_price": 25.50,
      "condition_status": "good",
      "quality_check_passed": true,
      "notes": "Received in good condition",
      "purchase_unit": "bottles",
      "units_per_purchase_unit": 5000
    }
  ]
}
```

### Unit Conversion Logic

When `purchase_unit` and `units_per_purchase_unit` are provided:
- `quantity_received` × `units_per_purchase_unit` = consumption units added to stock
- Example: 10 bottles × 5000 ml/bottle = 50,000 ml added to stock

When not provided, assumes direct consumption unit receipt.

### Response
```json
{
  "success": true,
  "data": {
    "id": "PO-20251218-1234",
    "order_number": "ORD-20251218-1234",
    "supplier_name": "LabCorp Supplies",
    "status": "received",
    "total_amount": 255.00,
    "items_count": 1,
    "received_items_count": 1,
    "payment_history": [],
    "total_paid": 0,
    "total_pending": 0,
    "remaining_balance": 255.00,
    "items": [
      {
        "id": "POI-17345184000001",
        "inventory_item_id": "INV-123456789",
        "item_name": "EDTA Tubes",
        "quantity_ordered": 10,
        "quantity_received": 10,
        "unit_price": 25.50,
        "line_total": 255.00,
        "status": "received"
      }
    ]
  }
}
```

---

### 5. Get Purchase Order Items

**GET** `/orders/{id}/items`

Retrieves all items for a specific purchase order.

### Response
```json
{
  "success": true,
  "data": {
    "order_id": "PO-20251218-1234",
    "order_number": "ORD-20251218-1234",
    "items": [
      {
        "id": "POI-17345184000001",
        "inventory_item_id": "INV-123456789",
        "item_name": "EDTA Tubes",
        "quantity_ordered": 10,
        "quantity_received": 10,
        "unit_price": 25.50,
        "line_total": 255.00,
        "status": "received"
      }
    ]
  }
}
```

---

### 6. Update Purchase Order

**PUT** `/orders/{id}`

Updates a purchase order (only if not received or cancelled).

### Request Body
```json
{
  "expected_delivery_date": "2025-12-26",
  "notes": "Updated delivery date"
}
```

---

### 7. Cancel Purchase Order

**DELETE** `/orders/{id}/cancel`

Cancels a purchase order (only if not received).

### Response
```json
{
  "success": true,
  "message": "Purchase order cancelled successfully"
}
```

---

### 8. Get Received Orders Report

**GET** `/orders/received/report`

Retrieves a report of all received purchase orders.

### Query Parameters
- `tenantId` (required): Tenant identifier
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `supplier_id` (optional): Filter by supplier

---

## 1. Create Inventory Item

## 1. Create Inventory Item

**POST** `/items`

Creates a new inventory item with consumption unit specification.

### Request Body
```json
{
  "name": "string (required, max 100 chars)",
  "sku": "string (optional, max 50 chars, unique)",
  "description": "string (optional, max 1000 chars)",
  "category_id": "string (required)",
  "consumption_unit": "string (required, e.g., 'pieces', 'tubes', 'ml')",
  "current_stock": "number (optional, default 0)",
  "min_stock": "number (optional, default 0)",
  "max_stock": "number (optional, default 0)",
  "location_id": "string (optional)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "INV-123456789",
    "name": "EDTA Tubes",
    "sku": "EDTA-001",
    "description": "Purple top EDTA tubes for hematology",
    "category_id": "CAT-001",
    "consumption_unit": "tubes",
    "current_stock": 0,
    "min_stock": 50,
    "max_stock": 500,
    "location_id": "LOC-001",
    "status": "out_of_stock",
    "is_active": true,
    "last_updated": "2025-12-18T10:00:00.000Z",
    "created_at": "2025-12-18T10:00:00.000Z",
    "updated_at": "2025-12-18T10:00:00.000Z",
    "category_name": "Hematology Supplies",
    "location_name": "Main Lab Storage",
    "consumption_unit_name": "Tubes"
  }
}
```

---

## 2. Update Inventory Item

**PUT** `/items/{id}`

Updates an existing inventory item. Note: Only consumption_unit can be changed; purchase units are handled at transaction level.

### Request Body
```json
{
  "name": "string (optional)",
  "sku": "string (optional)",
  "description": "string (optional)",
  "category_id": "string (optional)",
  "consumption_unit": "string (optional)",
  "current_stock": "number (optional)",
  "min_stock": "number (optional)",
  "max_stock": "number (optional)",
  "location_id": "string (optional)",
  "is_active": "boolean (optional)"
}
```

---

## 3. Create Inventory Transaction

**POST** `/transactions`

Creates a new inventory transaction with unit conversion support.

### Request Body for Purchase (Addition)
```json
{
  "item_id": "INV-123456789",
  "transaction_type": "addition",
  "unit_type": "purchase",
  "quantity": 2,
  "purchase_unit": "boxes",
  "units_per_purchase_unit": 100,
  "batch_number": "BATCH-2025-001",
  "expiry_date": "2026-12-18",
  "unit_cost": 25.50,
  "brand_name": "LabCorp",
  "performed_by": 123,
  "notes": "Received from Supplier A - 100 tubes per box"
}
```

### Request Body for Consumption
```json
{
  "item_id": "INV-123456789",
  "transaction_type": "consumption",
  "unit_type": "consumption",
  "quantity": 5,
  "batch_number": "BATCH-2025-001",
  "performed_by": 123,
  "reason": "CBC Test",
  "notes": "Used for patient testing"
}
```

### Unit Conversion Logic

When `unit_type` is `"purchase"`:
- `quantity` × `units_per_purchase_unit` = consumption units added to stock
- Example: 2 boxes × 100 tubes/box = 200 tubes added to stock

When `unit_type` is `"consumption"`:
- `quantity` = consumption units (no conversion needed)

### Response
```json
{
  "success": true,
  "data": {
    "id": "TXN-1734518400000",
    "item_id": "INV-123456789",
    "transaction_type": "addition",
    "quantity": 2,
    "unit_type": "purchase",
    "purchase_unit": "boxes",
    "units_per_purchase_unit": 100,
    "previous_stock": 50,
    "new_stock": 250,
    "batch_number": "BATCH-2025-001",
    "expiry_date": "2026-12-18T00:00:00.000Z",
    "unit_cost": 25.50,
    "total_cost": 51.00,
    "performed_by": 123,
    "transaction_date": "2025-12-18T10:00:00.000Z",
    "notes": "Received from Supplier A - 100 tubes per box"
  }
}
```

---

## 4. Get Inventory Items

**GET** `/items`

Retrieves inventory items with optional filtering.

### Query Parameters
- `tenantId` (required): Tenant identifier
- `page` (optional): Page number (default: 1)
- `count` (optional): Items per page (default: 10)
- `category_id` (optional): Filter by category
- `location_id` (optional): Filter by storage location
- `status` (optional): Filter by status (`in_stock`, `low_stock`, `out_of_stock`)
- `search` (optional): Search in name, SKU, description
- `low_stock_only` (optional): `true` to show only low stock items
- `startDate` (optional): Filter by creation date (YYYY-MM-DD)
- `endDate` (optional): Filter by creation date (YYYY-MM-DD)

### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "INV-123456789",
        "name": "EDTA Tubes",
        "sku": "EDTA-001",
        "description": "Purple top EDTA tubes",
        "category_id": "CAT-001",
        "consumption_unit": "tubes",
        "current_stock": 250,
        "min_stock": 50,
        "max_stock": 500,
        "location_id": "LOC-001",
        "status": "in_stock",
        "is_active": true,
        "category_name": "Hematology Supplies",
        "location_name": "Main Lab Storage",
        "consumption_unit_name": "Tubes"
      }
    ],
    "total": 1,
    "page": 1,
    "count": 10,
    "totalPages": 1
  }
}
```

---

## 5. Get Low Stock Alerts

**GET** `/items-alerts/low-stock`

Retrieves items that are below minimum stock levels.

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "INV-123456789",
      "name": "EDTA Tubes",
      "sku": "EDTA-001",
      "consumption_unit": "tubes",
      "current_stock": 25,
      "min_stock": 50,
      "max_stock": 500,
      "status": "low_stock",
      "category_name": "Hematology Supplies",
      "location_name": "Main Lab Storage"
    }
  ]
}
```

---

## Unit System

### Supported Units
The system supports various unit types categorized as:
- **Count**: `pieces`, `boxes`, `bottles`, `packs`, `units`, `vials`, `tubes`, `plates`, `strips`, `kits`
- **Weight**: `kg`, `mg`
- **Volume**: `liters`, `ml`

### Unit Management Endpoints

#### 1. Get Available Units

**GET** `/units`

Retrieves all available units (both standard and custom).

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pieces",
      "description": "Individual pieces or items",
      "category": "count",
      "is_standard": true
    },
    {
      "id": 2,
      "name": "Boxes",
      "description": "Standard cardboard boxes",
      "category": "count",
      "is_standard": true
    },
    {
      "id": 3,
      "name": "Kilograms",
      "description": "Weight in kilograms",
      "category": "weight",
      "is_standard": true
    }
  ]
}
```

#### 2. Create Custom Unit

**POST** `/units`

Creates a new custom unit for the tenant.

### Request Body
```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 1000 chars)",
  "category": "count | weight | volume | custom (required)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "Custom Unit",
    "description": "A custom unit for special items",
    "category": "custom",
    "is_standard": false
  },
  "message": "Custom unit created successfully"
}
```

#### 3. Validate Unit

**GET** `/units/{unitId}/validate`

Validates if a unit exists and returns its details.

### Response
```json
{
  "success": true,
  "data": {
    "exists": true,
    "unit": {
      "id": 1,
      "name": "Pieces",
      "description": "Individual pieces or items",
      "category": "count",
      "is_standard": true
    }
  }
}
```

### Unit Design Philosophy
- **Single Global Table**: All units are stored in one `inv_units` table with integer auto-incrementing IDs
- **Flexible Usage**: Any unit can be used for both consumption and purchase operations
- **Receipt-Level Conversion**: Purchase packaging is defined per receipt, not per item
- **Standard + Custom**: System provides standard units, but allows custom units to be added

### Unit Categories and Usage Examples

| Unit | Category | Consumption Example | Purchase Example |
|------|----------|-------------------|------------------|
| `pieces` | count | 1 EDTA tube used | N/A (not typically purchased as individual pieces) |
| `tubes` | count | 5 tubes used for CBC | 100 tubes per box from Supplier A |
| `boxes` | count | N/A (not consumed as boxes) | 2 boxes received, 300 tubes total |
| `bottles` | count | 1 reagent bottle used | 50ml bottles, 10 per case |
| `ml` | volume | 2ml reagent used | 500ml bottles, 20 per pallet |
| `kg` | weight | 0.5kg chemical used | 25kg drums, 4 per shipment |

### Unit Validation
- All units must exist in the system
- Quantities must be positive numbers
- Decimal precision varies by unit type

## Migration Notes

### Database Changes
- **Items table**: Removed `purchase_unit`, `units_per_purchase_unit` columns; kept `consumption_unit`
- **Purchase Orders**: New tables `inv_purchase_orders`, `inv_purchase_order_items`, `inv_purchase_order_receipts`
- **Transactions table**: Added `unit_type`, `purchase_unit`, `units_per_purchase_unit` columns
- **Units table**: `inv_units` with integer auto-incrementing IDs, removed category field
- **Standardized data types**: All decimals as DECIMAL(10,2), all quantities as int(10) unsigned

### API Breaking Changes
- Item creation/update no longer accepts `purchase_unit` or `units_per_purchase_unit`
- Transaction creation now requires `unit_type` field
- Purchase transactions must specify `purchase_unit` and `units_per_purchase_unit`
- New purchase order endpoints introduced for proper procurement workflow

## Frontend Integration Notes

## Examples

### Scenario 1: Complete Purchase Order Workflow with Unit Conversion

**Step 1: Create Supplier**
```json
POST /api/v1/inventory/suppliers?tenantId=1
{
  "name": "LabCorp Supplies",
  "contact_person": "John Smith",
  "email": "john@labcorp.com",
  "phone": "+1234567890",
  "address": "123 Lab Street, Science City"
}
```

**Step 2: Create Inventory Item**
```json
POST /api/v1/inventory/items?tenantId=1
{
  "name": "EDTA Reagent",
  "sku": "EDTA-5000ML",
  "description": "EDTA anticoagulant solution",
  "category_id": "CAT-001",
  "consumption_unit": "ml",
  "min_stock": 10000,
  "max_stock": 100000
}
```

**Step 3: Create Purchase Order**
```json
POST /api/v1/inventory/orders?tenantId=1
{
  "supplier_id": "SUP-1766091453362",
  "order_date": "2025-12-18",
  "expected_delivery_date": "2025-12-25",
  "notes": "Monthly reagent supply",
  "items": [
    {
      "inventory_item_id": "INV-1766091459184",
      "quantity_ordered": 10,
      "unit_price": 25.50,
      "tax_rate": 0,
      "discount_rate": 0
    }
  ]
}
```

**Step 4: Receive Purchase Order with Unit Conversion**
```json
POST /api/v1/inventory/orders/PO-20251218-XXXX/receive?tenantId=1
{
  "received_by": 123,
  "received_date": "2025-12-18",
  "receipts": [
    {
      "order_item_id": "POI-17345184000001",
      "quantity_received": 10,
      "batch_number": "BATCH-2025-001",
      "expiry_date": "2026-12-18",
      "unit_price": 25.50,
      "condition_status": "good",
      "quality_check_passed": true,
      "purchase_unit": "bottles",
      "units_per_purchase_unit": 5000
    }
  ]
}
```
*Result: 10 bottles × 5000 ml/bottle = 50,000 ml added to inventory stock*

**Step 5: Verify Stock Update**
```json
GET /api/v1/inventory/items/INV-1766091459184?tenantId=1
```
*Response shows current_stock: 50000*

### Scenario 2: Different Suppliers with Different Packaging

**Supplier A** (5000 ml per bottle):
```json
POST /api/v1/inventory/orders/SUP-001/receive?tenantId=1
{
  "received_by": 123,
  "receipts": [
    {
      "order_item_id": "POI-001",
      "quantity_received": 5,
      "purchase_unit": "bottles",
      "units_per_purchase_unit": 5000
    }
  ]
}
```
*Result: 25,000 ml added to stock*

**Supplier B** (10000 ml per container):
```json
POST /api/v1/inventory/orders/SUP-002/receive?tenantId=1
{
  "received_by": 123,
  "receipts": [
    {
      "order_item_id": "POI-002",
      "quantity_received": 3,
      "purchase_unit": "containers",
      "units_per_purchase_unit": 10000
    }
  ]
}
```
*Result: 30,000 ml added to stock*

### Scenario 3: Partial Receipts

```json
POST /api/v1/inventory/orders/PO-001/receive?tenantId=1
{
  "received_by": 123,
  "receipts": [
    {
      "order_item_id": "POI-001",
      "quantity_received": 3,
      "purchase_unit": "bottles",
      "units_per_purchase_unit": 5000
    }
  ]
}
```
*Result: Order status becomes "partially_received", 15,000 ml added to stock*

## Error Handling

### Common Error Responses

**Invalid Unit**
```json
{
  "success": false,
  "error": "Invalid consumption unit specified"
}
```

**Transaction Would Cause Negative Stock**
```json
{
  "success": false,
  "error": "Transaction would result in negative stock"
}
```

**Missing Required Fields**
```json
{
  "success": false,
  "error": "Purchase unit is required when unit_type is purchase"
}
```

## Frontend Integration Notes

1. **Purchase Order Workflow**:
   - Create suppliers first (`POST /suppliers`)
   - Create inventory items with consumption units (`POST /items`)
   - Create purchase orders (`POST /orders`)
   - Receive orders with unit conversion (`POST /orders/{id}/receive`)

2. **Unit Selection**: Use the global units API (`GET /api/v1/inventory/units`) to populate dropdowns for both consumption and purchase units

3. **Item Management**: Only show consumption unit selection during item creation/update

4. **Receiving/Purchase**: Show purchase unit and quantity-per-unit fields during order receipt

5. **Consumption**: Use consumption units directly (no conversion needed)

6. **Stock Display**: Always show stock in consumption units

7. **Unit Validation**: Validate units against the global units table before submission

8. **Order Status Tracking**: Monitor order status (`pending` → `partially_received` → `received`)

## Future Enhancements

- Package tracking for partial consumption
- Automatic reorder point calculations
- Supplier performance analytics based on unit costs
- Batch expiry alerts
- FIFO/LIFO consumption strategies</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos-server\docs\inventory-unit-conversion-api.md