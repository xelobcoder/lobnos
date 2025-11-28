'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import PrimeTable from '../../../../../../components/accessories/Datatables/PrimeTable';
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation';


interface TrendRow {
     ascensionid: number | string;
     field: string;
     value: string | number | null;
     created_on: string;
     plan?: string | null;
     fieldid?: number | string;
}

export default function ResultTrendPage() {
     const params = useParams<{ patientid: string; testid: string }>();
     const searchParams = useSearchParams();
     const patientid = params?.patientid ?? '';
     const testid = params?.testid ?? '';
     const trendNumber = searchParams?.get('trendNumber') || '100';

     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [rows, setRows] = useState<TrendRow[]>([]);

     // Build field -> accession latest map and accession list
     const { fieldToAccLatest, accessionList } = useMemo(() => {
          const accSet = new Set<string>();
          const fmap = new Map<string, Map<string, { value: string | number | null; date: Date | null }>>();
          rows.forEach(r => {
               const asc = String(r.ascensionid ?? 'Unknown');
               accSet.add(asc);
               const fid = (r as any).fieldid ?? undefined;
               const fName = r.field || 'Unknown';
               const fieldKey = fid != null ? `${fName} (ID: ${fid})` : fName;
               const dt = new Date(r.created_on);
               if (!fmap.has(fieldKey)) fmap.set(fieldKey, new Map());
               const accMap = fmap.get(fieldKey)!;
               const existing = accMap.get(asc);
               const newTime = Number.isNaN(dt.getTime()) ? -Infinity : dt.getTime();
               const oldTime = existing?.date ? existing.date.getTime() : -Infinity;
               if (!existing || newTime >= oldTime) {
                    accMap.set(asc, { value: r.value ?? '', date: Number.isNaN(dt.getTime()) ? null : dt });
               }
          });
          return { fieldToAccLatest: fmap, accessionList: Array.from(accSet) };
     }, [rows]);

     const tableColumns = useMemo(() => {
          return [
               { Header: 'Field', accessor: 'field' },
               ...accessionList.map(a => ({ Header: String(a), accessor: `asc_${a}` }))
          ];
     }, [accessionList]);

     const tableData = useMemo(() => {
          return Array.from(fieldToAccLatest.entries()).map(([fieldName, accMap]) => {
               const row: any = { field: fieldName };
               accessionList.forEach(a => {
                    row[`asc_${a}`] = accMap.get(String(a))?.value ?? '';
               });
               return row;
          });
     }, [fieldToAccLatest, accessionList]);

     // Per-field latest values across accessions for line chart
     const fieldChartMap = useMemo(() => {
          const out = new Map<string, { asc: string; y: number; date: Date | null }[]>();
          Array.from(fieldToAccLatest.entries()).forEach(([fieldName, accMap]) => {
               const pts: { asc: string; y: number; date: Date | null }[] = [];
               accessionList.forEach(a => {
                    const cell = accMap.get(String(a));
                    const num = parseNumber(cell?.value);
                    if (num != null && !Number.isNaN(num)) {
                         pts.push({ asc: String(a), y: num, date: cell?.date ?? null });
                    }
               });
               pts.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
               out.set(fieldName, pts);
          });
          return out;
     }, [fieldToAccLatest, accessionList]);

     const url = useMemo(() => {
          if (!patientid || !testid) return '';
          return `result/trends?tenantId=3&&patientid=${encodeURIComponent(patientid)}&&testid=${encodeURIComponent(testid)}&&trendNumber=${encodeURIComponent(trendNumber)}&&`;
     }, [patientid, testid, trendNumber]);

     useEffect(() => {
          if (!url) return;
          let ignore = false;
          setLoading(true);
          setError(null);
          customFetch(url)
               .then((data) => {
                    if (ignore) return;
                    const list: TrendRow[] = Array.isArray(data?.data) ? data.data : [];
                    setRows(list);
               })
               .catch((e) => {
                    if (ignore) return;
                    setError(typeof e === 'string' ? e : (e?.message || 'Failed to load trends'));
               })
               .finally(() => {
                    if (!ignore) setLoading(false);
               });
          return () => {
               ignore = true;
          };
     }, [url]);

     return (
          <div style={{ padding: 16 }}>
               <h2 style={{ marginBottom: 8 }}>Result Trends</h2>
               <div style={{ color: '#555', marginBottom: 16 }}>
                    Patient: <strong>{patientid}</strong> · Test: <strong>{testid}</strong> · Last <strong>{trendNumber}</strong> entries
               </div>

               {loading && (
                    <div style={{ marginTop: 20 }}>Loading...</div>
               )}

               {error && (
                    <div style={{ marginTop: 20, color: 'red' }}>{error}</div>
               )}

               {!loading && !error && rows.length === 0 && (
                    <div style={{ marginTop: 20 }}>No trend data.</div>
               )}

               {!loading && !error && rows.length > 0 && (
                    <div>
                         <div style={{ marginBottom: 24 }}>
                              <div style={{ fontWeight: 700, margin: '12px 0' }}>Fields × Accessions</div>
                              <PreviewPatientInformation patientid={patientid} />
                              <PrimeTable column={tableColumns} data={tableData} filtering={true} handleSeverSideProcessing={null} serverSideFiltering={false} />
                         </div>
                    </div>
               )}

               {rows.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                         <h3 style={{ fontSize: 16, margin: 0, marginBottom: 12 }}>Line charts (per field across accessions)</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                              {Array.from(fieldChartMap.entries()).map(([fieldName, pts]) => (
                                   <FieldByAccessionChart key={fieldName} fieldName={fieldName} points={pts} />
                              ))}
                         </div>
                    </div>
               )}
          </div>
     );
}


