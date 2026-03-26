/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              PHARMACY MODULE — MySQL Schema & Connection                  ║
 * ║                                                                           ║
 * ║  Prerequisites:                                                           ║
 * ║    npm install mysql2                                                     ║
 * ║                                                                           ║
 * ║  Add these variables to your .env file:                                  ║
 * ║    MYSQL_HOST=localhost                                                   ║
 * ║    MYSQL_PORT=3306                                                        ║
 * ║    MYSQL_USER=your_db_user                                                ║
 * ║    MYSQL_PASSWORD=your_db_password                                        ║
 * ║    MYSQL_DATABASE=lobnos_db                                               ║
 * ║                                                                           ║
 * ║  Run the SQL below once to set up the pharmacy tables:                   ║
 * ║    mysql -u root -p lobnos_db < pharmacy-schema.sql                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import mysql from 'mysql2/promise';

// ─── Schema SQL ──────────────────────────────────────────────────────────────
// Copy this to a file called `pharmacy-schema.sql` and run it against your DB.
// Or call `initPharmacySchema()` at server startup to auto-create the tables.

export const PHARMACY_SCHEMA_SQL = `
-- ─── 1. Drug Formulary ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_drugs (
    id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    tenant_id     INT UNSIGNED  NOT NULL,
    name          VARCHAR(200)  NOT NULL,
    generic_name  VARCHAR(200),
    strength      VARCHAR(100),
    form          VARCHAR(50)   NOT NULL COMMENT 'Tablet | Capsule | Syrup | Injection | Sachet | Cream',
    category      VARCHAR(100),
    unit          VARCHAR(50)   NOT NULL DEFAULT 'tablet' COMMENT 'Per-unit description: tablet, bottle, vial',
    cost_price    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_qty     INT           NOT NULL DEFAULT 0,
    min_qty       INT           NOT NULL DEFAULT 10  COMMENT 'Reorder threshold',
    supplier      VARCHAR(200),
    expiry_date   DATE,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pd_tenant   (tenant_id),
    INDEX idx_pd_name     (name),
    INDEX idx_pd_category (category),
    INDEX idx_pd_stock    (stock_qty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. Pharmacy Orders (created by pharmacist before payment) ───────────────
CREATE TABLE IF NOT EXISTS pharmacy_orders (
    id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED  NOT NULL,
    order_number    VARCHAR(30)   NOT NULL UNIQUE COMMENT 'Format: ORD-YYYYMMDD-XXXX',
    status          ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
    subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_type   ENUM('%','GHS')                    NOT NULL DEFAULT 'GHS',
    discount_value  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    patient_ref     VARCHAR(200)  COMMENT 'Optional: patient name or visit ID',
    notes           TEXT,
    created_by      VARCHAR(100)  NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_po_tenant       (tenant_id),
    INDEX idx_po_order_number (order_number),
    INDEX idx_po_status       (status),
    INDEX idx_po_created_at   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. Order Line Items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_order_items (
    id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    order_id      INT UNSIGNED  NOT NULL,
    drug_id       INT UNSIGNED  NOT NULL,
    drug_name     VARCHAR(200)  NOT NULL,
    drug_strength VARCHAR(100),
    drug_form     VARCHAR(50),
    quantity      INT           NOT NULL,
    unit          VARCHAR(50)   NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    line_total    DECIMAL(10,2) NOT NULL,
    instructions  VARCHAR(500)  COMMENT 'Dispensing sig e.g. 1 tab TDS × 7 days',
    FOREIGN KEY (order_id) REFERENCES pharmacy_orders(id) ON DELETE CASCADE,
    INDEX idx_poi_order (order_id),
    INDEX idx_poi_drug  (drug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. Payments (one row per paid order) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_payments (
    id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED  NOT NULL UNIQUE,
    tenant_id       INT UNSIGNED  NOT NULL,
    payment_method  ENUM('cash','momo','insurance') NOT NULL,
    amount_paid     DECIMAL(10,2) NOT NULL,
    change_given    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reference       VARCHAR(200)  COMMENT 'MoMo transaction ID / insurance auth code',
    processed_by    VARCHAR(100)  NOT NULL,
    processed_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES pharmacy_orders(id) ON DELETE CASCADE,
    INDEX idx_pp_tenant (tenant_id),
    INDEX idx_pp_order  (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. Stock Movement Audit Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_stock_movements (
    id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    tenant_id       INT UNSIGNED  NOT NULL,
    drug_id         INT UNSIGNED  NOT NULL,
    order_id        INT UNSIGNED  COMMENT 'NULL for non-sale movements',
    type            ENUM('sale','restock','adjustment','expiry_write_off') NOT NULL,
    quantity_change INT           NOT NULL COMMENT 'Negative = stock out, Positive = stock in',
    qty_before      INT           NOT NULL,
    qty_after       INT           NOT NULL,
    note            VARCHAR(500),
    created_by      VARCHAR(100)  NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_psm_tenant (tenant_id),
    INDEX idx_psm_drug   (drug_id),
    INDEX idx_psm_type   (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// ─── Connection Pool ──────────────────────────────────────────────────────────

let pool: mysql.Pool | null = null;

export function getPharmacyDB(): mysql.Pool {
     if (!pool) {
          pool = mysql.createPool({
               host: process.env.MYSQL_HOST ?? 'localhost',
               port: Number(process.env.MYSQL_PORT ?? 3306),
               user: process.env.MYSQL_USER ?? 'root',
               password: process.env.MYSQL_PASSWORD ?? '',
               database: process.env.MYSQL_DATABASE ?? 'lobnos_db',
               waitForConnections: true,
               connectionLimit: 10,
               queueLimit: 0,
               timezone: '+00:00',
          });
     }
     return pool;
}

/** Run CREATE TABLE statements on startup (idempotent). */
export async function initPharmacySchema(): Promise<void> {
     const db = getPharmacyDB();
     const statements = PHARMACY_SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean);
     for (const stmt of statements) {
          await db.query(stmt);
     }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates: ORD-YYYYMMDD-XXXX */
export function generateOrderNumber(sequence: number): string {
     const d = new Date();
     const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
     return `ORD-${ymd}-${String(sequence).padStart(4, '0')}`;
}
