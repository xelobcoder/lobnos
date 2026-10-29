"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiArrowRightLine, RiCheckDoubleLine, RiErrorWarningLine, RiHistoryLine, RiMailSendLine, RiRefreshLine, RiTimeLine, RiMessage2Line } from '@remixicon/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { smsCapabilities, smsStatusLabels, smsError } from '../../../../lib/sms';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './dashboard.module.css';
import ProviderHealth from './ProviderHealth';

type Counts = Record<string, number>;
type Point = { day: string; [key: string]: number | string };
const palette: Record<string, string> = { delivered: '#278b78', submitted: '#3c78a8', sent: '#3c78a8', failed: '#bd5b55', partialfailed: '#c47d32', unknown: '#b57c24', scheduled: '#6787a4', pending: '#81908c', queued: '#81908c', processing: '#7776a3', submitting: '#7776a3', retrying: '#7776a3', cancelled: '#a6aaa8' };
const outcomes = [['delivered', 'Delivered'], ['submitted', 'Submitted'], ['failed', 'Failed'], ['unknown', 'Needs review'], ['queued', 'Queued'], ['processing', 'Submitting'], ['cancelled', 'Cancelled']];
const number = (value: number) => value.toLocaleString();
const dayLabel = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const tooltipStyle = { background: 'var(--bs-body-bg, #fff)', border: '1px solid var(--bs-border-color, #dce4df)', borderRadius: 6, color: 'var(--bs-body-color, #23352a)', fontFamily: 'inherit', fontSize: 13 };
const axis = { fill: 'var(--bs-secondary-color, #65736c)', fontSize: 12 };

function EmptyChart({ children }: { children: React.ReactNode }) {
 return <div className={styles.empty}><RiMessage2Line size={28} aria-hidden="true" /><p>{children}</p></div>;
}

