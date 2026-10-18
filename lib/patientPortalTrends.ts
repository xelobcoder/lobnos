export interface PortalTrendTest {
     testid: number;
     testname: string;
     resultCount: number;
}

export interface PortalTrendRow {
     ascensionid: number;
     billingid: number;
     fieldid: number | null;
     field: string;
     value: string;
     numericValue: number | null;
     recordedOn: string | null;
     completedOn: string | null;
     units: string;
     plan: string;
     lowerlimit: string | number | null;
     upperlimit: string | number | null;
     textReference: string;
}

export interface PortalTrendHistory {
     testid: number;
     testname: string;
     rows: PortalTrendRow[];
     page: number;
     count: number;
     total: number;
     totalPages: number;
     referenceNote: string;
}

export function numericTrendValue(value: unknown): number | null {
     if (typeof value !== 'string' && typeof value !== 'number') return null;
     const text = String(value).trim();
     if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
     const number = Number(text);
     return Number.isFinite(number) ? number : null;
}

export function trendTimestamp(value: string | null): number | null {
     if (!value) return null;
     const time = new Date(value).getTime();
     return Number.isFinite(time) ? time : null;
}

/** Keep different analytes and units separate: no unit conversions or inferred values. */
export function groupTrendRows(rows: PortalTrendRow[]) {
     const groups = new Map<string, { key: string; field: string; units: string; rows: PortalTrendRow[] }>();
     for (const row of rows) {
          const key = JSON.stringify([row.fieldid ?? row.field, row.units.trim()]);
          if (!groups.has(key)) groups.set(key, { key, field: row.field, units: row.units.trim(), rows: [] });
          groups.get(key)!.rows.push(row);
     }
     return [...groups.values()].map(group => ({
          ...group,
          rows: [...group.rows].sort((a, b) =>
               (trendTimestamp(a.recordedOn) ?? Infinity) - (trendTimestamp(b.recordedOn) ?? Infinity) ||
               a.ascensionid - b.ascensionid),
     }));
}

export function trendReference(row: PortalTrendRow): string {
     if (row.plan === 'limits') {
          const lower = row.lowerlimit == null || String(row.lowerlimit).trim() === '' ? null : String(row.lowerlimit);
          const upper = row.upperlimit == null || String(row.upperlimit).trim() === '' ? null : String(row.upperlimit);
          if (lower !== null && upper !== null) return `${lower} – ${upper}`;
          if (lower !== null) return `≥ ${lower}`;
          if (upper !== null) return `≤ ${upper}`;
     }
     return row.textReference || 'Not provided';
}
