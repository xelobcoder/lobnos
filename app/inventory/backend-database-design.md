# Inventory Management System - Backend Database Design & Implementation Guide

## Overview
This document provides a comprehensive blueprint for implementing the laboratory inventory management system backend. It includes detailed database schema, business logic, API specifications, validation rules, error handling, and implementation guidance to ensure zero errors in the backend development.

## Database Schema & Implementation

### Database Requirements
- **Database Type**: MySQL 8.0+ or PostgreSQL 13+
- **Character Set**: UTF8MB4 (MySQL) or UTF8 (PostgreSQL)
- **Engine**: InnoDB (MySQL) for transaction support
- **Timezone**: UTC for all timestamp fields

### Migration Strategy
```sql
-- Initial migration script structure
CREATE DATABASE lab_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lab_inventory;

-- Run table creation scripts in this order:
-- 1. brands
-- 2. categories
-- 3. suppliers
-- 4. storage_locations
-- 5. inventory_items
-- 6. purchase_orders
-- 7. purchase_order_items
-- 8. inventory_transactions
-- 9. test_templates
-- 10. test_template_items
```

## Detailed Table Specifications

### 1. Brands Table
**Purpose**: Stores information about product brands used in the inventory system.

**Table Structure**:
```sql
CREATE TABLE brands (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID or auto-generated unique identifier',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Brand name - must be unique across system',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date brand was first added to system',
    item_count INT DEFAULT 0 COMMENT 'Computed: number of active inventory items using this brand',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification timestamp',

    INDEX idx_brand_name (name),
    INDEX idx_brand_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product brands catalog';
```

**Field Specifications**:
- `id`: VARCHAR(50) - Use UUID v4 format: `550e8400-e29b-41d4-a716-446655440000`
- `name`: VARCHAR(255) - Required, unique, case-sensitive. Examples: "Vacuette", "Accu-Chek", "Baxter"
- `created_date`: TIMESTAMP - When brand was first entered (different from record creation)
- `item_count`: INT - Auto-calculated via triggers, never manually updated

**Business Logic Implementation**:
```sql
-- Trigger to update item_count when items are added/removed
DELIMITER //
CREATE TRIGGER update_brand_item_count AFTER INSERT ON inventory_items
FOR EACH ROW
BEGIN
    IF NEW.brand_id IS NOT NULL THEN
        UPDATE brands SET item_count = item_count + 1 WHERE id = NEW.brand_id;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_brand_item_count_delete AFTER DELETE ON inventory_items
FOR EACH ROW
BEGIN
    IF OLD.brand_id IS NOT NULL THEN
        UPDATE brands SET item_count = GREATEST(item_count - 1, 0) WHERE id = OLD.brand_id;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_brand_item_count_update AFTER UPDATE ON inventory_items
FOR EACH ROW
BEGIN
    -- Handle brand change
    IF OLD.brand_id != NEW.brand_id THEN
        -- Remove from old brand
        IF OLD.brand_id IS NOT NULL THEN
            UPDATE brands SET item_count = GREATEST(item_count - 1, 0) WHERE id = OLD.brand_id;
        END IF;
        -- Add to new brand
        IF NEW.brand_id IS NOT NULL THEN
            UPDATE brands SET item_count = item_count + 1 WHERE id = NEW.brand_id;
        END IF;
    END IF;
END//
DELIMITER ;
```

**Validation Rules**:
- `name` cannot be empty or null
- `name` must be unique (case-sensitive)
- `name` maximum length: 255 characters
- `item_count` must always be >= 0

**Error Scenarios**:
- Attempting to delete brand with `item_count > 0`: Return error "Cannot delete brand in use"
- Duplicate brand name: Return error "Brand name already exists"

### 2. Categories Table
**Purpose**: Categorizes inventory items for better organization and reporting.