export default function SmsDashboard() {
 const caps = smsCapabilities(useApplication()?.user?.role);
 const [counts, setCounts] = useState<Counts>({}), [jobs, setJobs] = useState<Counts>({});
 const [trends, setTrends] = useState<Point[]>([]), [categories, setCategories] = useState<{ category: string; count: number }[]>([]), [deliveryTrends, setDeliveryTrends] = useState<Point[]>([]);
 const [days, setDays] = useState('30'), [loading, setLoading] = useState(true), [error, setError] = useState(''), [revision, setRevision] = useState(0), [updated, setUpdated] = useState<Date | null>(null);
 useEffect(() => {
  if (!caps.read) return;
  let current = true;
  setLoading(true); setError('');
  Promise.all([
   customFetch('prime/sms-analytics/job-status-counts'), customFetch('prime/sms-analytics/recipient-delivery-counts'),
   customFetch('prime/sms-analytics/job-trends-by-day?days=' + days), customFetch('prime/sms-analytics/job-counts-by-category'),
   customFetch('prime/sms-analytics/delivery-trends-by-day?days=' + days),
  ]).then(([jobResult, recipientResult, trendResult, categoryResult, deliveryResult]) => {
   if (!current) return;
   if (![jobResult, recipientResult, trendResult, categoryResult, deliveryResult].every(result => result?.success)) throw new Error('SMS analytics are unavailable');
   setJobs(jobResult.data || {}); setCounts(recipientResult.data || {});
   setCategories(Object.entries(categoryResult.data || {}).map(([category, count]) => ({ category: category === 'clinician' ? 'Practitioners' : category === 'patient' ? 'Patients' : 'Organizations', count: Number(count) })));
   setTrends(Object.entries(trendResult.data || {}).sort(([a], [b]) => a.localeCompare(b)).map(([day, statuses]) => ({ day, campaigns: Object.values(statuses as Counts).reduce((sum, n) => sum + Number(n), 0) })));
   setDeliveryTrends(Object.entries(deliveryResult.data || {}).sort(([a], [b]) => a.localeCompare(b)).map(([day, raw]) => {
    const row = raw as Counts;
    return { day, delivered: Number(row.delivered || 0), submitted: Number(row.submitted || 0) + Number(row.sent || 0), failed: Number(row.failed || 0), unknown: Number(row.unknown || 0), queued: Number(row.queued || 0), processing: Number(row.submitting || 0) + Number(row.retrying || 0), cancelled: Number(row.cancelled || 0) };
   }));
   setUpdated(new Date());
  }).catch(e => { if (current) setError(smsError(e, 'Unable to load SMS analytics')); }).finally(() => { if (current) setLoading(false); });
  return () => { current = false; };
 }, [days, revision, caps.read]);
 if (!caps.read) return <div role="alert" className="alert alert-info">You do not have access to SMS analytics.</div>;
 const jobSlices = Object.entries(jobs).filter(([, value]) => Number(value) > 0).map(([status, value]) => ({ key: status, name: smsStatusLabels[status] || status, value: Number(value) }));
 const bars = Object.entries(counts).filter(([, value]) => Number(value) > 0).map(([status, count]) => ({ key: status, status: smsStatusLabels[status] || status, count: Number(count) }));
 const totalJobs = Object.values(jobs).reduce((sum, n) => sum + Number(n), 0);
 const totalMessages = Object.values(counts).reduce((sum, n) => sum + Number(n), 0);
 const delivered = Number(counts.delivered || 0), failed = Number(counts.failed || 0), unknown = Number(counts.unknown || 0);
 const metrics = [
  { label: 'Queued / scheduled', value: Number(jobs.pending || 0) + Number(jobs.scheduled || 0), detail: 'Campaigns awaiting processing', Icon: RiTimeLine, tone: 'neutral' },
  { label: 'Submitted', value: Number(counts.submitted || 0) + Number(counts.sent || 0), detail: 'Awaiting delivery confirmation', Icon: RiMailSendLine, tone: 'blue' },
  { label: 'Delivered', value: delivered, detail: 'Confirmed by the provider', Icon: RiCheckDoubleLine, tone: 'green' },
  { label: 'Failed', value: failed, detail: 'Confirmed unsuccessful messages', Icon: RiErrorWarningLine, tone: 'red' },
  { label: 'Needs review', value: unknown, detail: 'Acceptance not yet confirmed', Icon: RiHistoryLine, tone: 'amber' },
 ];
 return <div className={styles.dashboard} aria-busy={loading}>
  <header className={styles.header}>
   <div className={ui.heading}><span className={ui.icon}><RiMessage2Line size={23} aria-hidden="true" /></span><div><span className={ui.eyebrow}>Communications</span><h1>SMS dashboard</h1><p>Track campaigns, message delivery and the items that need attention.</p></div></div>
   <div className={`${ui.actions} ${styles.headerActions}`}>{caps.setup && <Link className={ui.secondary} href="/communications/sms/provider">Provider & credits</Link>}<Link className={ui.secondary} href="/communications/sms/jobs/list"><RiHistoryLine size={17} aria-hidden="true" />Campaign history</Link>{caps.send && <Link className={ui.primary} href="/communications/sms/jobs"><RiMailSendLine size={17} aria-hidden="true" />Compose message</Link>}</div>
  </header>
  <div className={styles.toolbar}><div><span className={styles.liveDot} aria-hidden="true" /><span>{loading ? 'Updating overview…' : error ? 'Overview unavailable' : `Updated ${updated?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) || ''}`}</span></div><button className={ui.secondary} disabled={loading} onClick={() => setRevision(value => value + 1)}><RiRefreshLine size={16} aria-hidden="true" />Refresh</button></div>
  {caps.setup&&<ProviderHealth key={revision}/>}
  {error ? <div className={ui.error} role="alert"><span>{error}</span><button className={ui.secondary} onClick={() => setRevision(value => value + 1)}>Retry analytics</button></div> : loading ? <div className={styles.loading} role="status"><div className={styles.skeletonStats}>{metrics.map(metric => <div key={metric.label} />)}</div><div className={styles.skeletonChart} />Loading SMS analytics…</div> : <>
   <div className={styles.sectionHeading}><h2>Delivery snapshot</h2><span>All live activity</span></div>
   <div className={styles.metrics}>{metrics.map(({ label, value, detail, Icon, tone }) => <article className={styles.metric} data-tone={tone} key={label}><div className={styles.metricTop}><span>{label}</span><Icon size={18} aria-hidden="true" /></div><strong>{number(value)}</strong><p>{detail}</p></article>)}</div>
   <div className={styles.evidence}><span><strong>{number(totalJobs)}</strong> campaigns · <strong>{number(totalMessages)}</strong> messages recorded</span><span>Submitted means accepted; delivered means confirmed by a delivery report.</span></div>
   {(failed > 0 || unknown > 0) && <div className={styles.attention}><RiErrorWarningLine size={20} aria-hidden="true" /><div><strong>Messages need attention</strong><p>{number(failed)} failed · {number(unknown)} awaiting acceptance review. Check provider evidence before retrying.</p></div><Link href="/communications/sms/jobs/list">Review campaigns<RiArrowRightLine size={17} aria-hidden="true" /></Link></div>}
   <div className={styles.analyticsHeading}><div><h2>Campaign analytics</h2><p>Trend charts cover the selected period. Distributions include all recorded activity.</p></div><label className={styles.period}>Trend period<select aria-label="Chart period" value={days} onChange={e => setDays(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label></div>
   <div className={styles.charts}>
    <section className={`${styles.chartPanel} ${styles.activity}`}><div className={styles.chartHeading}><div><h3>Message activity</h3><p>Current outcomes grouped by submission date</p></div><span className={styles.scope}>Last {days} days</span></div>
     {deliveryTrends.length ? <><div className={styles.chart} role="img" aria-label="Message activity over time chart"><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={deliveryTrends} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--bs-border-color, #e5eae7)" strokeDasharray="3 3" /><XAxis dataKey="day" tickFormatter={dayLabel} tick={axis} axisLine={false} tickLine={false} minTickGap={35} /><YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} labelFormatter={value => dayLabel(String(value))} />{outcomes.map(([key, name]) => <Area isAnimationActive={false} key={key} type="linear" dataKey={key} name={name} stackId="messages" stroke={palette[key]} fill={palette[key]} fillOpacity={.16} strokeWidth={2} />)}</AreaChart></ResponsiveContainer></div><div className={styles.legend}>{outcomes.filter(([key]) => deliveryTrends.some(point => Number(point[key]) > 0)).map(([key, name]) => <span key={key}><i style={{ background: palette[key] }} />{name}</span>)}</div></> : <EmptyChart>No message activity in this period.</EmptyChart>}
     <p className={styles.footnote}>Queued messages use campaign creation date. This chart does not represent the date of delivery.</p>
    </section>
    <section className={styles.chartPanel}><div className={styles.chartHeading}><div><h3>Campaign status</h3><p>Current processing states</p></div><span className={styles.scope}>All activity</span></div>
     {jobSlices.length ? <><div className={styles.donut} role="img" aria-label="Campaign status distribution chart"><ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie isAnimationActive={false} data={jobSlices} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="var(--bs-body-bg, #fff)">{jobSlices.map(row => <Cell key={row.key} fill={palette[row.key] || '#81908c'} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className={styles.donutTotal}><strong>{number(totalJobs)}</strong><span>campaigns</span></div></div><div className={styles.legend}>{jobSlices.map(row => <span key={row.key}><i style={{ background: palette[row.key] || '#81908c' }} />{row.name}<b>{number(row.value)}</b></span>)}</div></> : <EmptyChart>No campaigns recorded yet.</EmptyChart>}
    </section>
    <section className={styles.chartPanel}><div className={styles.chartHeading}><div><h3>Delivery states</h3><p>Messages by current outcome</p></div><span className={styles.scope}>All activity</span></div>
     {bars.length ? <><div className={styles.chart} role="img" aria-label="Message delivery status chart"><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={bars} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--bs-border-color, #e5eae7)" strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="status" width={100} tick={axis} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bs-tertiary-bg, #f5f8f6)' }} /><Bar isAnimationActive={false} dataKey="count" name="Messages" maxBarSize={24} radius={[0, 3, 3, 0]}>{bars.map(row => <Cell key={row.key} fill={palette[row.key] || '#81908c'} />)}</Bar></BarChart></ResponsiveContainer></div><ul className="visually-hidden">{bars.map(row => <li key={row.key}>{row.status}: {row.count}</li>)}</ul></> : <EmptyChart>No messages recorded yet.</EmptyChart>}
    </section>
    <section className={styles.chartPanel}><div className={styles.chartHeading}><div><h3>Recipient categories</h3><p>Campaigns by audience</p></div><span className={styles.scope}>All activity</span></div>
     {categories.some(row => row.count > 0) ? <div className={styles.chart} role="img" aria-label="Campaigns by recipient category chart"><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={categories} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--bs-border-color, #e5eae7)" strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="category" width={100} tick={axis} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bs-tertiary-bg, #f5f8f6)' }} /><Bar isAnimationActive={false} dataKey="count" name="Campaigns" fill="var(--pls-primary, #2e7d32)" maxBarSize={26} radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyChart>No recipient-category activity recorded.</EmptyChart>}
    </section>
    <section className={styles.chartPanel}><div className={styles.chartHeading}><div><h3>Campaigns created</h3><p>New campaigns per day</p></div><span className={styles.scope}>Last {days} days</span></div>
     {trends.length ? <div className={styles.chart} role="img" aria-label="Campaigns created per day"><ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={trends} margin={{ top: 16, right: 15, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--bs-border-color, #e5eae7)" strokeDasharray="3 3" /><XAxis dataKey="day" tickFormatter={dayLabel} tick={axis} axisLine={false} tickLine={false} minTickGap={35} /><YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} labelFormatter={value => dayLabel(String(value))} /><Line isAnimationActive={false} dataKey="campaigns" name="Campaigns" stroke="var(--pls-primary, #2e7d32)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div> : <EmptyChart>No campaigns created in this period.</EmptyChart>}
    </section>
   </div>
  </>}
 </div>;
}
