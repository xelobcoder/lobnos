"use client";

import { useId } from 'react';
import { PortalTrendRow, numericTrendValue, trendTimestamp } from '../../lib/patientPortalTrends';
import { formatDate } from '../../lib/patientPortal';
import styles from './trends.module.css';

/** An SVG overview only. The adjacent semantic table is the complete, accessible source of values. */
export default function TrendChart({ rows, field, units }: { rows: PortalTrendRow[]; field: string; units: string }) {
     const id = useId();
     const dated = rows.filter(row => trendTimestamp(row.recordedOn) !== null);
     const numeric = dated.filter(row => numericTrendValue(row.value) !== null);
     if (!numeric.length) return <p className={styles.notice}>No dated, purely numeric values to plot for this parameter. All recorded values are in the table below.</p>;
     const times = dated.map(row => trendTimestamp(row.recordedOn)!);
     const values = numeric.map(row => numericTrendValue(row.value)!);
     const first = Math.min(...times), last = Math.max(...times);
     const low = Math.min(...values), high = Math.max(...values);
     const padding = high === low ? Math.max(Math.abs(low) * 0.1, 1) : (high - low) * 0.1;
     const yMin = low - padding, yMax = high + padding;
     const x = (row: PortalTrendRow) => first === last ? 320 : 65 + (trendTimestamp(row.recordedOn)! - first) / (last - first) * 510;
     const y = (row: PortalTrendRow) => 185 - (numericTrendValue(row.value)! - yMin) / (yMax - yMin) * 160;
     let connected = false;
     const path = dated.map(row => {
          if (numericTrendValue(row.value) === null) { connected = false; return ''; }
          const command = `${connected ? 'L' : 'M'} ${x(row)} ${y(row)}`;
          connected = true;
          return command;
     }).join(' ');

     return (
          <figure className={styles.figure}>
               <svg viewBox="0 0 640 240" role="img" aria-labelledby={`${id}-title ${id}-desc`} className={styles.chart}>
                    <title id={`${id}-title`}>{`${field} numeric history${units ? ` (${units})` : ''}`}</title>
                    <desc id={`${id}-desc`}>{numeric.length} numeric measurements, from {formatDate(new Date(first).toISOString())} to {formatDate(new Date(last).toISOString())}. Exact dates, values, units and reference ranges are in the data table. Nonnumeric values are not plotted; lines break at those entries.</desc>
                    {[yMax, (yMax + yMin) / 2, yMin].map((value, index) => (
                         <g key={index}>
                              <line x1="65" x2="575" y1={25 + index * 80} y2={25 + index * 80} stroke="#d9e2e8" />
                              <text x="57" y={29 + index * 80} textAnchor="end" className={styles.axis}>{Number(value.toPrecision(4))}</text>
                         </g>
                    ))}
                    <path d={path} fill="none" stroke="#176c70" strokeWidth="2.5" />
                    {numeric.map((row, index) => (
                         <circle key={`${row.ascensionid}-${index}`} cx={x(row)} cy={y(row)} r="4.5" fill="#176c70" stroke="white" strokeWidth="1.5">
                              <title>{`${formatDate(row.recordedOn)}: ${row.value} ${units}`}</title>
                         </circle>
                    ))}
                    <text x="65" y="211" className={styles.axis}>{formatDate(new Date(first).toISOString())}</text>
                    <text x="575" y="211" textAnchor="end" className={styles.axis}>{formatDate(new Date(last).toISOString())}</text>
               </svg>
               <figcaption className={styles.notice}>
                    {numeric.length === 1 ? 'One numeric result; more results are needed to show a trend. ' : ''}
                    {rows.length - numeric.length > 0 ? `${rows.length - numeric.length} nonnumeric or undated value(s) are shown only in the table. ` : ''}
                    Each point is a recorded value, not a prediction. Lines are a visual guide, not a clinical interpretation.
               </figcaption>
          </figure>
     );
}
