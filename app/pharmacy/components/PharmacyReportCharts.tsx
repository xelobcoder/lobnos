'use client';
import { useState, type ReactNode } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { RiAreaChartLine, RiBarChartBoxLine, RiLineChartLine, RiPieChartLine } from '@remixicon/react';
import { money } from './PharmacyWorkspace';
import css from './PharmacyReportCharts.module.css';

// Classic Google Charts series palette.
const colors = ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6'];
const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
const quantity = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });
type ChartType = 'bar' | 'line' | 'area';
type Series = { key: string; name: string };
type Spec = { label: string; series: Series[]; title: string; currency: boolean; type?: ChartType };
type Toggle = { value: ChartType; set: (value: ChartType) => void };
const views: { type: ChartType; label: string; icon: typeof RiBarChartBoxLine }[] = [
     { type: 'bar', label: 'Bar', icon: RiBarChartBoxLine },
     { type: 'line', label: 'Line', icon: RiLineChartLine },
     { type: 'area', label: 'Area', icon: RiAreaChartLine },
];
const s = (key: string, name: string): Series => ({ key, name });
const specs: Record<string, Spec> = {
     sales: { label: 'medicine', series: [s('netSales', 'Net sales'), s('grossProfit', 'Gross profit')], title: 'Medicine sales and gross profit', currency: true },
     inventory: { label: 'name', series: [s('stockValue', 'Stock at cost'), s('retailValue', 'Retail value')], title: 'Stock cost and retail value', currency: true },
     expiry: { label: 'medicine', series: [s('stockValue', 'Value at cost')], title: 'Batch expiry exposure at cost', currency: true },
     procurement: { label: 'medicine', series: [s('ordered', 'Ordered'), s('received', 'Received'), s('outstanding', 'Outstanding')], title: 'Purchase order fulfilment', currency: false },
     suppliers: { label: 'supplier', series: [s('value', 'Order value')], title: 'Supplier order values', currency: true },
     movements: { label: 'medicine', series: [s('quantity', 'Net quantity moved')], title: 'Stock movement quantities', currency: false },
     finance: { label: 'accountName', series: [s('debit', 'Debit'), s('credit', 'Credit')], title: 'Account activity', currency: true },
     profit_loss: { label: 'account', series: [s('amount', 'Amount')], title: 'Revenue and expense accounts', currency: true },
     balance_sheet: { label: 'account', series: [s('amount', 'Amount')], title: 'Assets, liabilities and equity accounts', currency: true },
     trial_balance: { label: 'account', series: [s('debit', 'Debit'), s('credit', 'Credit')], title: 'Trial balance', currency: true },
     cash_flow: { label: 'date', series: [s('inflow', 'Inflow'), s('outflow', 'Outflow'), s('net', 'Net')], title: 'Collection account movements', currency: true, type: 'line' },
};
const shorten = (value: unknown) => { const text = String(value ?? ''); return text.length > 16 ? text.slice(0, 15) + '…' : text; };

/** Sums rows that share a label so repeated medicines or accounts appear once. */
function group(rows: any[], spec: Spec, limit = 20) {
     const map = new Map<string, Record<string, any>>();
     for (const row of rows) {
          const label = String(row[spec.label] ?? 'Unnamed');
          const entry = map.get(label) ?? { [spec.label]: label };
          for (const { key } of spec.series) entry[key] = (Number(entry[key]) || 0) + (Number(row[key]) || 0);
          map.set(label, entry);
     }
     return [...map.values()].slice(0, limit);
}

function ChartCard({ title, subtitle, icon, toggle, footnote, children }: { title: string; subtitle?: string; icon?: ReactNode; toggle?: Toggle; footnote?: string; children: ReactNode }) {
     return <section className={css.chart} aria-label={title}>
          <div className={css.head}>
               <div className={css.title}><span className={css.icon} aria-hidden="true">{icon ?? <RiBarChartBoxLine size={18}/>}</span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>
               {toggle && <div className={css.toggle} role="group" aria-label={`Chart type for ${title}`}>{views.map(view => <button key={view.type} type="button" aria-pressed={toggle.value === view.type} onClick={() => toggle.set(view.type)}><view.icon size={15} aria-hidden="true"/>{view.label}</button>)}</div>}
          </div>
          <div className={css.body}><ResponsiveContainer>{children as any}</ResponsiveContainer></div>
          {footnote && <p className={css.foot}>{footnote}</p>}
     </section>;
}

function GoogleTooltip({ active, payload, label, format }: any) {
     if (!active || !payload?.length) return null;
     return <div className={css.tooltip}>{label != null && label !== '' && <strong>{label}</strong>}{payload.map((item: any) => <div key={item.dataKey ?? item.name}><i style={{ background: item.color || item.payload?.fill }}/>{item.name}<b>{format(item.value)}</b></div>)}</div>;
}

