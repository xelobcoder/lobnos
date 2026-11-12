'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RiMailLine } from '@remixicon/react';
import { callGet } from '../_lib';
import EmailPageHero from './EmailPageHero';
import ui from '../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './EmailOverview.module.css';

type Trend = { day: string; sent: number; failed: number };
type Analytics = {
    overview: { total: number; sent: number; failed: number };
    dailyTrend: Trend[];
    queueMetrics: Record<string, number>;
    providerPerformance: { provider: string; sent: number; failed: number }[];
};
const count = (value: unknown) => Number(value) || 0;
const number = (value: unknown) => count(value).toLocaleString();
const success = 'var(--pls-primary, #2e7d32)';
const danger = 'var(--bs-danger, #b42318)';

export default function EmailOverview() {
    const [days, setDays] = useState(30);
    const [revision, setRevision] = useState(0);
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let live = true;
        setLoading(true); setError(''); setData(null);
        callGet(`email/analytics?days=${days}`).then(response => {
            if (!response?.result?.overview) throw Error('Email analytics returned an incomplete response.');
            if (live) setData(response.result);
        }).catch(error => { if (live) setError(error instanceof Error ? error.message : 'Unable to load email analytics.'); })
            .finally(() => { if (live) setLoading(false); });
        return () => { live = false; };
    }, [days, revision]);
    const trend = (data?.dailyTrend || []).map(row => ({...row, day:String(row.day).slice(0, 10), sent:count(row.sent), failed:count(row.failed)}));
    const queue = ['pending', 'scheduled', 'processing', 'failed', 'sent', 'cancelled'].map(status => ({status, messages:count(data?.queueMetrics?.[status])}));
    const providers = (data?.providerPerformance || []).map(row => ({...row, sent:count(row.sent), failed:count(row.failed)}));
    return <>
        <EmailPageHero title="Email overview" subtitle="Monitor outbound email, review failures and manage your message templates." icon={<RiMailLine size={24}/>} stats={data ? [
            {label:`Delivery attempts · ${days} days`,value:number(data.overview.total)},
            {label:'Accepted by provider',value:number(data.overview.sent)},
            {label:'Failed attempts',value:number(data.overview.failed)},
            {label:'Awaiting processing · current',value:number(count(data.queueMetrics?.pending) + count(data.queueMetrics?.scheduled))},
        ] : []}/>
        <div className={styles.controls}><label>Reporting period<select value={days} onChange={event => setDays(Number(event.target.value))}>{[7,30,90].map(value => <option key={value} value={value}>Last {value} days</option>)}</select></label><button className={ui.secondary} disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh overview</button><Link href="/email-services/queue" className={ui.primary}>Review email queue</Link></div>
        {loading && <p role="status">Loading email overview…</p>}
        {error && <div role="alert" className={ui.error}>{error}<button className={ui.secondary} onClick={() => setRevision(value => value + 1)}>Try again</button></div>}
        {data && <div className={styles.charts}>
            <section className={ui.panel}><h2>Email activity</h2><p className={ui.help}>Provider acceptance and failed attempts over the last {days} days. Retries count as separate attempts.</p>{trend.length ? <><div className={styles.chart}><ResponsiveContainer width="100%" height="100%" minWidth={0}><LineChart data={trend} margin={{top:16,right:20,bottom:8,left:0}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tick={{fontSize:12}}/><YAxis allowDecimals={false}/><Tooltip/><Legend/><Line name="Accepted" type="monotone" dataKey="sent" stroke={success} strokeWidth={2} dot={trend.length === 1}/><Line name="Failed" type="monotone" dataKey="failed" stroke={danger} strokeWidth={2} dot={trend.length === 1}/></LineChart></ResponsiveContainer></div><details><summary>View activity figures</summary><div className={ui.tableWrap}><table className={ui.table}><thead><tr><th>Date</th><th>Accepted</th><th>Failed</th></tr></thead><tbody>{trend.map(row => <tr key={row.day}><td>{row.day}</td><td>{number(row.sent)}</td><td>{number(row.failed)}</td></tr>)}</tbody></table></div></details></> : <p className={ui.empty}>No email attempts were recorded in this period.</p>}</section>
            <section className={ui.panel}><h2>Current queue</h2><p className={ui.help}>All queued messages, grouped by their latest status.</p><div className={styles.chart}><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={queue} layout="vertical" margin={{top:8,right:20,bottom:8,left:16}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis dataKey="status" type="category" width={85}/><Tooltip/><Bar name="Messages" dataKey="messages" fill={success} maxBarSize={24}/></BarChart></ResponsiveContainer></div><div className={styles.queueCounts}>{queue.map(row => <Link href="/email-services/queue" key={row.status}><span>{row.status}</span><strong>{number(row.messages)}</strong></Link>)}</div></section>
            <section className={`${ui.panel} ${styles.wide}`}><h2>Provider performance</h2><p className={ui.help}>Accepted and failed attempts for each provider in this reporting period.</p>{providers.length ? <><div className={styles.chart}><ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={providers} margin={{top:12,right:20,bottom:8,left:0}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="provider"/><YAxis allowDecimals={false}/><Tooltip/><Legend/><Bar name="Accepted" dataKey="sent" fill={success}/><Bar name="Failed" dataKey="failed" fill={danger}/></BarChart></ResponsiveContainer></div><details><summary>View provider figures</summary><div className={ui.tableWrap}><table className={ui.table}><thead><tr><th>Provider</th><th>Accepted</th><th>Failed</th></tr></thead><tbody>{providers.map(row => <tr key={row.provider}><td>{row.provider}</td><td>{number(row.sent)}</td><td>{number(row.failed)}</td></tr>)}</tbody></table></div></details></> : <p>No provider activity was recorded in this period.</p>}</section>
        </div>}
    </>;
}
