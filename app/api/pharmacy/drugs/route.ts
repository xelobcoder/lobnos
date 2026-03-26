import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getPharmacyDB } from '../../../../lib/pharmacy-db';

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

// ─── GET /api/pharmacy/drugs ─────────────────────────────────────────────────
// Query params:
//   search    — filter by name / generic_name / category
//   form      — e.g. Tablet
//   category  — e.g. Antibiotic
//   lowStock  — '1' to return only below-minimum items
//   page      — 1-based page number (default 1)
//   count     — results per page (default 100)

export async function GET(req: NextRequest) {
     const auth = await getAuthPayload(req);
     if (!auth) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });

     const { searchParams } = new URL(req.url);
     const search = searchParams.get('search') ?? '';
     const form = searchParams.get('form') ?? '';
     const category = searchParams.get('category') ?? '';
     const lowStock = searchParams.get('lowStock') === '1';
     const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
     const count = Math.min(200, parseInt(searchParams.get('count') ?? '100'));
     const offset = (page - 1) * count;
     const tenantId = process.env.TENANTID ?? '1';

     try {
          const db = getPharmacyDB();

          let sql = `
            SELECT
                id, name, generic_name AS genericName, strength, form, category,
                cost_price AS costPrice, selling_price AS sellingPrice,
                stock_qty AS stockQty, min_qty AS minQty,
                unit, expiry_date AS expiryDate, supplier, is_active AS isActive
            FROM  pharmacy_drugs
            WHERE tenant_id = ?
              AND is_active = 1
        `;
          const params: (string | number)[] = [tenantId];

          if (search) {
               sql += ' AND (name LIKE ? OR generic_name LIKE ? OR category LIKE ?)';
               const like = `%${search}%`;
               params.push(like, like, like);
          }
          if (form) { sql += ' AND form = ?'; params.push(form); }
          if (category) { sql += ' AND category = ?'; params.push(category); }
          if (lowStock) { sql += ' AND stock_qty < min_qty'; }

          sql += ' ORDER BY name LIMIT ? OFFSET ?';
          params.push(count, offset);

          const [rows] = await db.query(sql, params);

          return NextResponse.json({ status: 'success', statusCode: 200, result: rows });
     } catch (err: any) {
          console.error('[pharmacy/drugs GET]', err);
          return NextResponse.json({ status: 'error', message: 'Failed to fetch drugs' }, { status: 500 });
     }
}
