import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getPharmacyDB, generateOrderNumber } from '../../../../lib/pharmacy-db';

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getAuthPayload(req: NextRequest) {
     const token = req.cookies.get('PLS-SESSION')?.value;
     if (!token) return null;
     try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
          const { payload } = await jwtVerify(token, secret);
          return payload as { user: { role: string; employeeid: number }; email: string };
     } catch {
          return null;
     }
}

// ─── GET /api/pharmacy/orders ─────────────────────────────────────────────────
// Query params:
//   status    — pending | paid | cancelled  (default: all)
//   startDate — YYYY-MM-DD
//   endDate   — YYYY-MM-DD
//   page      — 1-based (default 1)
//   count     — per page (default 50)

export async function GET(req: NextRequest) {
     const auth = await getAuthPayload(req);
     if (!auth) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

     const { searchParams } = new URL(req.url);
     const status = searchParams.get('status') ?? '';
     const startDate = searchParams.get('startDate') ?? '';
     const endDate = searchParams.get('endDate') ?? '';
     const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
     const count = Math.min(200, parseInt(searchParams.get('count') ?? '50'));
     const offset = (page - 1) * count;
     const tenantId = process.env.TENANTID ?? '1';

     try {
          const db = getPharmacyDB();

          let sql = `
            SELECT
                o.id, o.order_number AS orderNumber, o.status,
                o.subtotal, o.discount_amount AS discountAmount, o.total,
                o.patient_ref AS patientRef, o.notes,
                o.created_by AS createdBy, o.created_at AS createdAt,
                p.payment_method AS paymentMethod, p.amount_paid AS amountPaid,
                p.change_given AS changeGiven, p.processed_by AS processedBy,
                p.processed_at AS processedAt
            FROM  pharmacy_orders o
            LEFT JOIN pharmacy_payments p ON p.order_id = o.id
            WHERE o.tenant_id = ?
        `;
          const params: (string | number)[] = [tenantId];

          if (status) { sql += ' AND o.status = ?'; params.push(status); }
          if (startDate) { sql += ' AND DATE(o.created_at) >= ?'; params.push(startDate); }
          if (endDate) { sql += ' AND DATE(o.created_at) <= ?'; params.push(endDate); }

          sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
          params.push(count, offset);

          const [orders] = await db.query(sql, params) as any[];

          // Fetch line items for each order
          if ((orders as any[]).length > 0) {
               const orderIds = (orders as any[]).map((o: any) => o.id);
               const [items] = await db.query(
                    `SELECT order_id AS orderId, drug_name AS drugName, drug_strength AS drugStrength,
                        drug_form AS drugForm, quantity, unit, unit_price AS unitPrice,
                        line_total AS lineTotal, instructions
                 FROM   pharmacy_order_items
                 WHERE  order_id IN (?)`,
                    [orderIds]
               ) as any[];

               const itemMap: Record<number, any[]> = {};
               for (const item of (items as any[])) {
                    if (!itemMap[item.orderId]) itemMap[item.orderId] = [];
                    itemMap[item.orderId].push(item);
               }
               for (const order of (orders as any[])) {
                    order.items = itemMap[order.id] ?? [];
               }
          }

          return NextResponse.json({ status: 'success', statusCode: 200, result: orders });
     } catch (err: any) {
          console.error('[pharmacy/orders GET]', err);
          return NextResponse.json({ status: 'error', message: 'Failed to fetch orders' }, { status: 500 });
     }
}

// ─── POST /api/pharmacy/orders ────────────────────────────────────────────────
// Body:
//   items: Array<{ drugId, drugName, drugStrength?, drugForm?, quantity, unit, unitPrice, lineTotal, instructions? }>
//   subtotal, discountType, discountValue, discountAmount, total
//   patientRef? (optional)
//   notes?

export async function POST(req: NextRequest) {
     const auth = await getAuthPayload(req);
     if (!auth) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

     let body: any;
     try { body = await req.json(); } catch {
          return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
     }

     const { items, subtotal, discountType, discountValue, discountAmount, total, patientRef, notes } = body;

     if (!Array.isArray(items) || items.length === 0) {
          return NextResponse.json({ status: 'error', message: 'Order must have at least one item' }, { status: 400 });
     }

     const tenantId = process.env.TENANTID ?? '1';
     const createdBy = auth.user ? String(auth.user.employeeid) : 'system';

     const db = getPharmacyDB();
     const conn = await db.getConnection();
     try {
          await conn.beginTransaction();

          // Generate order number: count of today's orders + 1
          const [[{ todayCount }]] = await conn.query(
               `SELECT COUNT(*) AS todayCount FROM pharmacy_orders WHERE tenant_id = ? AND DATE(created_at) = CURDATE()`,
               [tenantId]
          ) as any[];
          const orderNumber = generateOrderNumber((todayCount as number) + 1);

          // Insert order
          const [orderResult] = await conn.query(
               `INSERT INTO pharmacy_orders
                (tenant_id, order_number, status, subtotal, discount_type, discount_value, discount_amount, total, patient_ref, notes, created_by)
             VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`,
               [tenantId, orderNumber, subtotal ?? 0, discountType ?? 'GHS', discountValue ?? 0,
                    discountAmount ?? 0, total ?? 0, patientRef ?? null, notes ?? null, createdBy]
          ) as any[];

          const orderId = (orderResult as any).insertId;

          // Insert line items
          for (const item of items) {
               await conn.query(
                    `INSERT INTO pharmacy_order_items
                    (order_id, drug_id, drug_name, drug_strength, drug_form, quantity, unit, unit_price, line_total, instructions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, item.drugId, item.drugName, item.drugStrength ?? null,
                         item.drugForm ?? null, item.quantity, item.unit,
                         item.unitPrice, item.lineTotal, item.instructions ?? null]
               );
          }

          await conn.commit();

          return NextResponse.json({
               status: 'success', statusCode: 201,
               result: { orderId, orderNumber, status: 'pending', total }
          }, { status: 201 });

     } catch (err: any) {
          await conn.rollback();
          console.error('[pharmacy/orders POST]', err);
          return NextResponse.json({ status: 'error', message: 'Failed to create order' }, { status: 500 });
     } finally {
          conn.release();
     }
}