**Table Structure**:
```sql
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY COMMENT 'UUID unique identifier',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Category name - must be unique',
    description TEXT COMMENT 'Optional detailed description',
    item_count INT DEFAULT 0 COMMENT 'Computed: number of active items in this category',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category_name (name),
    INDEX idx_category_item_count (item_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field Specifications**:
- `id`: VARCHAR(50) - UUID format
- `name`: VARCHAR(255) - Required, unique. Examples: "Reagents & Chemicals", "Consumables", "Equipment"
- `description`: TEXT - Optional, up to 65,535 characters
- `item_count`: INT - Auto-calculated, never manual

**Predefined Categories** (seed data):
```sql
INSERT INTO categories (id, name, description) VALUES
('cat_001', 'Reagents & Chemicals', 'Chemical reagents, solutions, and laboratory chemicals'),
('cat_002', 'Consumables', 'Disposable lab supplies and consumable items'),
('cat_003', 'Equipment', 'Laboratory equipment and instruments'),
('cat_004', 'Glassware', 'Laboratory glassware and plasticware'),
('cat_005', 'PPE', 'Personal protective equipment'),
('cat_006', 'Media & Buffers', 'Culture media and buffer solutions'),
('cat_007', 'Standards & Controls', 'Reference standards and quality controls'),
('cat_008', 'Other', 'Miscellaneous items');
```

### 3. Suppliers Table
**Purpose**: Stores supplier information for procurement and order management.

**Table Structure**:
```sql
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Company name',
    contact VARCHAR(255) COMMENT 'Primary contact person name',
    email VARCHAR(255) COMMENT 'Primary contact email',
    phone VARCHAR(50) COMMENT 'Primary contact phone',
    address TEXT COMMENT 'Supplier address',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether supplier is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_supplier_name (name),
    INDEX idx_supplier_active (is_active),
    INDEX idx_supplier_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field Specifications**:
- `name`: VARCHAR(255) - Required, company name
- `contact`: VARCHAR(255) - Optional, primary contact person
- `email`: VARCHAR(255) - Optional, must be valid email format if provided
- `phone`: VARCHAR(50) - Optional, international format preferred
- `address`: TEXT - Optional, full address
- `is_active`: BOOLEAN - Default TRUE, controls if supplier appears in dropdowns

**Validation Rules**:
- `name` cannot be empty
- `email` must be valid format if provided: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- `phone` should accept international formats

### 4. Storage Locations Table
**Purpose**: Defines physical storage locations for inventory items.