function SeriesChart({ type, data, label, series, currency, angled, width, height }: { type: ChartType; data: any[]; label: string; series: Series[]; currency: boolean; angled?: boolean; width?: number; height?: number }) {
     const format = (value: any) => currency ? money(Number(value) || 0) : quantity.format(Number(value) || 0);
     // ResponsiveContainer injects width/height into its direct child; forward them to the Recharts chart.
     const tilt = angled && data.length > 6;
     const props = { data, width, height, margin: { top: 8, right: 16, left: tilt ? 32 : 4, bottom: 0 } };
     const axis = { tick: { fontSize: 11, fill: 'var(--chart-muted)' }, stroke: 'var(--chart-grid)' };
     const common = [
          <CartesianGrid key="grid" stroke="var(--chart-grid)" vertical={false}/>,
          <XAxis key="x" dataKey={label} {...axis} tickLine={false} tickFormatter={shorten} interval={tilt ? 0 : 'preserveStartEnd'} angle={tilt ? -35 : 0} textAnchor={tilt ? 'end' : 'middle'} height={tilt ? 72 : 30}/>,
          <YAxis key="y" {...axis} axisLine={false} tickLine={false} width={60} tickFormatter={(v: number) => compact.format(v)}/>,
          <ReferenceLine key="zero" y={0} stroke="var(--chart-muted)" strokeOpacity={0.6}/>,
          <Tooltip key="tip" content={<GoogleTooltip format={format}/>} cursor={type === 'bar' ? { fill: 'var(--chart-grid)' } : { stroke: 'var(--chart-muted)', strokeDasharray: '3 3' }}/>,
          <Legend key="legend" verticalAlign="top" align="right" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingBottom: 8, color: 'var(--chart-ink)' }}/>,
     ];
     const activeDot = { r: 5, strokeWidth: 2, stroke: '#fff' };
     if (type === 'line') return <LineChart {...props}>{common}{series.map((item, i) => <Line key={item.key} type="linear" dataKey={item.key} name={item.name} stroke={colors[i % colors.length]} strokeWidth={2} dot={data.length <= 31 ? { r: 3, strokeWidth: 0, fill: colors[i % colors.length] } : false} activeDot={activeDot}/>)}</LineChart>;
     if (type === 'area') return <AreaChart {...props}>{common}{series.map((item, i) => <Area key={item.key} type="linear" dataKey={item.key} name={item.name} stroke={colors[i % colors.length]} strokeWidth={2} fill={colors[i % colors.length]} fillOpacity={0.3} activeDot={activeDot}/>)}</AreaChart>;
     return <BarChart {...props} barCategoryGap="20%" barGap={2}>{common}{series.map((item, i) => <Bar key={item.key} dataKey={item.key} name={item.name} fill={colors[i % colors.length]} maxBarSize={48}/>)}</BarChart>;
}

export function PharmacyItemTrend({rows, label, series}: {rows: any[]; label: string; series: Series[]}) {
     const [type, setType] = useState<ChartType>('bar');
     if (!rows.length) return null;
     return <ChartCard title="Activity in the selected period" subtitle="Quantities in base units" toggle={{value:type,set:setType}}>
          <SeriesChart type={type} data={rows} label={label} series={series} currency={false} angled={label==='supplier'}/>
     </ChartCard>;
}

export default function PharmacyReportCharts({ report, data }: { report: string; data: any }) {
     const [types, setTypes] = useState<Record<string, ChartType>>({});
     const toggle = (id: string, fallback: ChartType): Toggle => ({ value: types[id] ?? fallback, set: value => setTypes(current => ({ ...current, [id]: value })) });
     const summary = data.summary || {};
     if (report === 'overview') {
          const sales = toggle('overview-sales', 'line'), ledger = toggle('overview-ledger', 'bar');
          const stock = [
               { name: 'Out of stock', value: Number(summary.outOfStock) || 0 },
               { name: 'Needs reorder', value: Math.max(0, Number(summary.reorderItems) - Number(summary.outOfStock)) || 0 },
               { name: 'Above reorder level', value: Math.max(0, Number(summary.medicines) - Number(summary.reorderItems)) || 0 },
          ];
          const ledgerRows = [{ name: 'Revenue', amount: summary.bookRevenue }, { name: 'Cost of sales', amount: summary.costOfSales }, { name: 'Operating expenses', amount: summary.operatingExpenses }, { name: 'Profit', amount: summary.profit }];
          return <>
               <div className={css.grid}>
                    <ChartCard title="Sales and refunds over time" subtitle="Daily totals for the selected dates" icon={<RiLineChartLine size={18}/>} toggle={sales}>
                         <SeriesChart type={sales.value} data={data.rows || []} label="date" currency series={[s('sales', 'Sales'), s('refunds', 'Refunds'), s('netSales', 'Net sales')]}/>
                    </ChartCard>
                    <ChartCard title="Current medicine stock status" subtitle="Share of medicines by stock level" icon={<RiPieChartLine size={18}/>}>
                         <PieChart><Pie data={stock} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="80%" paddingAngle={1} stroke="var(--chart-paper)" label={({ percent }: any) => percent > 0 ? `${(percent * 100).toFixed(1)}%` : ''} labelLine={false}>{stock.map((item, i) => <Cell key={item.name} fill={colors[i]}/>)}</Pie><Tooltip content={<GoogleTooltip format={(v: any) => quantity.format(Number(v) || 0)}/>}/><Legend verticalAlign="middle" align="right" layout="vertical" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: 'var(--chart-ink)' }}/></PieChart>
                    </ChartCard>
               </div>
               <ChartCard title="Ledger results for selected dates" subtitle="Revenue, costs and profit from the pharmacy ledger" toggle={ledger}>
                    <SeriesChart type={ledger.value} data={ledgerRows} label="name" currency series={[s('amount', 'Amount')]}/>
               </ChartCard>
          </>;
     }
     const spec = specs[report]; if (!spec || !data.rows?.length) return null;
     const view = toggle(report, spec.type ?? 'bar');
     const daily = spec.label === 'date';
     const rows = daily ? data.rows.slice(0, 31) : group(data.rows, spec);
     return <ChartCard title={spec.title} subtitle={spec.currency ? 'Values in GHS' : 'Quantities in base units'} toggle={view} footnote={daily ? 'Chart shows up to 31 days from the current report page. Export includes the full report.' : 'Chart shows up to 20 entries from the current report page; repeated names are combined. Export includes the full report.'}>
          <SeriesChart type={view.value} data={rows} label={spec.label} series={spec.series} currency={spec.currency} angled={!daily}/>
     </ChartCard>;
}
