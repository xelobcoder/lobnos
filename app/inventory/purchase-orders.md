# Purchase Orders Backend Implementation Guide

## Overview
This document provides a comprehensive blueprint for implementing the purchase orders system within the laboratory inventory management backend. It includes detailed database schema, business logic, API specifications, validation rules, workflow management, and integration with the inventory system.

## Database Schema

### Purchase Orders Table
**Purpose**: Main table for managing purchase orders and their lifecycle.

**Table Structure**:
```sql
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID unique identifier',
    order_number VARCHAR(100) NOT NULL UNIQUE COMMENT 'Auto-generated order number (ORD-YYYY-NNNN)',
    supplier_id VARCHAR(50) NOT NULL COMMENT 'Reference to suppliers table',
    order_date DATE NOT NULL COMMENT 'Date order was placed',
    expected_delivery_date DATE COMMENT 'Expected delivery date',
    actual_delivery_date DATE COMMENT 'Actual delivery date when fully received',
    status ENUM('draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled') DEFAULT 'draft' COMMENT 'Order status workflow',
    total_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Computed: sum of all line items',
    tax_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tax amount if applicable',
    discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Discount amount if applicable',
    shipping_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Shipping/freight costs',
    final_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Computed: total_amount + tax + shipping - discount',
    currency VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency code',
    payment_terms VARCHAR(255) COMMENT 'Payment terms (e.g., "Net 30", "Due on receipt")',
    notes TEXT COMMENT 'Order notes and special instructions',
    created_by VARCHAR(100) COMMENT 'User ID who created the order',
    approved_by VARCHAR(100) COMMENT 'User ID who approved the order',
    approved_at TIMESTAMP NULL COMMENT 'When order was approved',
    sent_at TIMESTAMP NULL COMMENT 'When order was sent to supplier',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),

    INDEX idx_po_order_number (order_number),
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_status (status),
    INDEX idx_po_order_date (order_date),
    INDEX idx_po_expected_delivery (expected_delivery_date),
    INDEX idx_po_created_by (created_by),
    INDEX idx_po_approved_by (approved_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Purchase orders master table';
```

### Purchase Order Items Table
**Purpose**: Line items for each purchase order with detailed tracking.

**Table Structure**:
```sql
CREATE TABLE purchase_order_items (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID unique identifier',
    order_id VARCHAR(50) NOT NULL COMMENT 'Reference to purchase_orders',
    inventory_item_id VARCHAR(50) COMMENT 'Reference to inventory_items (if existing item)',
    item_name VARCHAR(255) NOT NULL COMMENT 'Item name at time of order',
    item_description TEXT COMMENT 'Item description at time of order',
    sku VARCHAR(100) COMMENT 'SKU at time of order (may differ from current)',
    category_name VARCHAR(255) COMMENT 'Category name at time of order',
    brand_name VARCHAR(255) COMMENT 'Brand name at time of order',
    supplier_sku VARCHAR(100) COMMENT 'Supplier''s SKU/catalog number',
    quantity_ordered INT NOT NULL COMMENT 'Total quantity ordered',
    quantity_received INT DEFAULT 0 COMMENT 'Quantity received so far',
    quantity_rejected INT DEFAULT 0 COMMENT 'Quantity rejected during receiving',
    unit_price DECIMAL(10,2) NOT NULL COMMENT 'Price per unit',
    tax_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Tax rate percentage',
    discount_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Discount rate percentage',
    line_total DECIMAL(12,2) NOT NULL COMMENT 'Computed: (quantity_ordered * unit_price) with tax/discount',
    unit VARCHAR(50) DEFAULT 'pieces' COMMENT 'Unit of measurement',
    batch_number VARCHAR(100) COMMENT 'Expected batch/lot number',
    expiry_date DATE COMMENT 'Expected expiry date',
    status ENUM('pending', 'partially_received', 'received', 'cancelled', 'backordered') DEFAULT 'pending' COMMENT 'Line item status',
    received_at TIMESTAMP NULL COMMENT 'When this line item was fully received',
    notes TEXT COMMENT 'Line item specific notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,

    INDEX idx_poi_order (order_id),
    INDEX idx_poi_item (inventory_item_id),
    INDEX idx_poi_sku (sku),
    INDEX idx_poi_status (status),
    INDEX idx_poi_received_at (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Purchase order line items';
```