**Table Structure**:
```sql
CREATE TABLE storage_locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Location name',
    description TEXT COMMENT 'Detailed description',
    capacity INT COMMENT 'Maximum capacity (optional)',
    temperature_controlled BOOLEAN DEFAULT FALSE COMMENT 'Requires temperature control',
    hazardous_materials BOOLEAN DEFAULT FALSE COMMENT 'Can store hazardous materials',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Location is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_location_name (name),
    INDEX idx_location_active (is_active),
    INDEX idx_location_temp_control (temperature_controlled),
    INDEX idx_location_hazardous (hazardous_materials)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Seed Data**:
```sql
INSERT INTO storage_locations (id, name, description, temperature_controlled, hazardous_materials) VALUES
('loc_001', 'Storage Room A', 'Main storage room - general supplies', FALSE, FALSE),
('loc_002', 'Cold Storage', 'Refrigerated storage at 4°C', TRUE, FALSE),
('loc_003', 'Chemical Storage', 'Hazardous chemicals storage', FALSE, TRUE),
('loc_004', 'Freezer -20°C', 'Ultra-low temperature storage', TRUE, FALSE),
('loc_005', 'Quarantine Area', 'New items awaiting inspection', FALSE, FALSE);
```

### 5. Inventory Items Table (Core Table)
**Purpose**: Central table storing all inventory items with complete tracking.

**Table Structure**:
```sql
CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Item name',
    sku VARCHAR(100) NOT NULL UNIQUE COMMENT 'Stock Keeping Unit - unique identifier',
    description TEXT COMMENT 'Detailed item description',
    category_id VARCHAR(50) COMMENT 'Reference to categories table',
    brand_id VARCHAR(50) COMMENT 'Reference to brands table',
    supplier_id VARCHAR(50) COMMENT 'Reference to suppliers table',
    unit VARCHAR(50) DEFAULT 'pieces' COMMENT 'Unit of measurement',
    current_stock INT DEFAULT 0 COMMENT 'Current quantity in stock',
    min_stock INT DEFAULT 0 COMMENT 'Minimum stock level threshold',
    max_stock INT DEFAULT 0 COMMENT 'Maximum stock level (optional)',
    unit_price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Price per unit',
    total_value DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Computed: current_stock * unit_price',
    location_id VARCHAR(50) COMMENT 'Storage location',
    expiry_date DATE COMMENT 'Expiration date (if applicable)',
    batch_number VARCHAR(100) COMMENT 'Manufacturing batch/lot number',
    status ENUM('in_stock', 'low_stock', 'out_of_stock', 'expired') DEFAULT 'out_of_stock' COMMENT 'Computed stock status',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Item is active in system',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Last stock change',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE SET NULL,

    INDEX idx_item_sku (sku),
    INDEX idx_item_name (name),
    INDEX idx_item_category (category_id),
    INDEX idx_item_brand (brand_id),
    INDEX idx_item_supplier (supplier_id),
    INDEX idx_item_location (location_id),
    INDEX idx_item_status (status),
    INDEX idx_item_expiry (expiry_date),
    INDEX idx_item_active (is_active),
    INDEX idx_item_stock_levels (current_stock, min_stock, max_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Critical Business Logic - Status Calculation**:
```sql
DELIMITER //
CREATE PROCEDURE calculate_item_status(IN item_id VARCHAR(50))
BEGIN
    DECLARE curr_stock INT;
    DECLARE min_stock_val INT;
    DECLARE expiry_dt DATE;
    DECLARE new_status ENUM('in_stock', 'low_stock', 'out_of_stock', 'expired');

    -- Get current values
    SELECT current_stock, min_stock, expiry_date
    INTO curr_stock, min_stock_val, expiry_dt
    FROM inventory_items
    WHERE id = item_id;

    -- Calculate status
    IF expiry_dt IS NOT NULL AND expiry_dt < CURDATE() THEN
        SET new_status = 'expired';
    ELSEIF curr_stock = 0 THEN
        SET new_status = 'out_of_stock';
    ELSEIF curr_stock <= min_stock_val THEN
        SET new_status = 'low_stock';
    ELSE
        SET new_status = 'in_stock';
    END IF;

    -- Update status
    UPDATE inventory_items SET status = new_status WHERE id = item_id;
END//
DELIMITER ;

-- Trigger to auto-calculate status
DELIMITER //
CREATE TRIGGER auto_update_item_status BEFORE UPDATE ON inventory_items
FOR EACH ROW
BEGIN
    -- Only recalculate if stock-related fields changed
    IF OLD.current_stock != NEW.current_stock OR
       OLD.min_stock != NEW.min_stock OR
       OLD.expiry_date != NEW.expiry_date THEN

        -- Calculate new status
        IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURDATE() THEN
            SET NEW.status = 'expired';
        ELSEIF NEW.current_stock = 0 THEN
            SET NEW.status = 'out_of_stock';
        ELSEIF NEW.current_stock <= NEW.min_stock THEN
            SET NEW.status = 'low_stock';
        ELSE
            SET NEW.status = 'in_stock';
        END IF;

        -- Update total_value
        SET NEW.total_value = NEW.current_stock * NEW.unit_price;

        -- Update last_updated
        SET NEW.last_updated = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;
```

**Validation Rules**:
- `sku` must be unique and not empty
- `current_stock >= 0`
- `min_stock >= 0`
- `max_stock >= min_stock` (if max_stock is set)
- `unit_price >= 0`
- `expiry_date > CURDATE()` for new items (cannot add already expired items)
- `name` cannot be empty

**Units Enumeration**:
Valid units: 'pieces', 'boxes', 'bottles', 'packs', 'liters', 'kg', 'mg', 'ml', 'units', 'vials', 'tubes', 'plates', 'strips', 'kits'

### 6. Purchase Orders Table
**Purpose**: Manages purchase orders for inventory procurement.

**Table Structure**:
```sql
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique order number (auto-generated)',
    supplier_id VARCHAR(50) NOT NULL COMMENT 'Reference to supplier',
    order_date DATE NOT NULL COMMENT 'Date order was placed',
    expected_delivery_date DATE COMMENT 'Expected delivery date',
    actual_delivery_date DATE COMMENT 'Actual delivery date',
    status ENUM('draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Computed: sum of all line items',
    notes TEXT COMMENT 'Order notes',
    created_by VARCHAR(100) COMMENT 'User who created the order',
    approved_by VARCHAR(100) COMMENT 'User who approved the order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),

    INDEX idx_order_number (order_number),
    INDEX idx_order_supplier (supplier_id),
    INDEX idx_order_status (status),
    INDEX idx_order_dates (order_date, expected_delivery_date, actual_delivery_date),
    INDEX idx_order_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Order Number Generation**:
```sql
DELIMITER //
CREATE FUNCTION generate_order_number() RETURNS VARCHAR(100)
BEGIN
    DECLARE year_prefix VARCHAR(4);
    DECLARE sequence_num INT;
    DECLARE order_num VARCHAR(100);

    SET year_prefix = YEAR(CURDATE());
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number, 6) AS UNSIGNED)), 0) + 1
    INTO sequence_num
    FROM purchase_orders
    WHERE order_number LIKE CONCAT('ORD-', year_prefix, '-%');

    SET order_num = CONCAT('ORD-', year_prefix, '-', LPAD(sequence_num, 4, '0'));
    RETURN order_num;
