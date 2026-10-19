'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
     ResponsiveContainer,
     BarChart,
     Bar,
     XAxis,
     YAxis,
     CartesianGrid,
     Tooltip,
     Legend,
     LineChart,
     Line,
     AreaChart,
     Area,
} from "recharts";
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';
import { RiArrowLeftLine, RiBarChartBoxLine, RiCalendarEventLine, RiRefreshLine, RiTimeLine, RiMoneyDollarCircleLine, RiLineChartLine, RiBubbleChartLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiFilterLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue for payment count
const COLOR_TERTIARY = '#ea580c'; // Orange for average amount

interface PaymentTimeAnalytics {
     monthly_payments: Array<{
          period: string;
          payment_count: number;
          total_amount: number;
          average_amount: number;
          unique_suppliers: number;
     }>;
     yearly_payments: Array<{
          period: string;
          payment_count: number;
          total_amount: number;
          average_amount: number;
          unique_suppliers: number;
     }>;
     daily_payments: Array<{
          period: string;
          payment_count: number;
          total_amount: number;
          average_amount: number;
          unique_suppliers: number;
     }>;
     hourly_payments: Array<{
          period: string;
          payment_count: number;
          total_amount: number;
          average_amount: number;
          unique_suppliers: number;
     }>;
     summary: {
          total_payments_all_time: number;
          total_amount_all_time: number;
          average_payment_amount: number;
          payments_in_date_range: number;
          amount_in_date_range: number;
     };
}

export default function PaymentTimeAnalyticsPage() {
     const [analytics, setAnalytics] = useState<PaymentTimeAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [view, setView] = useState<"line" | "bar" | "area">("line");
     const [showChartModal, setShowChartModal] = useState(false);
     const [chartType, setChartType] = useState<'monthly' | 'daily' | 'yearly'>('monthly');

     const viewButtons = [
          { type: "line" as const, label: "Line", icon: RiLineChartLine },
          { type: "bar" as const, label: "Bar", icon: RiBarChartBoxLine },
          { type: "area" as const, label: "Area", icon: RiBubbleChartLine }
     ];

     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadPaymentTimeAnalytics();
          }
     }, [branchid, employeeid]);

     const loadPaymentTimeAnalytics = async () => {
          try {
               const params = new URLSearchParams();
               if (startDate) params.append('start_date', startDate);
               if (endDate) params.append('end_date', endDate);

               const response = await customFetch(`inventory/analytics/payment-time?${params.toString()}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load payment time analytics');
               }
          } catch (error) {
               console.error('Error loading payment time analytics:', error);
               toast.error('Error loading payment time analytics');
          } finally {
               setLoading(false);
          }
     };

     const handleDateFilter = () => {
          setLoading(true);
          loadPaymentTimeAnalytics();
     };

     const handleResetFilters = () => {
          setStartDate('');
          setEndDate('');
          setLoading(true);
          loadPaymentTimeAnalytics();
     };

     const handleViewToggle = (newView: "line" | "bar" | "area") => {
          setView(newView);
     };

     const openChartModal = (type: 'monthly' | 'daily' | 'yearly') => {
          setChartType(type);
          setShowChartModal(true);
     };

     const closeChartModal = () => {
          setShowChartModal(false);
     };

     const formatDateForDisplay = (dateString: string) => {
          try {
               const date = new Date(dateString);
               return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          } catch {
               return dateString;
          }
     };

     const formatHourForDisplay = (hourString: string) => {
          try {
               const date = new Date(hourString);
               return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          } catch {
               return hourString;
          }
     };

     const CustomTooltip = ({ active, payload, label }: any) => {
          if (active && payload && payload.length) {
               return (
                    <div
                         className="rounded-lg border p-2 shadow-sm"
                         style={{
                              backgroundColor: COLOR_TOOLTIP_BG,
                              borderColor: COLOR_BORDER,
                              minWidth: '220px',
                              fontSize: '0.8rem'
                         }}
                    >
                         <div className="mb-2">
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Period</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{label}</span>
                         </div>
                         {payload.map((item: any, index: number) => {
                              const value = item.value;
                              const name = item.name;
                              const color = item.color;
                              return (
                                   <div key={index} className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{name}</span>
                                        <span className="fw-bold d-block" style={{ color }}>
                                             {name.includes('Amount') ? currencyFormatter.format(value) : value}
                                        </span>
                                   </div>
                              );
                         })}
                    </div>
               );
          }
          return null;
     };

     const renderModalChart = () => {
          if (!analytics) return null;

          let data: any[] = [];
          let title = '';

          switch (chartType) {
               case 'monthly':
                    data = analytics.monthly_payments.map(item => ({
                         period: item.period,
                         total_amount: item.total_amount,
                         payment_count: item.payment_count,
                         average_amount: item.average_amount,
                    }));
                    title = 'Monthly Payment Trends';
                    break;
               case 'daily':
                    data = analytics.daily_payments.map(item => ({
                         period: formatDateForDisplay(item.period),
                         total_amount: item.total_amount,
                         payment_count: item.payment_count,
                         average_amount: item.average_amount,
                    }));
                    title = 'Daily Payment Trends';
                    break;
               case 'yearly':
                    data = analytics.yearly_payments.map(item => ({
                         period: item.period,
                         total_amount: item.total_amount,
                         payment_count: item.payment_count,
                         average_amount: item.average_amount,
                    }));
                    title = 'Yearly Payment Trends';
                    break;
          }

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => value,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="payment_count" name="Payment Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id={`color${chartType}TotalAmountFill`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id={`color${chartType}PaymentCountFill`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill={`url(#color${chartType}TotalAmountFill)`} strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Area type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} fill={`url(#color${chartType}PaymentCountFill)`} strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const renderMonthlyChart = () => {
          if (!analytics || !analytics.monthly_payments.length) return null;

          const data = analytics.monthly_payments.map(item => ({
               period: item.period,
               total_amount: item.total_amount,
               payment_count: item.payment_count,
               average_amount: item.average_amount,
          }));

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => value,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="payment_count" name="Payment Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorMonthlyTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorMonthlyPaymentCountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorMonthlyTotalAmountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Area type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} fill="url(#colorMonthlyPaymentCountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const renderDailyChart = () => {
          if (!analytics || !analytics.daily_payments.length) return null;

          const data = analytics.daily_payments.map(item => ({
               period: formatDateForDisplay(item.period),
               total_amount: item.total_amount,
               payment_count: item.payment_count,
               average_amount: item.average_amount,
          }));

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => value,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="payment_count" name="Payment Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorDailyTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorDailyPaymentCountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorDailyTotalAmountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Area type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} fill="url(#colorDailyPaymentCountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const renderYearlyChart = () => {
          if (!analytics || !analytics.yearly_payments.length) return null;

          const data = analytics.yearly_payments.map(item => ({
               period: item.period,
               total_amount: item.total_amount,
               payment_count: item.payment_count,
               average_amount: item.average_amount,
          }));

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => value,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="payment_count" name="Payment Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorYearlyTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorYearlyPaymentCountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorYearlyTotalAmountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Area type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} fill="url(#colorYearlyPaymentCountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const renderHourlyChart = () => {
          if (!analytics || !analytics.hourly_payments.length) return null;

          const data = analytics.hourly_payments.map(item => ({
               period: formatHourForDisplay(item.period),
               total_amount: item.total_amount,
               payment_count: item.payment_count,
               average_amount: item.average_amount,
          }));

          const commonProps = {
               data: data,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };

          const xAxisProps = {
               dataKey: "period",
               tickFormatter: (value: string) => value,
               angle: -45,
               textAnchor: "end" as const,
               height: 60,
               interval: "preserveStartEnd" as const,
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: { stroke: COLOR_BORDER },
               tickLine: { stroke: COLOR_BORDER },
          };

          const yAxisProps = {
               tickFormatter: (value: number) => currencyFormatter.format(value),
               tick: { fontSize: 11, fill: COLOR_TEXT_MUTED },
               axisLine: false,
               tickLine: false,
               width: 95,
          };

          const legendProps = {
               verticalAlign: "top" as const,
               align: "right" as const,
               iconType: "circle" as const,
               iconSize: 8,
               wrapperStyle: { fontSize: '13px', color: 'var(--bs-body-color)', paddingBottom: '15px' }
          };

          if (view === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="total_amount" name="Total Amount" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="payment_count" name="Payment Count" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (view === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                         <Line type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                              activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorHourlyTotalAmountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorHourlyPaymentCountFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="total_amount" name="Total Amount" stroke={COLOR_ACCENT} fill="url(#colorHourlyTotalAmountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_ACCENT }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} />
                    <Area type="monotone" dataKey="payment_count" name="Payment Count" stroke={COLOR_SECONDARY} fill="url(#colorHourlyPaymentCountFill)" strokeWidth={2}
                         dot={{ r: 3, strokeWidth: 1, fill: COLOR_SECONDARY }}
                         activeDot={{ r: 6, strokeWidth: 1.5, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} />
               </AreaChart>
          );
     };

     const renderMonthlyChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading monthly payment analytics...</p>
                    </div>
               );
          }

          if (!analytics || analytics.monthly_payments.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Monthly Payment Data</h5>
                         <p className="text-muted px-3">No monthly payment data available.</p>
                    </div>
               );
          }

          return (
               <ResponsiveContainer width="100%" height={350}>
                    {renderMonthlyChart() || <div>No data</div>}
               </ResponsiveContainer>
          );
     };

     const renderDailyChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading daily payment analytics...</p>
                    </div>
               );
          }

          if (!analytics || analytics.daily_payments.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Daily Payment Data</h5>
                         <p className="text-muted px-3">No daily payment data available.</p>
                    </div>
               );
          }

          return (
               <ResponsiveContainer width="100%" height={350}>
                    {renderDailyChart() || <div>No data</div>}
               </ResponsiveContainer>
          );
     };

     const renderYearlyChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading yearly payment analytics...</p>
                    </div>
               );
          }

          if (!analytics || analytics.yearly_payments.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Yearly Payment Data</h5>
                         <p className="text-muted px-3">No yearly payment data available.</p>
                    </div>
               );
          }

          return (
               <ResponsiveContainer width="100%" height={350}>
                    {renderYearlyChart() || <div>No data</div>}
               </ResponsiveContainer>
          );
     };

     const renderHourlyChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted">Loading hourly payment analytics...</p>
                    </div>
               );
          }

          if (!analytics || analytics.hourly_payments.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Hourly Payment Data</h5>
                         <p className="text-muted px-3">No hourly payment data available.</p>
                    </div>
               );
          }

          return (
               <ResponsiveContainer width="100%" height={350}>
                    {renderHourlyChart() || <div>No data</div>}
               </ResponsiveContainer>
          );
     };

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4" data-pdf-root>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none d-block mb-2">
                              <RiArrowLeftLine size={16} className="me-1" />
                              <span className="text-muted">Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">
                              <RiTimeLine className="me-2" />
                              Payment Time Analytics
                         </h2>
                    </div>
                    <div className="d-flex gap-2">
                         <ExportPdfButton
                              title="Payment Time Analytics"
                              period={startDate || endDate ? `${startDate || 'Beginning'} to ${endDate || 'Today'}` : undefined}
                         />
                    </div>
               </div>

               {/* Summary Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-primary-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-primary mb-2">{analytics.summary.total_payments_all_time}</div>
                                        <p className="text-muted mb-1">Total Payments</p>
                                        <small className="text-primary">All Time</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-success-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-success mb-2">{currencyFormatter.format(analytics.summary.total_amount_all_time)}</div>
                                        <p className="text-muted mb-1">Total Amount</p>
                                        <small className="text-success">All Time</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-info-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-info mb-2">{analytics.summary.payments_in_date_range}</div>
                                        <p className="text-muted mb-1">Payments (Date Range)</p>
                                        <small className="text-info">Selected Period</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-warning-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-warning mb-2">{currencyFormatter.format(analytics.summary.amount_in_date_range)}</div>
                                        <p className="text-muted mb-1">Amount (Date Range)</p>
                                        <small className="text-warning">Selected Period</small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Monthly Payments Chart */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiTimeLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Monthly Payment Trends
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="input-group input-group-sm" style={{ flexBasis: '160px', minWidth: '150px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: COLOR_BORDER }}>
                                                  <RiCalendarEventLine size={16} className="text-muted" />
                                             </span>
                                             <input type="date" className="form-control shadow-none border-start-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                                        </div>
                                        <button onClick={handleDateFilter} disabled={loading} className="btn btn-sm btn-primary d-flex align-items-center">
                                             <RiFilterLine size={16} className="me-1" /> Apply
                                        </button>
                                        <button onClick={handleResetFilters} disabled={loading} className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                                             <RiRefreshLine size={16} className="me-1" /> Reset
                                        </button>
                                   </div>
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                        {viewButtons.map(btn => (
                                             <button
                                                  key={btn.type}
                                                  type="button"
                                                  className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                  onClick={() => handleViewToggle(btn.type)}
                                                  style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                             </button>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {renderMonthlyChartContainerContent()}
                    </div>
               </div>

               {/* Monthly Payments Table */}
               {analytics && analytics.monthly_payments.length > 0 && (
                    <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Payment Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Monthly Payment Data Table</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th className="text-start">Month</th>
                                                  <th className="text-start">Payment Count</th>
                                                  <th className="text-start">Total Amount</th>
                                                  <th className="text-start">Average Amount</th>
                                                  <th className="text-start">Unique Suppliers</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {analytics.monthly_payments.map((item, index) => (
                                                  <tr key={index}>
                                                       <td className="text-start fw-bold">{item.period}</td>
                                                       <td className="text-start text-primary">{item.payment_count}</td>
                                                       <td className="text-start text-success fw-bold">{currencyFormatter.format(item.total_amount)}</td>
                                                       <td className="text-start text-info">{currencyFormatter.format(item.average_amount)}</td>
                                                       <td className="text-start text-secondary">{item.unique_suppliers}</td>
                                                  </tr>
                                             ))}
                                             <tr className="fw-bold border-top">
                                                  <td className="text-start">Total</td>
                                                  <td className="text-start">{analytics.monthly_payments.reduce((sum, item) => sum + item.payment_count, 0)}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.monthly_payments.reduce((sum, item) => sum + item.total_amount, 0))}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.monthly_payments.reduce((sum, item) => sum + item.average_amount, 0) / analytics.monthly_payments.length)}</td>
                                                  <td className="text-start">{analytics.monthly_payments.reduce((sum, item) => sum + item.unique_suppliers, 0)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               )}

               {/* Daily Payments Chart */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiTimeLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Daily Payment Trends
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                        {viewButtons.map(btn => (
                                             <button
                                                  key={btn.type}
                                                  type="button"
                                                  className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                  onClick={() => handleViewToggle(btn.type)}
                                                  style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                             </button>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {renderDailyChartContainerContent()}
                    </div>
               </div>

               {/* Daily Payments Table */}
               {analytics && analytics.daily_payments.length > 0 && (
                    <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Payment Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Daily Payment Data Table</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th className="text-start">Date</th>
                                                  <th className="text-start">Payment Count</th>
                                                  <th className="text-start">Total Amount</th>
                                                  <th className="text-start">Average Amount</th>
                                                  <th className="text-start">Unique Suppliers</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {analytics.daily_payments.map((item, index) => (
                                                  <tr key={index}>
                                                       <td className="text-start fw-bold">{formatDateForDisplay(item.period)}</td>
                                                       <td className="text-start text-primary">{item.payment_count}</td>
                                                       <td className="text-start text-success fw-bold">{currencyFormatter.format(item.total_amount)}</td>
                                                       <td className="text-start text-info">{currencyFormatter.format(item.average_amount)}</td>
                                                       <td className="text-start text-secondary">{item.unique_suppliers}</td>
                                                  </tr>
                                             ))}
                                             <tr className="fw-bold border-top">
                                                  <td className="text-start">Total</td>
                                                  <td className="text-start">{analytics.daily_payments.reduce((sum, item) => sum + item.payment_count, 0)}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.daily_payments.reduce((sum, item) => sum + item.total_amount, 0))}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.daily_payments.reduce((sum, item) => sum + item.average_amount, 0) / analytics.daily_payments.length)}</td>
                                                  <td className="text-start">{analytics.daily_payments.reduce((sum, item) => sum + item.unique_suppliers, 0)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               )}

               {/* Hourly Payments Chart */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiTimeLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Hourly Payment Trends
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                        {viewButtons.map(btn => (
                                             <button
                                                  key={btn.type}
                                                  type="button"
                                                  className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                  onClick={() => handleViewToggle(btn.type)}
                                                  style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                             </button>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {renderHourlyChartContainerContent()}
                    </div>
               </div>

               {/* Hourly Payments Table */}
               {analytics && analytics.hourly_payments.length > 0 && (
                    <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Payment Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Hourly Payment Data Table</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th className="text-start">Time</th>
                                                  <th className="text-start">Payment Count</th>
                                                  <th className="text-start">Total Amount</th>
                                                  <th className="text-start">Average Amount</th>
                                                  <th className="text-start">Unique Suppliers</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {analytics.hourly_payments.map((item, index) => (
                                                  <tr key={index}>
                                                       <td className="text-start fw-bold">{formatHourForDisplay(item.period)}</td>
                                                       <td className="text-start text-primary">{item.payment_count}</td>
                                                       <td className="text-start text-success fw-bold">{currencyFormatter.format(item.total_amount)}</td>
                                                       <td className="text-start text-info">{currencyFormatter.format(item.average_amount)}</td>
                                                       <td className="text-start text-secondary">{item.unique_suppliers}</td>
                                                  </tr>
                                             ))}
                                             <tr className="fw-bold border-top">
                                                  <td className="text-start">Total</td>
                                                  <td className="text-start">{analytics.hourly_payments.reduce((sum, item) => sum + item.payment_count, 0)}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.hourly_payments.reduce((sum, item) => sum + item.total_amount, 0))}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.hourly_payments.reduce((sum, item) => sum + item.average_amount, 0) / analytics.hourly_payments.length)}</td>
                                                  <td className="text-start">{analytics.hourly_payments.reduce((sum, item) => sum + item.unique_suppliers, 0)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               )}

               {/* Yearly Payments Chart */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiTimeLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                                   Yearly Payment Trends
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                        {viewButtons.map(btn => (
                                             <button
                                                  key={btn.type}
                                                  type="button"
                                                  className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                  onClick={() => handleViewToggle(btn.type)}
                                                  style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                             >
                                                  <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                             </button>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {renderYearlyChartContainerContent()}
                    </div>
               </div>

               {/* Yearly Payments Table */}
               {analytics && analytics.yearly_payments.length > 0 && (
                    <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                         <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                              <div className="print-date-range" style={{ display: 'none' }}>
                                   Payment Report Period: {startDate} - {endDate}
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                   <h4 className="fs-6 fw-medium mb-3">Yearly Payment Data Table</h4>
                                   <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th className="text-start">Year</th>
                                                  <th className="text-start">Payment Count</th>
                                                  <th className="text-start">Total Amount</th>
                                                  <th className="text-start">Average Amount</th>
                                                  <th className="text-start">Unique Suppliers</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {analytics.yearly_payments.map((item, index) => (
                                                  <tr key={index}>
                                                       <td className="text-start fw-bold">{item.period}</td>
                                                       <td className="text-start text-primary">{item.payment_count}</td>
                                                       <td className="text-start text-success fw-bold">{currencyFormatter.format(item.total_amount)}</td>
                                                       <td className="text-start text-info">{currencyFormatter.format(item.average_amount)}</td>
                                                       <td className="text-start text-secondary">{item.unique_suppliers}</td>
                                                  </tr>
                                             ))}
                                             <tr className="fw-bold border-top">
                                                  <td className="text-start">Total</td>
                                                  <td className="text-start">{analytics.yearly_payments.reduce((sum, item) => sum + item.payment_count, 0)}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.yearly_payments.reduce((sum, item) => sum + item.total_amount, 0))}</td>
                                                  <td className="text-start">{currencyFormatter.format(analytics.yearly_payments.reduce((sum, item) => sum + item.average_amount, 0) / analytics.yearly_payments.length)}</td>
                                                  <td className="text-start">{analytics.yearly_payments.reduce((sum, item) => sum + item.unique_suppliers, 0)}</td>
                                             </tr>
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               )}

               {/* Chart Modal */}
               {showChartModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                                        <h5 className="modal-title d-flex align-items-center">
                                             <RiBarChartBoxLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
                                             {chartType === 'monthly' ? 'Monthly' : chartType === 'daily' ? 'Daily' : 'Yearly'} Payment Trends
                                        </h5>
                                        <button type="button" className="btn-close" onClick={closeChartModal}></button>
                                   </div>
                                   <div className="modal-body p-4">
                                        <div className="d-flex justify-content-end mb-3">
                                             <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                                  {viewButtons.map(btn => (
                                                       <button
                                                            key={btn.type}
                                                            type="button"
                                                            className={`btn ${view === btn.type ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                                            onClick={() => handleViewToggle(btn.type)}
                                                            style={view === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                       >
                                                            <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                                       </button>
                                                  ))}
                                             </div>
                                        </div>
                                        <div style={{ width: "100%", height: 400 }}>
                                             <ResponsiveContainer>
                                                  {renderModalChart() || <div>No chart data</div>}
                                             </ResponsiveContainer>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               <style jsx global>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
                    .table-responsive thead.sticky-top th {
                         border-bottom: 2px solid var(--bs-border-color);
                    }
                    .table-responsive thead th {
                         font-weight: bold !important;
                         color: #000 !important;
                    }
                    @media print {
                         .printable-table-with-borders tbody tr {
                              border: none !important;
                              border-bottom: 2px solid #000 !important;
                         }
                         .printable-table-with-borders tbody tr:nth-child(odd) {
                              background-color: #f8f9fa !important;
                         }
                         .printable-table-with-borders th,
                         .printable-table-with-borders td {
                              padding: 0.25rem 0.5rem !important;
                         }
                    }
                    .modal-content {
                         border: 1px solid var(--bs-border-color);
                         border-radius: 0.75rem;
                    }
               `}</style>
          </div>
     );
}