### Purchase Order Receipts Table
**Purpose**: Tracks individual receiving transactions for audit and traceability.

**Table Structure**:
```sql
CREATE TABLE purchase_order_receipts (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID unique identifier',
    order_id VARCHAR(50) NOT NULL COMMENT 'Reference to purchase order',
    order_item_id VARCHAR(50) NOT NULL COMMENT 'Reference to purchase order item',
    receipt_number VARCHAR(100) NOT NULL COMMENT 'Auto-generated receipt number',
    received_date DATE NOT NULL COMMENT 'Date items were received',
    received_by VARCHAR(100) NOT NULL COMMENT 'User who performed receiving',
    quantity_received INT NOT NULL COMMENT 'Quantity received in this receipt',
    batch_number VARCHAR(100) COMMENT 'Actual batch/lot number received',
    expiry_date DATE COMMENT 'Actual expiry date received',
    condition_status ENUM('good', 'damaged', 'expired', 'incorrect_item') DEFAULT 'good' COMMENT 'Condition of received items',
    quality_check_passed BOOLEAN DEFAULT TRUE COMMENT 'Whether quality check passed',
    storage_location_id VARCHAR(50) COMMENT 'Where items were stored',
    notes TEXT COMMENT 'Receipt notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (order_item_id) REFERENCES purchase_order_items(id),
    FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id),

    INDEX idx_receipt_order (order_id),
    INDEX idx_receipt_item (order_item_id),
    INDEX idx_receipt_date (received_date),
    INDEX idx_receipt_batch (batch_number),
    INDEX idx_receipt_condition (condition_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Purchase order receiving transactions';
```

## Business Logic & Workflows

### Order Number Generation
```sql
DELIMITER //
CREATE FUNCTION generate_purchase_order_number() RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE year_prefix VARCHAR(4);
    DECLARE sequence_num INT;
    DECLARE order_num VARCHAR(100);

    SET year_prefix = YEAR(CURDATE());

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(order_number, '-', -1), '-', 1) AS UNSIGNED)), 0) + 1
    INTO sequence_num
    FROM purchase_orders
    WHERE order_number LIKE CONCAT('ORD-', year_prefix, '-%');

    SET order_num = CONCAT('ORD-', year_prefix, '-', LPAD(sequence_num, 4, '0'));
    RETURN order_num;
END//
DELIMITER ;
```

### Order Status Workflow
```sql
-- Status transition rules
-- draft -> pending_approval -> approved -> sent -> confirmed -> partially_received -> received
-- Any status can transition to cancelled
-- partially_received can go back to confirmed if items are returned

DELIMITER //
CREATE PROCEDURE update_purchase_order_status(IN order_id VARCHAR(50))
BEGIN
    DECLARE total_items INT;
    DECLARE received_items INT;
    DECLARE cancelled_items INT;
    DECLARE new_status ENUM('draft', 'pending_approval', 'approved', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled');

    -- Count items by status
    SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    INTO total_items, received_items, cancelled_items
    FROM purchase_order_items
    WHERE order_id = order_id;

    -- Determine new status
    IF cancelled_items = total_items THEN
        SET new_status = 'cancelled';
    ELSEIF received_items = total_items THEN
        SET new_status = 'received';
    ELSEIF received_items > 0 THEN
        SET new_status = 'partially_received';
    ELSE
        -- Keep current status if no items received yet
        SELECT status INTO new_status FROM purchase_orders WHERE id = order_id;
    END IF;

    -- Update order status and delivery date if fully received
    IF new_status = 'received' THEN
        UPDATE purchase_orders
        SET status = new_status,
            actual_delivery_date = CURDATE(),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = order_id;
    ELSE
        UPDATE purchase_orders
        SET status = new_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = order_id;
    END IF;
END//
DELIMITER ;
```

