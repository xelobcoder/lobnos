import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getPharmacyDB } from '../../../../../lib/pharmacy-db';

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

// ─── GET /api/pharmacy/orders/[orderId] ───────────────────────────────────────
// orderId is the ORDER NUMBER string (e.g. ORD-20260325-0042)

export async function GET(
     req: NextRequest,
     { params }: { params: { orderId: string } }
) {
     const auth = await getAuthPayload(req);
     if (!auth) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

     const orderNumber = decodeURIComponent(params.orderId);
     const tenantId = process.env.TENANTID ?? '1';

     try {
          const db = getPharmacyDB();

          // Fetch order
          const [orders] = await db.query(
               `SELECT
                o.id, o.order_number AS orderNumber, o.status,
                o.subtotal, o.discount_type AS discountType,
                o.discount_value AS discountValue, o.discount_amount AS discountAmount,
                o.total, o.patient_ref AS patientRef, o.notes,
                o.created_by AS createdBy, o.created_at AS createdAt,
                p.payment_method AS paymentMethod, p.amount_paid AS amountPaid,
                p.change_given AS changeGiven, p.reference AS paymentRef,
                p.processed_by AS processedBy, p.processed_at AS processedAt
             FROM   pharmacy_orders o
             LEFT JOIN pharmacy_payments p ON p.order_id = o.id
             WHERE  o.order_number = ? AND o.tenant_id = ?`,
               [orderNumber, tenantId]
          ) as any[];

          if (!(orders as any[]).length) {
               return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
          }

          const order = (orders as any[])[0];

          // Fetch line items
          const [items] = await db.query(
               `SELECT drug_name AS drugName, drug_strength AS drugStrength, drug_form AS drugForm,
                    quantity, unit, unit_price AS unitPrice, line_total AS lineTotal, instructions
             FROM   pharmacy_order_items
             WHERE  order_id = ?`,
               [order.id]
          ) as any[];

          order.items = items;

          return NextResponse.json({ status: 'success', statusCode: 200, result: order });
     } catch (err: any) {
          console.error('[pharmacy/orders/:id GET]', err);
          return NextResponse.json({ status: 'error', message: 'Failed to fetch order' }, { status: 500 });
     }
}

// ─── PATCH /api/pharmacy/orders/[orderId] — Process Payment ──────────────────
// Body:
//   paymentMethod: 'cash' | 'momo' | 'insurance'
//   amountPaid:   number
//   changeGiven:  number
//   reference?:   string (MoMo transaction ID / insurance auth code)

export async function PATCH(
     req: NextRequest,
     { params }: { params: { orderId: string } }
) {
     const auth = await getAuthPayload(req);
     if (!auth) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

     const orderNumber = decodeURIComponent(params.orderId);
     const tenantId = process.env.TENANTID ?? '1';
     const processedBy = String(auth.user?.employeeid ?? 'system');

     let body: any;
     try { body = await req.json(); } catch {
          return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
     }
     const { paymentMethod, amountPaid, changeGiven, reference } = body;

     if (!paymentMethod || amountPaid == null) {
          return NextResponse.json({ status: 'error', message: 'paymentMethod and amountPaid are required' }, { status: 400 });
     }

     const db = getPharmacyDB();
     const conn = await db.getConnection();
     try {
          await conn.beginTransaction();

          // Fetch order
          const [orders] = await conn.query(
               `SELECT id, status, total FROM pharmacy_orders WHERE order_number = ? AND tenant_id = ?`,
               [orderNumber, tenantId]
          ) as any[];

          if (!(orders as any[]).length) {
               await conn.rollback();
               return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
          }

          const order = (orders as any[])[0];

          if (order.status === 'paid') {
               await conn.rollback();
               return NextResponse.json({ status: 'error', message: 'Order already paid' }, { status: 409 });
          }
          if (order.status === 'cancelled') {
               await conn.rollback();
               return NextResponse.json({ status: 'error', message: 'Order is cancelled' }, { status: 409 });
          }
          if (paymentMethod === 'cash' && amountPaid < order.total) {
               await conn.rollback();
               return NextResponse.json({ status: 'error', message: 'Amount paid is less than order total' }, { status: 422 });
          }

          // Record payment
          await conn.query(
               `INSERT INTO pharmacy_payments
                (order_id, tenant_id, payment_method, amount_paid, change_given, reference, processed_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
               [order.id, tenantId, paymentMethod, amountPaid, changeGiven ?? 0, reference ?? null, processedBy]
          );

          // Mark order paid
          await conn.query(
               `UPDATE pharmacy_orders SET status = 'paid' WHERE id = ?`,
               [order.id]
          );

          // Deduct stock for each line item — decrement pharmacy_drugs.stock_qty
          const [items] = await conn.query(
               `SELECT drug_id AS drugId, quantity, unit_price AS unitPrice FROM pharmacy_order_items WHERE order_id = ?`,
               [order.id]
          ) as any[];

          for (const item of (items as any[])) {
               // Read current stock for the audit log
               const [[drug]] = await conn.query(
                    `SELECT stock_qty AS stockQty FROM pharmacy_drugs WHERE id = ? AND tenant_id = ?`,
                    [item.drugId, tenantId]
               ) as any[];

               if (drug) {
                    const qtyBefore = drug.stockQty as number;
                    const qtyAfter = Math.max(0, qtyBefore - item.quantity);
                    await conn.query(
                         `UPDATE pharmacy_drugs SET stock_qty = ? WHERE id = ? AND tenant_id = ?`,
                         [qtyAfter, item.drugId, tenantId]
                    );
                    await conn.query(
                         `INSERT INTO pharmacy_stock_movements
                        (tenant_id, drug_id, order_id, type, quantity_change, qty_before, qty_after, created_by)
                     VALUES (?, ?, ?, 'sale', ?, ?, ?, ?)`,
                         [tenantId, item.drugId, order.id, -item.quantity, qtyBefore, qtyAfter, processedBy]
                    );
               }
          }

          await conn.commit();

          return NextResponse.json({
               status: 'success', statusCode: 200,
               result: { orderNumber, status: 'paid', paymentMethod, amountPaid, changeGiven: changeGiven ?? 0 }
          });

     } catch (err: any) {
          await conn.rollback();
          console.error('[pharmacy/orders/:id PATCH]', err);
          return NextResponse.json({ status: 'error', message: 'Failed to process payment' }, { status: 500 });
     } finally {
          conn.release();
     }
}