function parseNumber(v: any): number | null {
     if (v == null) return null;
     if (typeof v === 'number') return v;
     const s = String(v).trim();
     const m = s.match(/-?\d+(?:\.\d+)?/);
     return m ? Number(m[0]) : null;
}

function FieldByAccessionChart({ fieldName, points }: { fieldName: string; points: { asc: string; y: number; date: Date | null }[] }) {
     const width = 360;
     const height = 220;
     const pad = { top: 16, right: 16, bottom: 36, left: 40 };
     const innerW = width - pad.left - pad.right;
     const innerH = height - pad.top - pad.bottom;

     if (!points || points.length === 0) {
          return (
               <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fff' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{fieldName}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>No data</div>
               </div>
          );
     }

     const minY = Math.min(...points.map(p => p.y));
     const maxY = Math.max(...points.map(p => p.y));
     const yPad = (maxY - minY) * 0.05;
     const y0 = minY - yPad;
     const y1 = maxY + yPad || minY + 1;

     const xScale = (i: number) => {
          if (points.length === 1) return pad.left + innerW / 2;
          return pad.left + (i / (points.length - 1)) * innerW;
     };
     const yScale = (v: number) => pad.top + innerH - ((v - y0) / (y1 - y0)) * innerH;

     const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.y)}`).join(' ');

     return (
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#fff' }}>
               <div style={{ fontWeight: 600, marginBottom: 8 }}>{fieldName}</div>
               <svg width={width} height={height}>
                    <rect x={0} y={0} width={width} height={height} fill="#ffffff" />
                    <g>
                         <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="#ccc" />
                         <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#ccc" />
                         <text x={pad.left - 6} y={pad.top + 10} fontSize={10} textAnchor="end" fill="#666">{y1.toFixed(2)}</text>
                         <text x={pad.left - 6} y={pad.top + innerH} dy={-2} fontSize={10} textAnchor="end" fill="#666">{y0.toFixed(2)}</text>
                         <text x={pad.left} y={height - 6} fontSize={10} textAnchor="start" fill="#666">{points[0].asc}</text>
                         <text x={pad.left + innerW} y={height - 6} fontSize={10} textAnchor="end" fill="#666">{points[points.length - 1].asc}</text>
                    </g>
                    <path d={pathD} fill="none" stroke="#1f77b4" strokeWidth={2} />
                    {points.map((p, i) => (
                         <g key={i}>
                              <circle cx={xScale(i)} cy={yScale(p.y)} r={2.5} fill="#1f77b4" />
                         </g>
                    ))}
               </svg>
          </div>
     );
}