### Automatic Calculations
```sql
DELIMITER //
CREATE TRIGGER calculate_purchase_order_totals BEFORE UPDATE ON purchase_order_items
FOR EACH ROW
BEGIN
    -- Calculate line total with tax and discount
    SET NEW.line_total = (NEW.quantity_ordered * NEW.unit_price) * (1 + NEW.tax_rate/100) * (1 - NEW.discount_rate/100);

    -- Update order total
    UPDATE purchase_orders po
    SET po.total_amount = (
        SELECT COALESCE(SUM(line_total), 0)
        FROM purchase_order_items
        WHERE order_id = NEW.order_id
    ),
    po.final_amount = (
        SELECT COALESCE(SUM(line_total), 0) + po.tax_amount + po.shipping_cost - po.discount_amount
        FROM purchase_order_items
        WHERE order_id = NEW.order_id
    ),
    po.updated_at = CURRENT_TIMESTAMP
    WHERE po.id = NEW.order_id;
END//
DELIMITER ;
```

## API Specifications

### Purchase Orders API

#### GET /api/inventory/purchase-orders
**Purpose**: Retrieve purchase orders with filtering and pagination.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 25, max: 100)
- `supplier_id`: Filter by supplier
- `status`: Filter by status (comma-separated)
- `order_date_from`: Filter orders from date
- `order_date_to`: Filter orders to date
- `search`: Search in order number, supplier name, or item names
- `sort_by`: Sort field (default: order_date)
- `sort_order`: Sort direction (default: DESC)

**Response**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2024-0001",
        "supplier": {
          "id": "uuid",
          "name": "Lab Supplies Inc"
        },
        "order_date": "2024-01-15",
        "expected_delivery_date": "2024-01-30",
        "status": "confirmed",
        "total_amount": 1250.00,
        "final_amount": 1287.50,
        "items_count": 5,
        "received_items_count": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 150,
      "pages": 6
    },
    "summary": {
      "total_orders": 150,
      "pending_orders": 12,
      "overdue_orders": 3
    }
  }
}
```

#### POST /api/inventory/purchase-orders
**Purpose**: Create a new purchase order.

**Request Body**:
```json
{
  "supplier_id": "uuid",
  "order_date": "2024-01-15",
  "expected_delivery_date": "2024-01-30",
  "payment_terms": "Net 30",
  "notes": "Urgent order for lab reagents",
  "items": [
    {
      "inventory_item_id": "uuid", // optional, for existing items
      "item_name": "Sodium Chloride",
      "sku": "CHEM-001",
      "quantity_ordered": 100,
      "unit_price": 5.50,
      "unit": "kg",
      "batch_number": "BATCH-2024-001",
      "expiry_date": "2025-01-15"
    }
  ]
}
```

**Validation Rules**:
- `supplier_id` must exist and be active
- `order_date` cannot be in the future
- `expected_delivery_date` must be after `order_date`
- At least one item required
- Each item must have `item_name`, `quantity_ordered` > 0, `unit_price` >= 0
- If `inventory_item_id` provided, it must exist

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024-0001",
      "status": "draft",
      "total_amount": 550.00,
      "final_amount": 550.00
    }
  }
}
```

#### PUT /api/inventory/purchase-orders/:id
**Purpose**: Update an existing purchase order.

**Status Transition Rules**:
- `draft` → can be modified freely
- `pending_approval` → can modify items and dates
- `approved` → can only modify delivery dates
- `sent`/`confirmed` → cannot modify items, only delivery dates
- `received`/`cancelled` → cannot modify

#### POST /api/inventory/purchase-orders/:id/send
**Purpose**: Mark order as sent to supplier.

**Request Body**:
```json
{
  "sent_at": "2024-01-15T10:30:00Z" // optional, defaults to now
}
```

#### POST /api/inventory/purchase-orders/:id/approve
**Purpose**: Approve a purchase order.

**Request Body**:
```json
{
  "approved_by": "user_id"
}
```

#### POST /api/inventory/purchase-orders/:id/receive
**Purpose**: Receive items from a purchase order.

**Request Body**:
```json
{
  "receipts": [
    {
      "order_item_id": "uuid",
      "quantity_received": 50,
      "batch_number": "BATCH-2024-001-ACTUAL",
      "expiry_date": "2025-01-15",
      "condition_status": "good",
      "storage_location_id": "uuid",
      "quality_check_passed": true,
      "notes": "Received in good condition"
    }
  ],
  "received_by": "user_id",
  "received_date": "2024-01-20"
}
```