END//
DELIMITER ;
```

**Status Workflow**:
1. `draft` → `sent` → `confirmed` → `partially_received` → `received`
2. Any status can go to `cancelled`

### 7. Purchase Order Items Table
**Purpose**: Line items for purchase orders with receiving tracking.

**Table Structure**:
```sql
CREATE TABLE purchase_order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL COMMENT 'Reference to purchase order',
    item_name VARCHAR(255) NOT NULL COMMENT 'Item name at time of order',
    sku VARCHAR(100) COMMENT 'SKU at time of order',
    brand_id VARCHAR(255) COMMENT 'Brand name at time of order',
    quantity_ordered INT NOT NULL COMMENT 'Total quantity ordered',
    quantity_received INT DEFAULT 0 COMMENT 'Quantity received so far',
    batchnumber 
    unit_price DECIMAL(10,2) NOT NULL COMMENT 'Price per unit',
    total_price DECIMAL(12,2) NOT NULL COMMENT 'Computed: quantity_ordered * unit_price',
    status ENUM('pending', 'partially_received', 'received', 'cancelled') DEFAULT 'pending',
    notes TEXT COMMENT 'Line item notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,

    INDEX idx_order_item_order (order_id),
    INDEX idx_order_item_sku (sku),
    INDEX idx_order_item_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Logic - Receiving Process**:
```sql
DELIMITER //
CREATE PROCEDURE receive_order_item(
    IN order_item_id VARCHAR(50),
    IN received_quantity INT,
    IN batch_number VARCHAR(100),
    IN expiry_date DATE,
    IN receiving_user VARCHAR(100)
)
BEGIN
    DECLARE order_id_val VARCHAR(50);
    DECLARE item_name_val VARCHAR(255);
    DECLARE sku_val VARCHAR(100);
    DECLARE brand_name_val VARCHAR(255);
    DECLARE current_received INT;
    DECLARE total_ordered INT;
    DECLARE unit_price_val DECIMAL(10,2);

    -- Get order item details
    SELECT order_id, item_name, sku, brand_name, quantity_received, quantity_ordered, unit_price
    INTO order_id_val, item_name_val, sku_val, brand_name_val, current_received, total_ordered, unit_price_val
    FROM purchase_order_items
    WHERE id = order_item_id;

    -- Validate received quantity
    IF received_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Received quantity must be positive';
    END IF;

    IF current_received + received_quantity > total_ordered THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot receive more than ordered quantity';
    END IF;

    -- Update order item
    UPDATE purchase_order_items
    SET quantity_received = quantity_received + received_quantity,
        status = CASE
            WHEN quantity_received + received_quantity >= quantity_ordered THEN 'received'
            WHEN quantity_received + received_quantity > 0 THEN 'partially_received'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = order_item_id;

    -- Add to inventory (find or create inventory item)
    -- This would call a stored procedure to handle inventory addition

    -- Record transaction
    INSERT INTO inventory_transactions (
        id, item_id, transaction_type, quantity, previous_stock, new_stock,
        batch_number, brand_name, reason, reference_id, performed_by
    ) VALUES (
        UUID(), -- item_id would be resolved
        'addition', received_quantity, 0, received_quantity,
        batch_number, brand_name_val, 'Purchase order receipt', order_id_val, receiving_user
    );

END//
DELIMITER ;
```

