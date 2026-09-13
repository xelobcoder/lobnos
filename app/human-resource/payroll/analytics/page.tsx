'use client';

import { useState, useEffect } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Loader from '../../../../components/isLoading';
import {
     RiMoneyDollarCircleLine,
     RiTeamLine,
     RiCalendarEventLine,
     RiRefreshLine,
     RiBarChartBoxLine,
     RiLineChartLine,
     RiArrowUpLine,
     RiArrowDownLine,
     RiSubtractLine,
     RiWalletLine,
     RiGroupLine,
     RiAwardLine,
     RiShieldCheckLine,
     RiTimeLine,
     RiPieChartLine,
     RiStackLine,
     RiFileList3Line,
     RiBriefcaseLine
} from '@remixicon/react';
import dayjs from 'dayjs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_SECONDARY = '#2563eb';
const COLOR_TERTIARY = '#ea580c';
const COLOR_SUCCESS = 'var(--bs-success)';
const COLOR_DANGER = 'var(--bs-danger)';
const COLOR_WARNING = 'var(--bs-warning)';
const COLOR_INFO = '#0ea5e9';

const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS',
     minimumFractionDigits: 2,
});

const formatStatutoryLabel = (key: string) => {
     return key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMetricLabel = (key: string) => {
     return key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatMetricValue = (key: string, value: unknown) => {
     if (value === null || value === undefined || value === '') {
          return 'N/A';
     }

     const numericValue = Number(value);
     if (!Number.isFinite(numericValue)) {
          return String(value);
     }

     const lowerKey = key.toLowerCase();
     if (lowerKey.includes('rate') || lowerKey.includes('pct') || lowerKey.includes('percentage')) {
          return `${numericValue.toFixed(2)}%`;
     }

     if (
          (lowerKey.includes('total') || lowerKey.includes('avg') || lowerKey.includes('cost') || lowerKey.includes('salary') || lowerKey.includes('payroll') || lowerKey.includes('liability') || lowerKey.includes('deduction') || lowerKey.includes('allowance') || lowerKey.includes('bonus')) &&
          !lowerKey.includes('count') &&
          !lowerKey.includes('hours') &&
          !lowerKey.includes('employees')
     ) {
          return currencyFormatter.format(numericValue);
     }

     return numericValue.toLocaleString();
};

const formatStatutoryValue = (key: string, value: unknown) => {
     if (value === null || value === undefined || value === '') {
          return 'N/A';
     }

     const numericValue = Number(value);
     if (!Number.isFinite(numericValue)) {
          return String(value);
     }

     const keyLower = key.toLowerCase();
     if (keyLower.includes('rate') || keyLower.includes('percentage') || keyLower.endsWith('_pct') || keyLower.endsWith('_percent')) {
          return `${numericValue.toFixed(2)}%`;
     }

     if (keyLower.includes('amount') || keyLower.includes('total_')) {
          return currencyFormatter.format(numericValue);
     }

     return numericValue.toLocaleString();
};

const getInitials = (name?: string) => {
     if (!name) return '?';
     const parts = name.trim().split(/\s+/);
     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
     return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const toNumber = (value: unknown): number => {
     const n = Number(value);
     return Number.isFinite(n) ? n : 0;
};

/** Small colored chip showing a directional delta (e.g. +4.2%). Positive/negative direction can be inverted via `invert` for metrics where a decrease is favorable (e.g. deduction rate). */
function TrendChip({ value, suffix = '%', invert = false }: { value: unknown; suffix?: string; invert?: boolean }) {
     const numeric = toNumber(value);
     const isFlat = Math.abs(numeric) < 0.05;
     const isPositive = numeric > 0;
     const isGood = isFlat ? null : invert ? !isPositive : isPositive;
     const color = isFlat ? COLOR_TEXT_MUTED : isGood ? COLOR_SUCCESS : COLOR_DANGER;
     const bg = isFlat ? 'var(--bs-tertiary-bg)' : isGood ? 'var(--bs-success-bg-subtle)' : 'var(--bs-danger-bg-subtle)';
     const Icon = isFlat ? RiSubtractLine : isPositive ? RiArrowUpLine : RiArrowDownLine;
     return (
          <span
               className="d-inline-flex align-items-center rounded-pill px-2 py-1"
               style={{ backgroundColor: bg, color, fontSize: '0.75rem', fontWeight: 600, lineHeight: 1 }}
          >
               <Icon size={12} className="me-1" />
               {isFlat ? '0.0' : Math.abs(numeric).toFixed(1)}{suffix}
          </span>
     );
}

/** Slim horizontal progress bar used for percentage-style KPIs. */
function ProgressBar({ value, color = COLOR_ACCENT, height = 6 }: { value: number; color?: string; height?: number }) {
     const pct = Math.max(0, Math.min(100, value));
     return (
          <div className="w-100 rounded-pill overflow-hidden" style={{ height, backgroundColor: 'var(--bs-tertiary-bg)' }}>
               <div className="h-100 rounded-pill" style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.4s ease' }} />
          </div>
     );
}

/** Determines a semantic color for a percentage-based health metric. */
const statusColorForPct = (value: number, goodAt = 80, warnAt = 50) => {
     if (value >= goodAt) return COLOR_SUCCESS;
     if (value >= warnAt) return COLOR_WARNING;
     return COLOR_DANGER;
};

/** Standard card wrapper matching the Lobnos LIMS chart UI standard. */
function SectionCard({
     title,
     icon,
     actions,
     children,
     bodyClassName = 'card-body',
}: {
     title: string;
     icon?: React.ReactNode;
     actions?: React.ReactNode;
     children: React.ReactNode;
     bodyClassName?: string;
}) {
     return (
          <div className="card h-100" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
               <div
                    className="card-header py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}
               >
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                         {icon}
                         {title}
                    </h2>
                    {actions}
               </div>
               <div className={bodyClassName}>{children}</div>
          </div>
     );
}

/** Compact executive KPI card with icon badge, headline value, and optional trend chip. */
function HeroStat({
     label,
     value,
     Icon,
     variant,
     detail,
     trend,
     trendInvert,
}: {
     label: string;
     value: string;
     Icon: React.ElementType;
     variant: string;
     detail: string;
     trend?: unknown;
     trendInvert?: boolean;
}) {
     return (
          <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
               <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                         <span className="text-xs text-uppercase fw-semibold opacity-75">{label}</span>
                         <Icon size={22} className="opacity-75" />
                    </div>
                    <h3 className="fw-bold mb-0">{value}</h3>
                    <div className="d-flex justify-content-between align-items-center gap-2">
                         <span className="text-xs opacity-75">{detail}</span>
                         {trend !== undefined && trend !== null && <TrendChip value={trend} invert={trendInvert} />}
                    </div>
               </div>
          </div>
     );
}

export default function PayrollAnalyticsPage() {
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [analyticsData, setAnalyticsData] = useState<any>(null);
     const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
     const [detailTab, setDetailTab] = useState<'allowances' | 'bonuses' | 'deductions'>('allowances');

     const [compensationLoading, setCompensationLoading] = useState(false);
     const [compensationData, setCompensationData] = useState<any[]>([]);

     const [startDate, setStartDate] = useState(dayjs().subtract(3, 'month').format('YYYY-MM-DD'));
     const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

     useEffect(() => {
          fetchAnalytics();
     }, []);

     const fetchAnalytics = async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch(
                    `payroll/analytics?startDate=${startDate}&endDate=${endDate}&topEarnersLimit=10`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAnalyticsData(response.result);
               } else {
                    setError('Failed to load analytics data');
               }
          } catch (err) {
               setError('Error fetching analytics data');
               console.error(err);
          } finally {
               setLoading(false);
          }
     };

     const handleResetFilters = () => {
          setStartDate(dayjs().subtract(3, 'month').format('YYYY-MM-DD'));
          setEndDate(dayjs().format('YYYY-MM-DD'));
     };

     const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setStartDate(e.target.value);
     };

     const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setEndDate(e.target.value);
     };

     const fetchCompensationAnalytics = async () => {
          setCompensationLoading(true);
          try {
               const response = await customFetch(
                    `payroll/analytics/compensation?startDate=${startDate}&endDate=${endDate}`
               );
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setCompensationData(response.result);
               }
          } catch (err) {
               console.error('Error fetching compensation analytics:', err);
               setCompensationData([]);
          } finally {
               setCompensationLoading(false);
          }
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div className="rounded-lg border p-2 shadow-sm"
                         style={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, minWidth: '220px', fontSize: '0.8rem' }}>
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Period</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => (
                              <div key={index} className="mb-1">
                                   <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{item.name}</span>
                                   <span className="fw-bold d-block" style={{ color: item.color }}>
                                        {currencyFormatter.format(item.value)}
                                   </span>
                              </div>
                         ))}
                    </div>
               );
          }
          return null;
     };

     if (loading) return <Loader />;

     if (error) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-danger">{error}</div>
               </div>
          );
     }

     if (!analyticsData) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="alert alert-info">No analytics data available</div>
               </div>
          );
     }

     const {
          financial_kpis,
          headcount_analytics: headcountAnalytics,
          payroll_period_metrics: payrollPeriods,
          compensation_distribution: compensation,
          attendance_summary: attendance,
          attendance_compliance: attendanceCompliance,
          leave_statistics: leave,
          leave_utilization: leaveUtilization,
          allowance_breakdown: allowanceBonus,
          bonus_statistics: bonuses,
          statutory_deductions: statutoryDeductions,
          other_deductions: otherDeductions,
          payment_methods: paymentMethods,
          overtime_metrics: overtimeMetrics,
          payroll_trend: payrollTrend,
          top_earners: topEarners,
          cost_centers: costCenters,
          compliance,
          earnings_distribution: earningsDistribution,
          period_comparison: periodComparison,
          payroll_processing: payrollProcessing
     } = analyticsData;

     return (
          <div className="container-fluid px-4 py-3">
               {/* Executive Header */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-body py-3 px-4">
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                              <div className="d-flex align-items-center">
                                   <div
                                        className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
                                        style={{ width: 46, height: 46, backgroundColor: `color-mix(in oklab, ${COLOR_ACCENT} 15%, transparent)` }}
                                   >
                                        <RiBriefcaseLine size={24} style={{ color: COLOR_ACCENT }} />
                                   </div>
                                   <div>
                                        <h1 className="h5 fw-bold mb-1">Payroll Analytics</h1>
                                        <p className="text-muted small mb-0">
                                             Executive overview of compensation, workforce, and compliance performance
                                        </p>
                                   </div>
                              </div>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                             <RiCalendarEventLine size={16} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control shadow-none border-start-0"
                                             value={startDate}
                                             onChange={handleStartDateChange}
                                        />
                                   </div>
                                   <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                        <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                             <RiCalendarEventLine size={16} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control shadow-none border-start-0"
                                             value={endDate}
                                             onChange={handleEndDateChange}
                                             min={startDate}
                                        />
                                   </div>
                                   <button
                                        onClick={fetchAnalytics}
                                        className="btn btn-sm btn-primary d-flex align-items-center justify-content-center"
                                        disabled={loading}
                                        style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                   >
                                        <RiRefreshLine size={16} className="me-1" /> Load Data
                                   </button>
                                   <button
                                        onClick={handleResetFilters}
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                                   >
                                        <RiRefreshLine size={16} className="me-1" /> Reset
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Executive Summary - Hero KPIs */}
               <div className="row g-3 mb-4">
                    <div className="col-6 col-lg-3">
                         <HeroStat
                              label="Gross Payroll"
                              value={currencyFormatter.format(financial_kpis?.total_gross_payroll || 0)}
                              Icon={RiMoneyDollarCircleLine}
                              variant="primary"
                              detail="Before deductions"
                              trend={periodComparison?.changes?.gross_payroll_change_pct}
                         />
                    </div>
                    <div className="col-6 col-lg-3">
                         <HeroStat
                              label="Net Payroll"
                              value={currencyFormatter.format(financial_kpis?.total_net_payroll || 0)}
                              Icon={RiWalletLine}
                              variant="success"
                              detail="After deductions"
                              trend={periodComparison?.changes?.net_payroll_change_pct}
                         />
                    </div>
                    <div className="col-6 col-lg-3">
                         <HeroStat
                              label="Total Employees"
                              value={String(financial_kpis?.total_employees ?? 0)}
                              Icon={RiTeamLine}
                              variant="info"
                              detail="Active in selected period"
                              trend={periodComparison?.changes?.employee_count_change_pct}
                         />
                    </div>
                    <div className="col-6 col-lg-3">
                         <HeroStat
                              label="Employer Cost"
                              value={currencyFormatter.format(financial_kpis?.total_employer_cost || 0)}
                              Icon={RiBarChartBoxLine}
                              variant="warning"
                              detail="Total employer cost"
                         />
                    </div>
               </div>

               {/* Financial Breakdown */}
               <div className="row mb-4">
                    <div className="col-12">
                         <SectionCard title="Financial Breakdown" icon={<RiPieChartLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                              <div className="row g-4">
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Total Deductions</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.total_deductions || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Tax Liability</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.total_tax_liability || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Total Allowances</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.total_allowances || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Total Bonuses</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.total_bonuses || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Avg Gross / Employee</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.avg_gross_per_employee || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="small text-muted mb-1">Avg Net / Employee</div>
                                        <div className="fw-bold fs-6">{currencyFormatter.format(financial_kpis?.avg_net_per_employee || 0)}</div>
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="d-flex justify-content-between small text-muted mb-1">
                                             <span>Effective Tax Rate</span>
                                             <span className="fw-semibold text-body-emphasis">{toNumber(financial_kpis?.effective_tax_rate).toFixed(1)}%</span>
                                        </div>
                                        <ProgressBar value={toNumber(financial_kpis?.effective_tax_rate)} color={COLOR_TERTIARY} />
                                   </div>
                                   <div className="col-6 col-md-3">
                                        <div className="d-flex justify-content-between small text-muted mb-1">
                                             <span>Deduction Rate</span>
                                             <span className="fw-semibold text-body-emphasis">{toNumber(financial_kpis?.deduction_rate_pct).toFixed(1)}%</span>
                                        </div>
                                        <ProgressBar value={toNumber(financial_kpis?.deduction_rate_pct)} color={COLOR_DANGER} />
                                   </div>
                              </div>
                              <hr className="my-3" style={{ borderColor: COLOR_BORDER }} />
                              <div className="d-flex flex-wrap gap-4">
                                   <div className="d-flex align-items-center">
                                        <RiTimeLine size={16} className="me-2 text-muted" />
                                        <span className="small text-muted me-1">Total Hours Worked:</span>
                                        <span className="fw-semibold small">{toNumber(financial_kpis?.total_hours_worked).toLocaleString()}</span>
                                   </div>
                                   <div className="d-flex align-items-center">
                                        <RiFileList3Line size={16} className="me-2 text-muted" />
                                        <span className="small text-muted me-1">Periods Covered:</span>
                                        <span className="fw-semibold small">{toNumber(financial_kpis?.total_periods).toLocaleString()}</span>
                                   </div>
                              </div>
                         </SectionCard>
                    </div>
               </div>


               {/* Workforce Composition */}
               <div className="row g-3 mb-4">
                    <div className="col-lg-4">
                         <SectionCard title="Headcount Snapshot" icon={<RiGroupLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                              <div className="text-muted small mb-1">Active Employees In Period</div>
                              <div className="fs-2 fw-bold text-body-emphasis">{headcountAnalytics?.active_employees_in_period ?? 0}</div>
                         </SectionCard>
                    </div>
                    <div className="col-lg-4">
                         <SectionCard title="Compensation Type" icon={<RiStackLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />}>
                              {(() => {
                                   const items = headcountAnalytics?.compensation_type_breakdown || [];
                                   const total = items.reduce((s: number, i: any) => s + toNumber(i.count), 0) || 1;
                                   return items.length === 0 ? (
                                        <div className="text-muted small">No data available.</div>
                                   ) : items.map((item: any, idx: number) => {
                                        const pct = (toNumber(item.count) / total) * 100;
                                        return (
                                             <div className={idx > 0 ? 'mt-3' : ''} key={idx}>
                                                  <div className="d-flex justify-content-between small mb-1">
                                                       <span className="text-capitalize">{String(item.compensation_type || '').replace(/_/g, ' ')}</span>
                                                       <span className="fw-semibold">{item.count ?? 0} ({pct.toFixed(0)}%)</span>
                                                  </div>
                                                  <ProgressBar value={pct} color={COLOR_SECONDARY} />
                                             </div>
                                        );
                                   });
                              })()}
                         </SectionCard>
                    </div>
                    <div className="col-lg-4">
                         <SectionCard title="Payment Frequency" icon={<RiCalendarEventLine size={20} style={{ color: COLOR_TERTIARY }} className="me-2" />}>
                              {(() => {
                                   const items = headcountAnalytics?.payment_frequency_breakdown || [];
                                   const total = items.reduce((s: number, i: any) => s + toNumber(i.count), 0) || 1;
                                   return items.length === 0 ? (
                                        <div className="text-muted small">No data available.</div>
                                   ) : items.map((item: any, idx: number) => {
                                        const pct = (toNumber(item.count) / total) * 100;
                                        return (
                                             <div className={idx > 0 ? 'mt-3' : ''} key={idx}>
                                                  <div className="d-flex justify-content-between small mb-1">
                                                       <span className="text-capitalize">{String(item.payment_frequency || '').replace(/_/g, ' ')}</span>
                                                       <span className="fw-semibold">{item.count ?? 0} ({pct.toFixed(0)}%)</span>
                                                  </div>
                                                  <ProgressBar value={pct} color={COLOR_TERTIARY} />
                                             </div>
                                        );
                                   });
                              })()}
                         </SectionCard>
                    </div>
               </div>

               {/* Period-over-Period Comparison */}
               {periodComparison && (
                    <div className="row mb-4">
                         <div className="col-12">
                              <SectionCard title="Period-over-Period Performance" icon={<RiLineChartLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start mb-0 align-middle">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Metric</th>
                                                       <th className="text-end">Current Period</th>
                                                       <th className="text-end">Previous Period</th>
                                                       <th className="text-end">Change</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {Object.keys(periodComparison.current_period || {}).map((key) => {
                                                       const changeKey = Object.keys(periodComparison.changes || {}).find(
                                                            (c) => c.replace('_change_pct', '') === key || c.replace('_change', '') === key
                                                       );
                                                       const changeValue = changeKey ? periodComparison.changes[changeKey] : undefined;
                                                       const isRateMetric = key.toLowerCase().includes('rate') || key.toLowerCase().includes('pct');
                                                       return (
                                                            <tr key={key}>
                                                                 <td className="text-start">{formatMetricLabel(key)}</td>
                                                                 <td className="text-end fw-semibold">{formatMetricValue(key, periodComparison.current_period?.[key])}</td>
                                                                 <td className="text-end text-muted">{formatMetricValue(key, periodComparison.previous_period?.[key])}</td>
                                                                 <td className="text-end">
                                                                      {changeValue !== undefined ? (
                                                                           <TrendChip value={changeValue} invert={isRateMetric && key.toLowerCase().includes('deduction')} />
                                                                      ) : (
                                                                           <span className="text-muted small">&mdash;</span>
                                                                      )}
                                                                 </td>
                                                            </tr>
                                                       );
                                                  })}
                                             </tbody>
                                        </table>
                                   </div>
                              </SectionCard>
                         </div>
                    </div>
               )}

               {/* Compensation Distribution Chart */}
               {compensation && compensation.length > 0 && (
                    <div className="row mb-4">
                         <div className="col-12">
                              <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                                   <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                             <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                                  {/* <RiTrendingUpLine size={22} style={{ color: COLOR_ACCENT }} className="me-2" /> */}
                                                  Compensation Distribution by Type
                                             </h2>
                                             <div className="btn-group btn-group-sm" role="group">
                                                  <button
                                                       type="button"
                                                       className={`btn ${chartType === 'bar' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                       onClick={() => setChartType('bar')}
                                                       style={chartType === 'bar' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                  >
                                                       <RiBarChartBoxLine size={16} className="me-1 align-text-bottom" /> Bar
                                                  </button>
                                                  <button
                                                       type="button"
                                                       className={`btn ${chartType === 'line' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                       onClick={() => setChartType('line')}
                                                       style={chartType === 'line' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                  >
                                                       <RiLineChartLine size={16} className="me-1 align-text-bottom" /> Line
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="card-body">
                                        <div style={{ width: '100%', height: 350 }}>
                                             <ResponsiveContainer>
                                                  {chartType === 'bar' ? (
                                                       <BarChart
                                                            data={compensation}
                                                            margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                                       >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                            <XAxis
                                                                 dataKey="compensation_type"
                                                                 angle={-45}
                                                                 textAnchor="end"
                                                                 height={60}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={{ stroke: COLOR_BORDER }}
                                                                 tickLine={{ stroke: COLOR_BORDER }}
                                                            />
                                                            <YAxis
                                                                 tickFormatter={(value) => currencyFormatter.format(value)}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={false}
                                                                 tickLine={false}
                                                                 width={95}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                            <Legend
                                                                 verticalAlign="top"
                                                                 align="right"
                                                                 iconType="circle"
                                                                 iconSize={8}
                                                                 wrapperStyle={{ fontSize: '13px', paddingBottom: '15px' }}
                                                            />
                                                            <Bar dataKey="total_basic_salary" name="Total Basic Salary" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                            <Bar dataKey="avg_basic_salary" name="Avg Basic Salary" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                            <Bar dataKey="employee_count" name="Employee Count" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                                                       </BarChart>
                                                  ) : (
                                                       <LineChart
                                                            data={compensation}
                                                            margin={{ top: 5, right: 5, left: 20, bottom: 45 }}
                                                       >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                            <XAxis
                                                                 dataKey="compensation_type"
                                                                 angle={-45}
                                                                 textAnchor="end"
                                                                 height={60}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={{ stroke: COLOR_BORDER }}
                                                                 tickLine={{ stroke: COLOR_BORDER }}
                                                            />
                                                            <YAxis
                                                                 tickFormatter={(value) => currencyFormatter.format(value)}
                                                                 tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }}
                                                                 axisLine={false}
                                                                 tickLine={false}
                                                                 width={95}
                                                            />
                                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                            <Legend
                                                                 verticalAlign="top"
                                                                 align="right"
                                                                 iconType="circle"
                                                                 iconSize={8}
                                                                 wrapperStyle={{ fontSize: '13px', paddingBottom: '15px' }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="total_basic_salary"
                                                                 name="Total Basic Salary"
                                                                 stroke={COLOR_ACCENT}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="avg_basic_salary"
                                                                 name="Avg Basic Salary"
                                                                 stroke={COLOR_SECONDARY}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                            <Line
                                                                 type="monotone"
                                                                 dataKey="employee_count"
                                                                 name="Employee Count"
                                                                 stroke={COLOR_TERTIARY}
                                                                 strokeWidth={2}
                                                                 dot={{ r: 3, strokeWidth: 1, fill: COLOR_TERTIARY }}
                                                                 activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }}
                                                            />
                                                       </LineChart>
                                                  )}
                                             </ResponsiveContainer>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payroll Trend */}
               {payrollTrend && payrollTrend.length > 0 && (
                    <div className="row mb-4">
                         <div className="col-12">
                              <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                                   <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-0">Payroll Trend</h2>
                                   </div>
                                   <div className="card-body">
                                        <div style={{ width: '100%', height: 340 }}>
                                             <ResponsiveContainer>
                                                  <LineChart data={payrollTrend} margin={{ top: 5, right: 10, left: 20, bottom: 20 }}>
                                                       <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                       <XAxis dataKey="period_name" tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={{ stroke: COLOR_BORDER }} />
                                                       <YAxis tickFormatter={(value) => currencyFormatter.format(value)} tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={100} />
                                                       <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                                                       <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', paddingBottom: '15px' }} />
                                                       <Line type="monotone" dataKey="gross_salary" name="Gross Salary" stroke={COLOR_ACCENT} strokeWidth={2} dot={{ r: 3, fill: COLOR_ACCENT }} />
                                                       <Line type="monotone" dataKey="net_salary" name="Net Salary" stroke={COLOR_SECONDARY} strokeWidth={2} dot={{ r: 3, fill: COLOR_SECONDARY }} />
                                                       <Line type="monotone" dataKey="deductions" name="Deductions" stroke={COLOR_TERTIARY} strokeWidth={2} dot={{ r: 3, fill: COLOR_TERTIARY }} />
                                                  </LineChart>
                                             </ResponsiveContainer>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Payroll Period Metrics & Transaction Summary */}
               <div className="row g-3 mb-4">
                    {payrollPeriods && payrollPeriods.length > 0 && (
                         <div className="col-lg-6">
                              <SectionCard title="Payroll Period Metrics" icon={<RiFileList3Line size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start mb-0">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Status</th>
                                                       <th className="text-end">Periods</th>
                                                       <th className="text-end">Gross</th>
                                                       <th className="text-end">Net</th>
                                                       <th className="text-end">Deductions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {payrollPeriods.map((item: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start">
                                                                 <span
                                                                      className={`badge rounded-pill text-capitalize ${item.status === 'completed' || item.status === 'paid'
                                                                           ? 'text-bg-success'
                                                                           : item.status === 'pending' || item.status === 'processing'
                                                                                ? 'text-bg-warning'
                                                                                : 'text-bg-secondary'
                                                                           }`}
                                                                 >
                                                                      {item.status}
                                                                 </span>
                                                            </td>
                                                            <td className="text-end">{item.period_count ?? 0}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.total_gross ?? 0)}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.total_net ?? 0)}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.total_deductions ?? 0)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </SectionCard>
                         </div>
                    )}

                    {analyticsData.transaction_summary && analyticsData.transaction_summary.length > 0 && (
                         <div className="col-lg-6">
                              <SectionCard title="Transaction Summary" icon={<RiWalletLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />}>
                                   <div className="row g-3">
                                        {(Object.entries(analyticsData.transaction_summary[0] || {}) as [string, unknown][]).map(([key, value]) => (
                                             <div className="col-6" key={key}>
                                                  <div className="small text-muted mb-1">{formatMetricLabel(key)}</div>
                                                  <div className="fw-semibold">{formatMetricValue(key, value)}</div>
                                             </div>
                                        ))}
                                   </div>
                              </SectionCard>
                         </div>
                    )}
               </div>

               {/* Compensation Breakdown Tabs: Allowances / Bonuses / Other Deductions */}
               {(allowanceBonus?.length || bonuses?.length || otherDeductions?.length) && (
                    <div className="row mb-4">
                         <div className="col-12">
                              <SectionCard
                                   title="Compensation Breakdown"
                                   icon={<RiAwardLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}
                                   actions={
                                        <div className="btn-group btn-group-sm" role="group">
                                             <button
                                                  type="button"
                                                  className={`btn ${detailTab === 'allowances' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                  onClick={() => setDetailTab('allowances')}
                                                  style={detailTab === 'allowances' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  Allowances
                                             </button>
                                             <button
                                                  type="button"
                                                  className={`btn ${detailTab === 'bonuses' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                  onClick={() => setDetailTab('bonuses')}
                                                  style={detailTab === 'bonuses' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  Bonuses
                                             </button>
                                             <button
                                                  type="button"
                                                  className={`btn ${detailTab === 'deductions' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                  onClick={() => setDetailTab('deductions')}
                                                  style={detailTab === 'deductions' ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  Other Deductions
                                             </button>
                                        </div>
                                   }
                              >
                                   {detailTab === 'allowances' && (
                                        allowanceBonus && allowanceBonus.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-sm table-hover text-start mb-0">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Type</th>
                                                                 <th className="text-end">Total Amount</th>
                                                                 <th className="text-end">Count</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {allowanceBonus.map((item: any, idx: number) => (
                                                                 <tr key={idx}>
                                                                      <td className="text-start text-capitalize">{String(item.allowance_type || '').replace(/_/g, ' ')}</td>
                                                                      <td className="text-end fw-semibold">{currencyFormatter.format(item.total_amount ?? 0)}</td>
                                                                      <td className="text-end">{item.allowance_count ?? 0}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : <div className="text-muted small py-4 text-center">No allowance data available.</div>
                                   )}
                                   {detailTab === 'bonuses' && (
                                        bonuses && bonuses.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-sm table-hover text-start mb-0">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Type</th>
                                                                 <th className="text-start">Status</th>
                                                                 <th className="text-end">Total Amount</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {bonuses.map((item: any, idx: number) => (
                                                                 <tr key={idx}>
                                                                      <td className="text-start text-capitalize">{String(item.bonus_type || '').replace(/_/g, ' ')}</td>
                                                                      <td className="text-start">
                                                                           <span
                                                                                className={`badge rounded-pill text-capitalize ${item.status === 'approved' || item.status === 'paid'
                                                                                     ? 'text-bg-success'
                                                                                     : item.status === 'pending'
                                                                                          ? 'text-bg-warning'
                                                                                          : item.status === 'rejected'
                                                                                               ? 'text-bg-danger'
                                                                                               : 'text-bg-secondary'
                                                                                     }`}
                                                                           >
                                                                                {item.status || 'N/A'}
                                                                           </span>
                                                                      </td>
                                                                      <td className="text-end fw-semibold">{currencyFormatter.format(item.total_amount ?? 0)}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : <div className="text-muted small py-4 text-center">No bonus data available.</div>
                                   )}
                                   {detailTab === 'deductions' && (
                                        otherDeductions && otherDeductions.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-sm table-hover text-start mb-0">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Type</th>
                                                                 <th className="text-end">Total Amount</th>
                                                                 <th className="text-end">Outstanding</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {otherDeductions.map((item: any, idx: number) => (
                                                                 <tr key={idx}>
                                                                      <td className="text-start text-capitalize">{String(item.deduction_type || '').replace(/_/g, ' ')}</td>
                                                                      <td className="text-end fw-semibold">{currencyFormatter.format(item.total_amount ?? 0)}</td>
                                                                      <td className="text-end text-danger">{currencyFormatter.format(item.total_outstanding ?? 0)}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : <div className="text-muted small py-4 text-center">No other deduction data available.</div>
                                   )}
                              </SectionCard>
                         </div>
                    </div>
               )}

               {/* Payment Methods & Statutory Deductions */}
               <div className="row g-3 mb-4">
                    {paymentMethods && paymentMethods.length > 0 && (
                         <div className="col-md-6">
                              <SectionCard title="Payment Methods" icon={<RiWalletLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                                   {paymentMethods.map((method: any, idx: number) => (
                                        <div className={idx > 0 ? 'mt-3' : ''} key={idx}>
                                             <div className="d-flex justify-content-between small mb-1">
                                                  <span className="text-capitalize">{method.payment_method?.replace(/_/g, ' ')}</span>
                                                  <span className="fw-semibold">{method.employee_count} employees ({method.percentage}%)</span>
                                             </div>
                                             <ProgressBar value={toNumber(method.percentage)} color={COLOR_ACCENT} />
                                        </div>
                                   ))}
                              </SectionCard>
                         </div>
                    )}

                    <div className="col-md-6">
                         <SectionCard title="Statutory Deductions" icon={<RiShieldCheckLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />}>
                              {statutoryDeductions && Object.keys(statutoryDeductions).length > 0 ? (
                                   <div className="row g-3">
                                        {Object.entries(statutoryDeductions).map(([key, value]) => (
                                             <div key={key} className="col-6">
                                                  <div className="small text-muted mb-1">{formatStatutoryLabel(key)}</div>
                                                  <div className="fw-semibold">{formatStatutoryValue(key, value)}</div>
                                             </div>
                                        ))}
                                   </div>
                              ) : (
                                   <div className="text-muted small">No statutory deduction data available.</div>
                              )}
                         </SectionCard>
                    </div>
               </div>


               {/* Detailed Compensation Analytics */}
               <div className="row mb-4">
                    <div className="col-12">
                         <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                              <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                                             <RiMoneyDollarCircleLine size={22} style={{ color: COLOR_ACCENT }} className="me-2" />
                                             Detailed Compensation Breakdown
                                        </h2>
                                        <button
                                             onClick={fetchCompensationAnalytics}
                                             className="btn btn-sm btn-primary d-flex align-items-center"
                                             disabled={compensationLoading}
                                        >
                                             <RiRefreshLine size={16} className="me-1" />
                                             {compensationLoading ? 'Loading...' : 'Load Compensation Data'}
                                        </button>
                                   </div>
                              </div>
                              <div className="card-body">
                                   {compensationLoading ? (
                                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                                             <div className="spinner-border text-primary" role="status">
                                                  <span className="visually-hidden">Loading...</span>
                                             </div>
                                        </div>
                                   ) : compensationData.length === 0 ? (
                                        <div className="text-center text-muted py-5">
                                             <RiMoneyDollarCircleLine size={48} className="mb-3" style={{ opacity: 0.3 }} />
                                             <p>Click &ldquo;Load Compensation Data&rdquo; to view detailed breakdown</p>
                                        </div>
                                   ) : (
                                        <div className="table-responsive">
                                             <table className="table table-hover text-start">
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th className="text-start">Compensation Type</th>
                                                            <th className="text-start">Payment Frequency</th>
                                                            <th className="text-end">Employee Count</th>
                                                            <th className="text-end">Avg Basic Salary</th>
                                                            <th className="text-end">Total Basic Salary</th>
                                                            <th className="text-end">Avg Hourly Rate</th>
                                                            <th className="text-end">Avg Commission %</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {compensationData.map((comp: any, idx: number) => (
                                                            <tr key={idx}>
                                                                 <td className="text-start text-capitalize fw-medium">{comp.compensation_type}</td>
                                                                 <td className="text-start text-capitalize">{comp.payment_frequency}</td>
                                                                 <td className="text-end">{comp.employee_count}</td>
                                                                 <td className="text-end">{currencyFormatter.format(comp.avg_basic_salary)}</td>
                                                                 <td className="text-end fw-semibold">{currencyFormatter.format(comp.total_basic_salary)}</td>
                                                                 <td className="text-end">{currencyFormatter.format(comp.avg_hourly_rate)}</td>
                                                                 <td className="text-end">{comp.avg_commission_pct}%</td>
                                                            </tr>
                                                       ))}
                                                       <tr className="fw-bold border-top">
                                                            <td colSpan={2} className="text-start">Total</td>
                                                            <td className="text-end">
                                                                 {compensationData.reduce((sum: number, c: any) => sum + parseInt(c.employee_count || 0), 0)}
                                                            </td>
                                                            <td className="text-end">-</td>
                                                            <td className="text-end">
                                                                 {currencyFormatter.format(
                                                                      compensationData.reduce((sum: number, c: any) => sum + parseFloat(c.total_basic_salary || 0), 0)
                                                                 )}
                                                            </td>
                                                            <td className="text-end">-</td>
                                                            <td className="text-end">-</td>
                                                       </tr>
                                                  </tbody>
                                             </table>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Attendance & Leave Summary */}
               <div className="row g-3 mb-4">
                    {attendance && attendance.length > 0 && (
                         <div className="col-md-6">
                              <SectionCard title="Attendance Summary" icon={<RiTimeLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start mb-0">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Status</th>
                                                       <th className="text-start">Shift</th>
                                                       <th className="text-end">Records</th>
                                                       <th className="text-end">Hours Worked</th>
                                                       <th className="text-end">Avg Late (Min)</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {attendance.map((att: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start text-capitalize">{att.status || 'N/A'}</td>
                                                            <td className="text-start text-capitalize">{att.shift_type || 'N/A'}</td>
                                                            <td className="text-end">{att.record_count}</td>
                                                            <td className="text-end">{parseFloat(att.total_hours_worked ?? att.total_overtime ?? 0).toFixed(1)}</td>
                                                            <td className="text-end">{parseFloat(att.avg_late_minutes ?? 0).toFixed(1)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </SectionCard>
                         </div>
                    )}

                    {leave && leave.length > 0 && (
                         <div className="col-md-6">
                              <SectionCard title="Leave Statistics" icon={<RiCalendarEventLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />}>
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover text-start mb-0">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Type</th>
                                                       <th className="text-start">Status</th>
                                                       <th className="text-end">Count</th>
                                                       <th className="text-end">Total Days</th>
                                                       <th className="text-end">Unpaid</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {leave.map((lv: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start text-capitalize">{lv.leave_type}</td>
                                                            <td className="text-start">
                                                                 <span
                                                                      className={`badge rounded-pill text-capitalize ${lv.status === 'approved'
                                                                           ? 'text-bg-success'
                                                                           : lv.status === 'pending'
                                                                                ? 'text-bg-warning'
                                                                                : lv.status === 'rejected'
                                                                                     ? 'text-bg-danger'
                                                                                     : 'text-bg-secondary'
                                                                           }`}
                                                                 >
                                                                      {lv.status || 'N/A'}
                                                                 </span>
                                                            </td>
                                                            <td className="text-end">{lv.leave_count}</td>
                                                            <td className="text-end">{lv.total_days ?? lv.total_days_taken ?? 0}</td>
                                                            <td className="text-end">{lv.unpaid_count ?? 0}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </SectionCard>
                         </div>
                    )}
               </div>

               {/* Top Earners & Earnings Distribution */}
               <div className="row g-3 mb-4">
                    {topEarners && topEarners.length > 0 && (
                         <div className="col-lg-6">
                              <SectionCard title="Top Earners" icon={<RiAwardLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />}>
                                   {(() => {
                                        const maxGross = Math.max(...topEarners.map((e: any) => toNumber(e.total_gross_salary)), 1);
                                        const rankColors = ['#d4af37', '#a8a8a8', '#b06a3a'];
                                        return topEarners.map((earner: any, idx: number) => (
                                             <div className={idx > 0 ? 'mt-3 pt-3 border-top' : ''} style={idx > 0 ? { borderColor: COLOR_BORDER } as React.CSSProperties : undefined} key={earner.employeeid || idx}>
                                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                                       <div className="d-flex align-items-center">
                                                            <div
                                                                 className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white me-2 flex-shrink-0"
                                                                 style={{ width: 34, height: 34, fontSize: '0.75rem', backgroundColor: idx < 3 ? rankColors[idx] : COLOR_TEXT_MUTED }}
                                                            >
                                                                 {idx < 3 ? `#${idx + 1}` : getInitials(earner.username)}
                                                            </div>
                                                            <div>
                                                                 <div className="fw-medium small">{earner.username || 'N/A'}</div>
                                                                 <div className="small text-muted">{earner.email || ''}</div>
                                                            </div>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold small">{currencyFormatter.format(earner.total_gross_salary ?? 0)}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                                 Net {currencyFormatter.format(earner.total_net_salary ?? 0)} &middot; {earner.payroll_count ?? 0} pay{Number(earner.payroll_count) === 1 ? '' : 's'}
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <ProgressBar value={(toNumber(earner.total_gross_salary) / maxGross) * 100} color={idx < 3 ? rankColors[idx] : COLOR_ACCENT} height={5} />
                                             </div>
                                        ));
                                   })()}
                              </SectionCard>
                         </div>
                    )}

                    {earningsDistribution && earningsDistribution.length > 0 && (
                         <div className="col-lg-6">
                              <SectionCard title="Earnings Distribution" icon={<RiBarChartBoxLine size={20} style={{ color: COLOR_SECONDARY }} className="me-2" />}>
                                   <div style={{ width: '100%', height: 220 }}>
                                        <ResponsiveContainer>
                                             <BarChart data={earningsDistribution} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                                                  <XAxis dataKey="salary_band" tick={{ fontSize: 10, fill: COLOR_TEXT_MUTED }} axisLine={{ stroke: COLOR_BORDER }} tickLine={false} />
                                                  <YAxis tick={{ fontSize: 11, fill: COLOR_TEXT_MUTED }} axisLine={false} tickLine={false} width={30} />
                                                  <Tooltip
                                                       cursor={{ fill: 'var(--bs-tertiary-bg)' }}
                                                       contentStyle={{ backgroundColor: COLOR_TOOLTIP_BG, borderColor: COLOR_BORDER, fontSize: '0.8rem' }}
                                                  />
                                                  <Bar dataKey="employee_count" name="Employees" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                             </BarChart>
                                        </ResponsiveContainer>
                                   </div>
                                   <div className="table-responsive mt-3">
                                        <table className="table table-sm table-hover text-start mb-0">
                                             <thead>
                                                  <tr>
                                                       <th className="text-start">Salary Band</th>
                                                       <th className="text-end">Employees</th>
                                                       <th className="text-end">Avg Gross</th>
                                                       <th className="text-end">Avg Net</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {earningsDistribution.map((item: any, idx: number) => (
                                                       <tr key={idx}>
                                                            <td className="text-start">{item.salary_band || 'N/A'}</td>
                                                            <td className="text-end">{item.employee_count ?? 0}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.avg_gross_salary ?? 0)}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.avg_net_salary ?? 0)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              </SectionCard>
                         </div>
                    )}
               </div>

               {/* Compliance / Utilization / Processing Status */}
               <div className="row g-3">
                    {[
                         { title: 'Attendance Compliance', icon: <RiShieldCheckLine size={20} style={{ color: COLOR_SUCCESS }} className="me-2" />, data: attendanceCompliance },
                         { title: 'Leave Utilization', icon: <RiCalendarEventLine size={20} style={{ color: COLOR_INFO }} className="me-2" />, data: leaveUtilization },
                         { title: 'Payroll Processing', icon: <RiFileList3Line size={20} style={{ color: COLOR_TERTIARY }} className="me-2" />, data: payrollProcessing },
                    ].map(({ title, icon, data }) =>
                         data ? (
                              <div className="col-lg-4" key={title}>
                                   <SectionCard title={title} icon={icon}>
                                        {(() => {
                                             const entries = Object.entries(data) as [string, unknown][];
                                             const pctEntries = entries.filter(([k]) => {
                                                  const kl = k.toLowerCase();
                                                  return kl.includes('rate') || kl.includes('pct') || kl.includes('percentage');
                                             });
                                             const otherEntries = entries.filter(([k]) => !pctEntries.some(([pk]) => pk === k));
                                             return (
                                                  <>
                                                       {pctEntries.map(([key, value]) => {
                                                            const numeric = toNumber(value);
                                                            return (
                                                                 <div className="mb-3" key={key}>
                                                                      <div className="d-flex justify-content-between small mb-1">
                                                                           <span className="text-muted">{formatMetricLabel(key)}</span>
                                                                           <span className="fw-semibold">{numeric.toFixed(1)}%</span>
                                                                      </div>
                                                                      <ProgressBar value={numeric} color={statusColorForPct(numeric)} />
                                                                 </div>
                                                            );
                                                       })}
                                                       {otherEntries.map(([key, value]) => (
                                                            <div className="d-flex justify-content-between small mb-2" key={key}>
                                                                 <span className="text-muted">{formatMetricLabel(key)}</span>
                                                                 <span className="fw-semibold">{formatMetricValue(key, value)}</span>
                                                            </div>
                                                       ))}
                                                  </>
                                             );
                                        })()}
                                   </SectionCard>
                              </div>
                         ) : null
                    )}
               </div>
          </div>
     );
}