**Business Logic**:
1. Validate quantities don't exceed ordered amounts
2. Create receipt records
3. Update inventory stock levels
4. Create inventory transactions
5. Update order and item statuses
6. Handle quality issues and rejections

### Purchase Order Items API

#### GET /api/inventory/purchase-orders/:orderId/items
**Purpose**: Get all items for a specific purchase order.

#### POST /api/inventory/purchase-orders/:orderId/items
**Purpose**: Add items to an existing purchase order.

#### PUT /api/inventory/purchase-orders/items/:itemId
**Purpose**: Update a specific order item.

#### DELETE /api/inventory/purchase-orders/items/:itemId
**Purpose**: Remove an item from an order (only if order is in draft status).

## Integration with Inventory System

### Receiving Process Flow
```sql
DELIMITER //
CREATE PROCEDURE process_purchase_receipt(
    IN p_order_id VARCHAR(50),
    IN p_order_item_id VARCHAR(50),
    IN p_quantity_received INT,
    IN p_batch_number VARCHAR(100),
    IN p_expiry_date DATE,
    IN p_storage_location_id VARCHAR(50),
    IN p_received_by VARCHAR(100),
    IN p_condition_status ENUM('good', 'damaged', 'expired', 'incorrect_item'),
    IN p_quality_check_passed BOOLEAN
)
BEGIN
    DECLARE inventory_item_id_val VARCHAR(50);
    DECLARE item_name_val VARCHAR(255);
    DECLARE current_stock INT;
    DECLARE new_stock INT;

    -- Get inventory item details
    SELECT inventory_item_id, item_name
    INTO inventory_item_id_val, item_name_val
    FROM purchase_order_items
    WHERE id = p_order_item_id;

    -- If no inventory item linked, this is a new item - would need to be created first
    IF inventory_item_id_val IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot receive item not linked to inventory';
    END IF;

    -- Get current stock
    SELECT current_stock INTO current_stock
    FROM inventory_items
    WHERE id = inventory_item_id_val;

    -- Only add to inventory if condition is good and quality check passed
    IF p_condition_status = 'good' AND p_quality_check_passed = TRUE THEN
        SET new_stock = current_stock + p_quantity_received;

        -- Update inventory
        UPDATE inventory_items
        SET current_stock = new_stock,
            batch_number = p_batch_number,
            expiry_date = p_expiry_date,
            location_id = p_storage_location_id,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = inventory_item_id_val;

        -- Record transaction
        INSERT INTO inventory_transactions (
            id, item_id, transaction_type, quantity, previous_stock, new_stock,
            batch_number, reason, reference_id, performed_by
        ) VALUES (
            UUID(), inventory_item_id_val, 'addition', p_quantity_received,
            current_stock, new_stock, p_batch_number,
            'Purchase order receipt', p_order_id, p_received_by
        );
    END IF;

    -- Update order item
    UPDATE purchase_order_items
    SET quantity_received = quantity_received + p_quantity_received,
        status = CASE
            WHEN quantity_received + p_quantity_received >= quantity_ordered THEN 'received'
            WHEN quantity_received + p_quantity_received > 0 THEN 'partially_received'
            ELSE 'pending'
        END,
        received_at = CASE
            WHEN quantity_received + p_quantity_received >= quantity_ordered THEN CURRENT_TIMESTAMP
            ELSE received_at
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_item_id;

    -- Create receipt record
    INSERT INTO purchase_order_receipts (
        id, order_id, order_item_id, receipt_number, received_date, received_by,
        quantity_received, batch_number, expiry_date, condition_status,
        quality_check_passed, storage_location_id
    ) VALUES (
        UUID(), p_order_id, p_order_item_id,
        CONCAT('REC-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
        CURDATE(), p_received_by, p_quantity_received, p_batch_number,
        p_expiry_date, p_condition_status, p_quality_check_passed, p_storage_location_id
    );

    -- Update order status
    CALL update_purchase_order_status(p_order_id);

END//
DELIMITER ;
```