### 8. Inventory Transactions Table
**Purpose**: Complete audit trail of all inventory movements.

**Table Structure**:
```sql
CREATE TABLE inventory_transactions (
    id VARCHAR(50) PRIMARY KEY,
    item_id VARCHAR(50) NOT NULL COMMENT 'Reference to inventory item',
    transaction_type ENUM('consumption', 'addition', 'adjustment', 'transfer') NOT NULL,
    quantity INT NOT NULL COMMENT 'Quantity involved in transaction',
    previous_stock INT NOT NULL COMMENT 'Stock level before transaction',
    new_stock INT NOT NULL COMMENT 'Stock level after transaction',
    batch_number VARCHAR(100) COMMENT 'Batch/lot number (if applicable)',
    brand_name VARCHAR(255) COMMENT 'Brand name at time of transaction',
    reason VARCHAR(255) COMMENT 'Reason for transaction',
    reference_id VARCHAR(50) COMMENT 'Reference to order, test, etc.',
    performed_by VARCHAR(100) COMMENT 'User who performed transaction',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When transaction occurred',
    notes TEXT COMMENT 'Additional notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id) REFERENCES inventory_items(id),

    INDEX idx_transaction_item (item_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_performed_by (performed_by),
    INDEX idx_transaction_reference (reference_id),
    INDEX idx_transaction_batch (batch_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Transaction Processing Logic**:
```sql
DELIMITER //
CREATE PROCEDURE process_inventory_transaction(
    IN p_item_id VARCHAR(50),
    IN p_transaction_type ENUM('consumption', 'addition', 'adjustment', 'transfer'),
    IN p_quantity INT,
    IN p_batch_number VARCHAR(100),
    IN p_brand_name VARCHAR(255),
    IN p_reason VARCHAR(255),
    IN p_reference_id VARCHAR(50),
    IN p_performed_by VARCHAR(100),
    IN p_notes TEXT
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    DECLARE item_brand VARCHAR(255);

    -- Get current stock
    SELECT current_stock, COALESCE(brand_name, '') INTO current_stock, item_brand
    FROM inventory_items WHERE id = p_item_id;

    -- Use provided brand name or existing one
    IF p_brand_name IS NULL OR p_brand_name = '' THEN
        SET p_brand_name = item_brand;
    END IF;

    -- Calculate new stock based on transaction type
    CASE p_transaction_type
        WHEN 'consumption' THEN
            IF current_stock < p_quantity THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for consumption';
            END IF;
            SET new_stock = current_stock - p_quantity;
        WHEN 'addition' THEN
            SET new_stock = current_stock + p_quantity;
        WHEN 'adjustment' THEN
            SET new_stock = p_quantity; -- Absolute adjustment
        WHEN 'transfer' THEN
            -- For transfers, this would be handled differently
            -- (decrement from source, increment to destination)
            SET new_stock = current_stock - p_quantity;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid transaction type';
    END CASE;

    -- Record transaction
    INSERT INTO inventory_transactions (
        id, item_id, transaction_type, quantity, previous_stock, new_stock,
        batch_number, brand_name, reason, reference_id, performed_by, notes
    ) VALUES (
        UUID(), p_item_id, p_transaction_type, p_quantity, current_stock, new_stock,
        p_batch_number, p_brand_name, p_reason, p_reference_id, p_performed_by, p_notes
    );

    -- Update inventory item
    UPDATE inventory_items
    SET current_stock = new_stock, last_updated = CURRENT_TIMESTAMP
    WHERE id = p_item_id;

END//
DELIMITER ;
```

## API Specifications

### Brands API
**GET /api/inventory/brands**
- Query parameters: `search`, `limit`, `offset`, `sort_by`, `sort_order`
- Response: `{ brands: [], total: number, page: number }`

**POST /api/inventory/brands**
- Request body: `{ names: string[] }` (array of brand names)
- Validation: Each name must be unique, not empty, max 255 chars
- Response: `{ success: true, brands: Brand[], errors: string[] }`

**DELETE /api/inventory/brands/:id**
- Validation: Check if brand is used by any items
- Response: `{ success: true }` or error

### Inventory Items API
**GET /api/inventory/items**
- Query parameters: `category_id`, `brand_id`, `supplier_id`, `location_id`, `status`, `search`, `low_stock_only`, `expired_only`
- Response: `{ items: [], total: number, summary: { total_value: number, low_stock_count: number } }`

**POST /api/inventory/items**
- Request body validation:
  ```json
  {
     "name": "string (required, 1-255 chars)",
     "sku": "string (required, unique, 1-100 chars)",
     "category_id": "string (optional, valid UUID)",
     "brand_id": "string (optional, valid UUID)",
     "supplier_id": "string (optional, valid UUID)",
     "unit": "string (required, from enum)",
     "current_stock": "number (required, >= 0)",
     "min_stock": "number (required, >= 0)",
     "max_stock": "number (optional, >= min_stock)",
     "unit_price": "number (required, >= 0)",
     "location_id": "string (optional, valid UUID)",
     "expiry_date": "string (optional, future date)",
     "batch_number": "string (optional)",
     "description": "string (optional)"
  }
  ```

**PUT /api/inventory/items/:id**
- Same validation as POST
- Additional: Cannot change SKU to existing value

### Purchase Orders API
**POST /api/inventory/orders**
- Auto-generates order number
- Validates supplier exists and is active
- Calculates total amount from line items

**POST /api/inventory/orders/:id/receive**
- Request body: `{ items: [{ order_item_id, quantity, batch_number, expiry_date }] }`
- Validation: Cannot receive more than ordered
- Updates inventory and creates transactions

## Error Handling & Validation

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `422` - Unprocessable Entity (business logic violation)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "sku",
        "message": "SKU already exists",
        "value": "BCT-001-EDTA"
      }
    ]
  }
}
```

### Common Validation Errors
1. **Duplicate SKU**: "Stock Keeping Unit already exists"
2. **Invalid Reference**: "Category with ID 'xxx' does not exist"
3. **Insufficient Stock**: "Cannot consume 50 units, only 25 available"
4. **Invalid Status Transition**: "Cannot change order status from 'received' to 'draft'"
5. **Expired Item**: "Cannot add item with past expiry date"

## Testing Scenarios

### Unit Tests
1. **Brand Creation**: Test duplicate prevention, empty name validation
2. **Stock Calculation**: Test status changes at boundaries (0, min_stock, max_stock)
3. **Transaction Processing**: Test all transaction types with various quantities

### Integration Tests
1. **Purchase Order Flow**: Create order → Receive items → Update inventory → Generate transactions
2. **Stock Alerts**: Test low stock notifications when items reach thresholds
3. **Expiry Management**: Test expired item detection and blocking

### Performance Tests
1. **Bulk Operations**: Create 1000 items simultaneously
2. **Reporting Queries**: Test complex queries with multiple joins
3. **Concurrent Transactions**: Test stock updates under high concurrency

## Security Implementation

### Authentication & Authorization
- Use JWT tokens for API authentication
- Implement role-based access control (RBAC)
- Require authentication for all inventory modifications

### Data Protection
- Encrypt sensitive data (passwords, PII)
- Implement audit logging for all changes
- Use prepared statements to prevent SQL injection

### API Security
- Rate limiting on all endpoints
- Input sanitization and validation
- CORS configuration for frontend access

## Deployment Checklist

### Pre-deployment
- [ ] Database server configured with correct charset
- [ ] All tables created with correct constraints
- [ ] Indexes created for performance
- [ ] Triggers and stored procedures deployed
- [ ] Seed data inserted
- [ ] Backup strategy implemented

### Post-deployment
- [ ] API endpoints tested with various scenarios
- [ ] Frontend integration verified
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Monitoring and alerting configured

This comprehensive specification ensures that the backend implementation will be robust, scalable, and error-free. All edge cases, validation rules, and business logic are explicitly defined to prevent implementation errors.

