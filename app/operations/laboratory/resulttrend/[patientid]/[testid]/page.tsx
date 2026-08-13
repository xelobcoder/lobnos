'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import PreviewPatientInformation from '../../../../../../components/petientsComponent/PreviewPatientInformation';
import styles from './page.module.css';


interface TrendRow {
     ascensionid: number | string;
     field: string;
     value: string | number | null;
     created_on: string;
     upperlimit?: string | number | null;
     lowerlimit?: string | number | null;
     units?: string | null;
     textReference?: string | null;
     plan?: string | null;
     fieldid?: number | string;
}

interface TrendPoint {
     asc: string;
     y: number;
     date: Date | null;
     lowerLimit: number | null;
     upperLimit: number | null;
     units: string;
     textReference: string;
     plan: string;
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
     const [chartDisplayMode, setChartDisplayMode] = useState<'chart' | 'list'>('chart');

     // Build field -> accession latest map and accession list
     const { fieldToAccLatest, accessionList } = useMemo(() => {
          const accSet = new Set<string>();
          const fmap = new Map<string, Map<string, {
               value: string | number | null;
               date: Date | null;
               lowerLimit: number | null;
               upperLimit: number | null;
               units: string;
               textReference: string;
               plan: string;
          }>>();
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
                    accMap.set(asc, {
                         value: r.value ?? '',
                         date: Number.isNaN(dt.getTime()) ? null : dt,
                         lowerLimit: parseNumber(r.lowerlimit),
                         upperLimit: parseNumber(r.upperlimit),
                         units: String(r.units ?? '').trim(),
                         textReference: String(r.textReference ?? '').trim(),
                         plan: String(r.plan ?? '').trim(),
                    });
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
          const out = new Map<string, TrendPoint[]>();
          Array.from(fieldToAccLatest.entries()).forEach(([fieldName, accMap]) => {
               const pts: TrendPoint[] = [];
               accessionList.forEach(a => {
                    const cell = accMap.get(String(a));
                    const num = parseNumber(cell?.value);
                    if (num != null && !Number.isNaN(num)) {
                         pts.push({
                              asc: String(a),
                              y: num,
                              date: cell?.date ?? null,
                              lowerLimit: cell?.lowerLimit ?? null,
                              upperLimit: cell?.upperLimit ?? null,
                              units: cell?.units ?? '',
                              textReference: cell?.textReference ?? '',
                              plan: cell?.plan ?? '',
                         });
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
          <div className={styles.page}>
               {patientid && (
                    <section className={styles.sectionCard}>
                         <header className={styles.sectionHead}>
                              <h3 className={styles.sectionTitle}>Patient Information</h3>
                         </header>
                         <div className={styles.sectionBody}>
                              <PreviewPatientInformation patientid={patientid} compact />
                         </div>
                    </section>
               )}

               <section className={styles.hero}>
                    <div className={styles.heroTop}>
                         <div>
                              <h2 className={styles.title}>Result Trends</h2>
                              <p className={styles.subtitle}>Historical values grouped by accession and analyte field</p>
                         </div>
                         <div className={styles.kpiBadge}>Trend Window: Last {trendNumber}</div>
                    </div>

                    <div className={styles.metaGrid}>
                         <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Patient ID</span>
                              <span className={styles.metaValue}>{patientid || 'N/A'}</span>
                         </div>
                         <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Test ID</span>
                              <span className={styles.metaValue}>{testid || 'N/A'}</span>
                         </div>
                         <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Trend Rows</span>
                              <span className={styles.metaValue}>{rows.length}</span>
                         </div>
                         <div className={styles.metaItem}>
                              <span className={styles.metaLabel}>Accessions</span>
                              <span className={styles.metaValue}>{accessionList.length}</span>
                         </div>
                    </div>

                    {loading && (
                         <div className={styles.alertBox}>Loading trend data...</div>
                    )}

                    {error && (
                         <div className={`${styles.alertBox} ${styles.alertError}`}>{error}</div>
                    )}

                    {!loading && !error && rows.length === 0 && (
                         <div className={styles.alertBox}>No trend data found for this patient and test.</div>
                    )}
               </section>

               {!loading && !error && rows.length > 0 && (
                    <section className={styles.sectionCard}>
                         <header className={styles.sectionHead}>
                              <h3 className={styles.sectionTitle}>Fields x Accessions Matrix</h3>
                              <p className={styles.sectionHint}>Use search/filter to quickly inspect value changes across accessions.</p>
                         </header>
                         <div className={styles.sectionBody}>
                              <div className={styles.simpleTableWrap}>
                                   <table className={styles.simpleTable}>
                                        <thead>
                                             <tr>
                                                  {tableColumns.map((col: any) => (
                                                       <th key={String(col.accessor || col.Header)}>{col.Header}</th>
                                                  ))}
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {tableData.length === 0 ? (
                                                  <tr>
                                                       <td colSpan={tableColumns.length} className={styles.simpleTableEmpty}>
                                                            No table data available.
                                                       </td>
                                                  </tr>
                                             ) : (
                                                  tableData.map((row: any, rowIndex: number) => (
                                                       <tr key={rowIndex}>
                                                            {tableColumns.map((col: any) => (
                                                                 <td key={`${rowIndex}-${String(col.accessor)}`}>
                                                                      {row[col.accessor] ?? ''}
                                                                 </td>
                                                            ))}
                                                       </tr>
                                                  ))
                                             )}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </section>
               )}

               {rows.length > 0 && (
                    <section className={`${styles.sectionCard} ${styles.chartSection}`}>
                         <header className={styles.sectionHead}>
                              <div className={styles.sectionHeadRow}>
                                   <div>
                                        <h3 className={styles.sectionTitle}>Field Trend Cards</h3>
                                        <p className={styles.sectionHint}>Switch between line chart and value-list view.</p>
                                   </div>
                                   <div className={styles.viewToggle}>
                                        <button
                                             type="button"
                                             className={`${styles.viewBtn} ${chartDisplayMode === 'chart' ? styles.viewBtnActive : ''}`}
                                             onClick={() => setChartDisplayMode('chart')}
                                        >
                                             Chart
                                        </button>
                                        <button
                                             type="button"
                                             className={`${styles.viewBtn} ${chartDisplayMode === 'list' ? styles.viewBtnActive : ''}`}
                                             onClick={() => setChartDisplayMode('list')}
                                        >
                                             Values
                                        </button>
                                   </div>
                              </div>
                         </header>
                         <div className={styles.sectionBody}>
                              <div className={styles.chartGrid}>
                                   {Array.from(fieldChartMap.entries()).map(([fieldName, pts]) => (
                                        <FieldByAccessionChart
                                             key={fieldName}
                                             fieldName={fieldName}
                                             points={pts}
                                             displayMode={chartDisplayMode}
                                        />
                                   ))}
                              </div>
                         </div>
                    </section>
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

function formatTrendDate(dt: Date | null): string {
     if (!dt || Number.isNaN(dt.getTime())) return 'Unknown date';
     return dt.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
     });
}

function FieldByAccessionChart({
     fieldName,
     points,
     displayMode,
}: {
     fieldName: string;
     points: TrendPoint[];
     displayMode: 'chart' | 'list';
}) {
     const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
     const width = 420;
     const height = 240;
     const pad = { top: 16, right: 16, bottom: 36, left: 40 };
     const innerW = width - pad.left - pad.right;
     const innerH = height - pad.top - pad.bottom;

     if (!points || points.length === 0) {
          return (
               <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>{fieldName}</h4>
                    <p className={styles.chartEmpty}>No numeric values available</p>
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
     const areaD = `${pathD} L ${xScale(points.length - 1)} ${pad.top + innerH} L ${xScale(0)} ${pad.top + innerH} Z`;
     const latest = points[points.length - 1]?.y ?? 0;
     const latestUnit = points[points.length - 1]?.units || '';
     const previous = points.length > 1 ? points[points.length - 2]?.y ?? latest : latest;
     const delta = latest - previous;
     const deltaAbs = Math.abs(delta);
     const deltaDirection = delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'no change';
     const yTicks = Array.from({ length: 5 }, (_, idx) => {
          const ratio = idx / 4;
          const value = y1 - (y1 - y0) * ratio;
          return { value, y: pad.top + innerH * ratio };
     });
     const chartId = fieldName.replace(/[^a-zA-Z0-9_-]/g, '_');

     const hoverPoint = hoveredIndex != null ? points[hoveredIndex] : null;
     const hoverPrev = hoveredIndex != null && hoveredIndex > 0 ? points[hoveredIndex - 1] : null;
     const hoverDelta = hoverPoint && hoverPrev ? hoverPoint.y - hoverPrev.y : null;
     const hoverPercent =
          hoverDelta != null && hoverPrev && hoverPrev.y !== 0
               ? (hoverDelta / Math.abs(hoverPrev.y)) * 100
               : null;
     const tooltipXRaw = hoveredIndex != null ? xScale(hoveredIndex) + 12 : 0;
     const tooltipYRaw = hoveredIndex != null ? yScale(points[hoveredIndex].y) - 112 : 0;
     const tooltipW = 236;
     const tooltipH = 110;
     const tooltipX = Math.max(6, Math.min(width - tooltipW - 6, tooltipXRaw));
     const tooltipY = Math.max(6, Math.min(height - tooltipH - 6, tooltipYRaw));

     const handleChartMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const relativeX = ((event.clientX - rect.left) / rect.width) * width;
          if (relativeX < pad.left || relativeX > pad.left + innerW) {
               setHoveredIndex(null);
               return;
          }

          let closestIndex = 0;
          let closestDistance = Number.POSITIVE_INFINITY;

          for (let i = 0; i < points.length; i += 1) {
               const distance = Math.abs(xScale(i) - relativeX);
               if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
               }
          }

          setHoveredIndex(closestIndex);
     };

     if (displayMode === 'list') {
          return (
               <div className={styles.chartCard}>
                    <h4 className={styles.chartTitle}>{fieldName}</h4>
                    <div className={styles.valueListWrap}>
                         {[...points].reverse().map((point) => {
                              const currentIndex = points.findIndex((x) => x.asc === point.asc && x.y === point.y && x.date?.getTime() === point.date?.getTime());
                              const previousPoint = currentIndex > 0 ? points[currentIndex - 1] : null;
                              const diff = previousPoint ? point.y - previousPoint.y : null;
                              const diffLabel =
                                   diff == null
                                        ? 'first result'
                                        : `${Math.abs(diff).toFixed(2)} ${diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'no change'}`;
                              const hasLimits =
                                   point.lowerLimit != null &&
                                   point.upperLimit != null &&
                                   point.upperLimit > point.lowerLimit;
                              const markerPercent = hasLimits
                                   ? (() => {
                                        const lower = point.lowerLimit as number;
                                        const upper = point.upperLimit as number;
                                        const span = upper - lower;
                                        const pad = Math.max(span * 0.5, 0.0001);
                                        const domainMin = Math.min(lower - pad, point.y);
                                        const domainMax = Math.max(upper + pad, point.y);
                                        const domainSpan = Math.max(domainMax - domainMin, 0.0001);
                                        return Math.max(0, Math.min(100, ((point.y - domainMin) / domainSpan) * 100));
                                   })()
                                   : null;
                              const lowerTickPercent = hasLimits
                                   ? (() => {
                                        const lower = point.lowerLimit as number;
                                        const upper = point.upperLimit as number;
                                        const span = upper - lower;
                                        const pad = Math.max(span * 0.5, 0.0001);
                                        const domainMin = Math.min(lower - pad, point.y);
                                        const domainMax = Math.max(upper + pad, point.y);
                                        const domainSpan = Math.max(domainMax - domainMin, 0.0001);
                                        return Math.max(0, Math.min(100, ((lower - domainMin) / domainSpan) * 100));
                                   })()
                                   : null;
                              const upperTickPercent = hasLimits
                                   ? (() => {
                                        const lower = point.lowerLimit as number;
                                        const upper = point.upperLimit as number;
                                        const span = upper - lower;
                                        const pad = Math.max(span * 0.5, 0.0001);
                                        const domainMin = Math.min(lower - pad, point.y);
                                        const domainMax = Math.max(upper + pad, point.y);
                                        const domainSpan = Math.max(domainMax - domainMin, 0.0001);
                                        return Math.max(0, Math.min(100, ((upper - domainMin) / domainSpan) * 100));
                                   })()
                                   : null;
                              const markerClass = hasLimits
                                   ? point.y < (point.lowerLimit as number)
                                        ? styles.valueRangeMarkerLow
                                        : point.y > (point.upperLimit as number)
                                             ? styles.valueRangeMarkerHigh
                                             : styles.valueRangeMarkerNormal
                                   : styles.valueRangeMarkerNormal;

                              return (
                                   <div key={`${point.asc}-${point.y}-${point.date?.getTime() || 'na'}`} className={styles.valueRow}>
                                        <div>
                                             <div className={styles.valueRowDate}>{formatTrendDate(point.date)}</div>
                                             <div className={styles.valueRowPrimary}>
                                                  {point.y.toFixed(2)}
                                                  {point.units ? <span className={styles.valueUnit}> {point.units}</span> : null}
                                             </div>

                                             {hasLimits && markerPercent != null ? (
                                                  <div className={styles.valueRangeBlock}>
                                                       <div className={styles.valueReferenceSentence}>
                                                            The reference range is between {(point.lowerLimit as number).toFixed(2)} and {(point.upperLimit as number).toFixed(2)}
                                                            {point.units ? ` ${point.units}` : ''}.
                                                       </div>

                                                       <div className={styles.valueRangeScaleV2}>
                                                            <div
                                                                 className={styles.valueMarkerWrapV2}
                                                                 style={{ left: `${markerPercent}%` }}
                                                            >
                                                                 <div className={styles.valueMarkerValueV2}>{point.y.toFixed(2)}</div>
                                                                 <div className={styles.valueMarkerArrowV2} />
                                                            </div>

                                                            <div className={styles.valueRangeTrackV2}>
                                                                 <div
                                                                      className={styles.valueRangeOutV2}
                                                                      style={{ width: `${lowerTickPercent ?? 0}%` }}
                                                                 />
                                                                 <div
                                                                      className={styles.valueRangeNormalV2}
                                                                      style={{ width: `${Math.max((upperTickPercent ?? 0) - (lowerTickPercent ?? 0), 0)}%` }}
                                                                 />
                                                                 <div
                                                                      className={styles.valueRangeOutV2}
                                                                      style={{ width: `${Math.max(100 - (upperTickPercent ?? 100), 0)}%` }}
                                                                 />
                                                            </div>

                                                            <div className={styles.valueRangeTicksV2}>
                                                                 <span
                                                                      className={styles.valueRangeTickV2}
                                                                      style={{ left: `${lowerTickPercent ?? 0}%` }}
                                                                 >
                                                                      {(point.lowerLimit as number).toFixed(2)}
                                                                 </span>
                                                                 <span
                                                                      className={styles.valueRangeTickV2}
                                                                      style={{ left: `${upperTickPercent ?? 100}%` }}
                                                                 >
                                                                      {(point.upperLimit as number).toFixed(2)}
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ) : point.textReference ? (
                                                  <div className={styles.valueReferenceText}>Reference: {point.textReference}</div>
                                             ) : null}
                                        </div>
                                        <div className={styles.valueRowMeta}>{diffLabel}</div>
                                   </div>
                              );
                         })}
                    </div>
               </div>
          );
     }

     return (
          <div className={styles.chartCard}>
               <h4 className={styles.chartTitle}>{fieldName}</h4>
               <div className={styles.chartStatRow}>
                    <div className={styles.chartPrimaryValue}>
                         {latest.toFixed(2)}
                         {latestUnit ? <span className={styles.chartPrimaryUnit}> {latestUnit}</span> : null}
                    </div>
                    <div
                         className={`${styles.chartDelta} ${delta > 0 ? styles.chartDeltaUp : delta < 0 ? styles.chartDeltaDown : styles.chartDeltaFlat}`}
                    >
                         {deltaAbs.toFixed(2)} {deltaDirection}
                    </div>
               </div>
               <svg
                    className={styles.chartSvg}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={() => setHoveredIndex(null)}
               >
                    <rect className={styles.chartPlotBg} x={0} y={0} width={width} height={height} />
                    <defs>
                         <linearGradient id={`trendLine-${chartId}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="var(--rt-chart-line-start)" />
                              <stop offset="100%" stopColor="var(--rt-chart-line-end)" />
                         </linearGradient>
                         <linearGradient id={`trendArea-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--rt-chart-area-start)" />
                              <stop offset="100%" stopColor="var(--rt-chart-area-end)" />
                         </linearGradient>
                    </defs>
                    <g>
                         {yTicks.map((tick, i) => (
                              <g key={i}>
                                   <line className={styles.chartGridLine} x1={pad.left} y1={tick.y} x2={pad.left + innerW} y2={tick.y} />
                                   <text className={styles.chartAxisText} x={pad.left - 6} y={tick.y + 3} textAnchor="end">{tick.value.toFixed(2)}</text>
                              </g>
                         ))}
                         <line className={styles.chartAxisLine} x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} />
                         <line className={styles.chartAxisLine} x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} />
                         <text className={styles.chartAxisText} x={pad.left} y={height - 6} textAnchor="start">{points[0].asc}</text>
                         <text className={styles.chartAxisText} x={pad.left + innerW} y={height - 6} textAnchor="end">{points[points.length - 1].asc}</text>
                    </g>
                    <path d={areaD} fill={`url(#trendArea-${chartId})`} />
                    <path className={styles.chartLine} d={pathD} stroke={`url(#trendLine-${chartId})`} />
                    {points.map((p, i) => (
                         <g key={i}>
                              <circle
                                   className={styles.chartDot}
                                   cx={xScale(i)}
                                   cy={yScale(p.y)}
                                   r={hoveredIndex === i ? 4.2 : 3.2}
                              />
                         </g>
                    ))}
                    <text
                         className={styles.chartLastValue}
                         x={xScale(points.length - 1)}
                         y={yScale(points[points.length - 1].y) - 8}
                         textAnchor="middle"
                    >
                         {points[points.length - 1].y.toFixed(2)}
                    </text>

                    {hoveredIndex != null && hoverPoint && (
                         <g>
                              <line
                                   className={styles.chartHoverGuide}
                                   x1={xScale(hoveredIndex)}
                                   y1={pad.top}
                                   x2={xScale(hoveredIndex)}
                                   y2={pad.top + innerH}
                              />
                              <rect className={styles.chartTooltipBox} x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={8} ry={8} />
                              <text className={styles.chartTooltipTitle} x={tooltipX + 12} y={tooltipY + 20}>
                                   {formatTrendDate(hoverPoint.date)}
                              </text>
                              <text className={styles.chartTooltipAccent} x={tooltipX + 12} y={tooltipY + 41}>
                                   Value: {hoverPoint.y.toFixed(2)}{hoverPoint.units ? ` ${hoverPoint.units}` : ''}
                              </text>
                              <text className={styles.chartTooltipText} x={tooltipX + 12} y={tooltipY + 62}>
                                   Amount change: {hoverDelta == null ? 'N/A' : `${hoverDelta >= 0 ? '+' : ''}${hoverDelta.toFixed(2)}`}
                              </text>
                              <text className={styles.chartTooltipText} x={tooltipX + 12} y={tooltipY + 80}>
                                   Percent: {hoverPercent == null ? 'N/A' : `${hoverPercent >= 0 ? '+' : ''}${hoverPercent.toFixed(2)}%`}
                              </text>
                              {hoverPoint.lowerLimit != null && hoverPoint.upperLimit != null && hoverPoint.upperLimit > hoverPoint.lowerLimit && (
                                   <text className={styles.chartTooltipText} x={tooltipX + 12} y={tooltipY + 97}>
                                        Range: {hoverPoint.lowerLimit.toFixed(2)} - {hoverPoint.upperLimit.toFixed(2)}
                                   </text>
                              )}
                         </g>
                    )}
               </svg>
          </div>
     );
}