## Validation Rules

### Purchase Order Validation
1. **Supplier Validation**: Must exist and be active
2. **Date Validation**:
   - `order_date` ≤ current date
   - `expected_delivery_date` > `order_date`
   - `actual_delivery_date` only set when status = 'received'
3. **Status Transitions**: Follow defined workflow
4. **Amount Calculations**: Auto-calculated, cannot be manually set

### Order Item Validation
1. **Quantity Rules**:
   - `quantity_ordered` > 0
   - `quantity_received` ≤ `quantity_ordered`
   - `quantity_rejected` ≤ `quantity_received`
2. **Price Rules**:
   - `unit_price` ≥ 0
   - `tax_rate` between 0-100
   - `discount_rate` between 0-100
3. **Reference Integrity**: If `inventory_item_id` provided, must exist

### Receipt Validation
1. **Quantity Limits**: Cannot receive more than ordered minus already received
2. **Date Rules**: `received_date` cannot be in future
3. **Quality Control**: Must specify condition and quality check status

## Error Handling

### Common Error Scenarios
1. **Invalid Status Transition**: "Cannot change order status from 'received' to 'draft'"
2. **Over-Receipt**: "Cannot receive 50 units, only 30 remaining to be received"
3. **Missing Supplier**: "Supplier with ID 'xxx' does not exist or is inactive"
4. **Invalid Dates**: "Expected delivery date must be after order date"
5. **Permission Denied**: "User does not have permission to approve orders"

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Purchase order validation failed",
    "details": [
      {
        "field": "expected_delivery_date",
        "message": "Expected delivery date must be after order date",
        "value": "2024-01-10"
      }
    ]
  }
}
```

## Reporting & Analytics

### Purchase Order Reports
1. **Order Summary**: Total orders by status, supplier, time period
2. **Receiving Performance**: On-time delivery rates, quality metrics
3. **Supplier Performance**: Order fulfillment rates, average lead times
4. **Inventory Turnover**: How quickly ordered items are consumed

### Key Metrics
```sql
-- On-time delivery rate
SELECT
    supplier_id,
    COUNT(*) as total_orders,
    SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) as on_time_deliveries,
    ROUND((SUM(CASE WHEN actual_delivery_date <= expected_delivery_date THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as on_time_percentage
FROM purchase_orders
WHERE status = 'received'
GROUP BY supplier_id;

-- Order cycle time
SELECT
    AVG(DATEDIFF(actual_delivery_date, order_date)) as avg_cycle_days
FROM purchase_orders
WHERE status = 'received' AND actual_delivery_date IS NOT NULL;
```

## Security & Permissions

### Role-Based Access
- **Viewer**: Can view orders and reports
- **Order Creator**: Can create and edit draft orders
- **Order Approver**: Can approve orders
- **Receiver**: Can receive and process deliveries
- **Admin**: Full access to all functions

### Audit Trail
All changes to purchase orders are tracked with:
- User who made the change
- Timestamp of change
- Previous and new values
- Reason for change (if provided)

## Implementation Checklist

### Database Setup
- [ ] Create purchase_orders table
- [ ] Create purchase_order_items table
- [ ] Create purchase_order_receipts table
- [ ] Create indexes and foreign keys
- [ ] Create triggers for automatic calculations
- [ ] Create stored procedures for business logic

### API Implementation
- [ ] Purchase orders CRUD endpoints
- [ ] Order items management
- [ ] Receiving and processing logic
- [ ] Status transition validation
- [ ] Integration with inventory system

### Testing
- [ ] Unit tests for all stored procedures
- [ ] Integration tests for order workflows
- [ ] API endpoint testing
- [ ] Performance testing with large datasets

### Documentation
- [ ] API documentation
- [ ] User workflow documentation
- [ ] Troubleshooting guide

This comprehensive specification ensures that the purchase orders system integrates seamlessly with the inventory management system while maintaining data integrity and providing full audit trails for compliance and reporting purposes.</content>
<parameter name="filePath">c:\Programming\PLS-DIFFERENT-VERSIONS\LobnosProfessionalVersion\lobnos\app\inventory\purchase-orders.md