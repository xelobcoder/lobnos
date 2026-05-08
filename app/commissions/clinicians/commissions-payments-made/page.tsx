'use client'
import { RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiBarChartBoxLine, RiLineChartLine, RiBubbleChartLine, RiUserLine } from "@remixicon/react";
import dayjs from "dayjs";
import { useState, useEffect, useMemo } from "react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { currencyFormatter ,customFetch} from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";


const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)'; // Primary chart color
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TOOLTIP_BG = 'var(--bs-body-bg)';
const COLOR_TOOLTIP_FG = 'var(--bs-body-color)';
const COLOR_GREEN_TEXT = 'var(--bs-success)';
const COLOR_RED_TEXT = 'var(--bs-danger)';
const COLOR_SECONDARY = '#2563eb'; // Blue for payment_amount
const COLOR_TERTIARY = '#ea580c'; // Orange for waived_amount
const COLOR_EXPENSES = '#dc2626'; // Red for total_commission_amount

interface PaidCommissionData {
     id: number;
     batch_reference: string;
     recipient_type: string;
     recipient_id: number;
     start_date: string;
     end_date: string;
     total_commission_amount: string;
     payment_amount: string;
     waived_amount: string;
     status: string;
     payment_date: string;
     created_by: number;
     notes: string | null;
     created_at: string;
     updated_at: string;
     payment_method: number;
     created_by_username: string;
     payment_mode: string;
     recipient_name: string;
}

async function getPaidCommissions({ startDate, endDate, clinicianId, organizationId, recipientType }: { startDate: string, endDate: string, clinicianId?: number, organizationId?: number, recipientType?: string }) {
     try {
          let url = `commission-payments/commission/batch/information?&startDate=${dayjs(startDate).format('YYYY-MM-DD')}&endDate=${dayjs(endDate).format('YYYY-MM-DD')}`;
          if (clinicianId) {
               url += `&recipient_id=${clinicianId}`;
               if (recipientType) {
                    url += `&recipient_type=${recipientType}`;
               }
          } else if (organizationId) {
               url += `&recipient_id=${organizationId}&recipient_type=organization`;
          }
          const response = await customFetch(url);
          if (!response || !(response.success || response.status === true || response.status === 'success')) {
               throw new Error('API returned no data or failed.');
          }
          const records = Array.isArray(response.data) ? response.data : [];
          return records as PaidCommissionData[];
     } catch (error: any) {
          return { error: error.message || 'An unknown error occurred' };
     }
}


export interface CommissionClinician {
     id: number;
     name: string;
}

async function getClinicians(): Promise<CommissionClinician[]> {
     const url = 'clinicians';
     const response = await customFetch(url);
     if (!response || !response.result) return [];
     return Array.isArray(response.result) ? response.result : [];
}

export interface Organization {
     id: number;
     name: string;
}

async function getOrganizations(): Promise<Organization[]> {
     const url = 'organizations/details';
     const response = await customFetch(url);
     if (!response || !response.result) return [];
     return Array.isArray(response.result) ? response.result : [];
}


export default function PaidCommissionsPaymentMadePage() {
     const today = dayjs().format('YYYY-MM-DD');
     const currentYear = dayjs().year();
     const defaultStart = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD');
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [dateFilter, setDateFilter] = useState('This Year');
     const [paidCommissions, setPaidCommissions] = useState<PaidCommissionData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [chartView, setChartView] = useState<'bar' | 'line' | 'area'>('bar');
     const [clinicians, setClinicians] = useState<CommissionClinician[]>([]);
     const [selectedClinician, setSelectedClinician] = useState<number | null>(null);
     const [cliniciansLoading, setCliniciansLoading] = useState(false);
     const [organizations, setOrganizations] = useState<Organization[]>([]);
     const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);
     const [organizationsLoading, setOrganizationsLoading] = useState(false);
     const [showBreakdownModal, setShowBreakdownModal] = useState(false);
     const [selectedCommission, setSelectedCommission] = useState<PaidCommissionData | null>(null);
     const [breakdownData, setBreakdownData] = useState<any[]>([]);
     const [breakdownLoading, setBreakdownLoading] = useState(false);

     useEffect(() => {
          loadData();
     }, []);

     const loadClinicians = async () => {
          setCliniciansLoading(true);
          const result = await getClinicians();
          setClinicians(result);
          setCliniciansLoading(false);
     };

     const loadOrganizations = async () => {
          setOrganizationsLoading(true);
          const result = await getOrganizations();
          setOrganizations(result);
          setOrganizationsLoading(false);
     };

     const loadData = async (overrideStart?: string, overrideEnd?: string, overrideClinician?: number | null, overrideOrg?: number | null) => {
          setLoading(true);
          setError(null);
          try {
               const res = await getPaidCommissions({
                    startDate: overrideStart || startDate,
                    endDate: overrideEnd || endDate,
                    clinicianId: overrideClinician !== undefined ? overrideClinician || undefined : selectedClinician || undefined,
                    organizationId: overrideOrg !== undefined ? overrideOrg || undefined : selectedOrganization || undefined,
                    recipientType: (overrideClinician !== undefined ? overrideClinician : selectedClinician) ? 'clinician' : (overrideOrg !== undefined ? overrideOrg : selectedOrganization) ? 'organization' : undefined
               });

               const { error } = res as any;
               if (error) {
                    setError(error);
                    setPaidCommissions([]);
               } else {
                    setPaidCommissions(res as PaidCommissionData[]);
               }
          } catch (e: any) {
               setError(e.message || 'An unknown error occurred');
               setPaidCommissions([]);
          } finally {
               setLoading(false);
          }
     };

     const handleDateRangeChange = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     const handleResetFilters = async () => {
          setStartDate(defaultStart);
          setEndDate(today);
          setDateFilter('This Year');
          setSelectedClinician(null);
          setSelectedOrganization(null);
          await loadData(defaultStart, today, null, null);
     };

     const handleConvertToExpense = async (commission: PaidCommissionData) => {
          // TODO: Implement convert to expense functionality
          alert(`Convert to Expense clicked for batch: ${commission.batch_reference}`);
     };

     const handleViewBreakdown = async (commission: PaidCommissionData) => {
          setSelectedCommission(commission);
          setShowBreakdownModal(true);
          // TODO: Implement view breakdown functionality
     };

     const fetchBreakdownData = async (batchId: number, recipient_id: number, recipient_type: string, startdate: string, end_date: string) => {
          setBreakdownLoading(true);
          try {
               const url = `commission-payments/commission/batch/information/${batchId}/batch?startDate=${dayjs(startdate).format('YYYY-MM-DD')}&endDate=${dayjs(end_date).format('YYYY-MM-DD')}&recipient_id=${recipient_id}&recipient_type=${recipient_type}`;
               const response = await customFetch(url);
               if (response?.status == true && Array.isArray(response.data) && response.data.length > 0) {
                    setBreakdownData(response.data || []);
               } else {
                    setBreakdownData([]);
               }
          } catch (error) {
               setBreakdownData([]);
          } finally {
               setBreakdownLoading(false);
          }
     };

     useEffect(() => {
          if (showBreakdownModal && selectedCommission) {
               fetchBreakdownData(
                    selectedCommission.id,
                    selectedCommission.recipient_id,
                    selectedCommission.recipient_type,
                    selectedCommission.start_date,
                    selectedCommission.end_date
               );
          }
     }, [showBreakdownModal, selectedCommission]);

     // Process data for chart
     const chartData = useMemo(() => {
          const groupedData = paidCommissions.reduce((acc, record) => {
               const date = dayjs(record.payment_date).format('YYYY-MM-DD');
               if (!acc[date]) {
                    acc[date] = {
                         date,
                         totalCommission: 0,
                         paymentAmount: 0,
                         waivedAmount: 0,
                         count: 0
                    };
               }
               acc[date].totalCommission += Number(record.total_commission_amount);
               acc[date].paymentAmount += Number(record.payment_amount);
               acc[date].waivedAmount += Number(record.waived_amount);
               acc[date].count += 1;
               return acc;
          }, {} as Record<string, any>);

          return Object.values(groupedData).sort((a: any, b: any) =>
               new Date(a.date).getTime() - new Date(b.date).getTime()
          );
     }, [paidCommissions]);

     const formatDateForDisplay = (dateString: string) => {
          return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
     };

     const formatDateForTable = (dateString: string) => {
          return new Date(dateString).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
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
                              <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>Date</span>
                              <span className="fw-bold d-block" style={{ color: COLOR_TOOLTIP_FG }}>{formatDateForTable(label)}</span>
                         </div>
                         {payload.map((item: any, index: number) => {
                              const value = item.value;
                              const name = item.name;
                              const color = item.color;
                              return (
                                   <div key={index} className="mb-1">
                                        <span className="text-xs uppercase fw-medium" style={{ color: COLOR_TEXT_MUTED }}>{name}</span>
                                        <span className="fw-bold d-block" style={{ color }}>
                                             {currencyFormatter.format(value)}
                                        </span>
                                   </div>
                              );
                         })}
                    </div>
               );
          }
          return null;
     };

     const renderChart = () => {
          const commonProps = {
               data: chartData,
               margin: { top: 5, right: 5, left: 20, bottom: 45 },
          };
          const xAxisProps = {
               dataKey: "date",
               tickFormatter: formatDateForDisplay,
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

          if (chartView === "bar") {
               return (
                    <BarChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Bar dataKey="paymentAmount" name="Payment Amount" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="totalCommission" name="Total Commission" fill={COLOR_ACCENT} radius={[4, 4, 0, 0]} maxBarSize={30} />
                         <Bar dataKey="waivedAmount" name="Waived Amount" fill={COLOR_TERTIARY} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
               );
          }
          if (chartView === "line") {
               return (
                    <LineChart {...commonProps}>
                         <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                         <XAxis {...xAxisProps} />
                         <YAxis {...yAxisProps} />
                         <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                         <Legend {...legendProps} />
                         <Line type="monotone" dataKey="paymentAmount" name="Payment Amount" stroke={COLOR_SECONDARY} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                         <Line type="monotone" dataKey="totalCommission" name="Total Commission" stroke={COLOR_ACCENT} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                         <Line type="monotone" dataKey="waivedAmount" name="Waived Amount" stroke={COLOR_TERTIARY} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    </LineChart>
               );
          }

          return (
               <AreaChart {...commonProps}>
                    <defs>
                         <linearGradient id="colorPaymentFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_SECONDARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_SECONDARY} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorCommissionFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_ACCENT} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_ACCENT} stopOpacity={0.05} />
                         </linearGradient>
                         <linearGradient id="colorWaivedFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLOR_TERTIARY} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLOR_TERTIARY} stopOpacity={0.05} />
                         </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" vertical={false} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bs-tertiary-bg)' }} />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="paymentAmount" name="Payment Amount" stroke={COLOR_SECONDARY} fill="url(#colorPaymentFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_SECONDARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_SECONDARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    <Area type="monotone" dataKey="totalCommission" name="Total Commission" stroke={COLOR_ACCENT} fill="url(#colorCommissionFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_ACCENT }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_ACCENT, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
                    <Area type="monotone" dataKey="waivedAmount" name="Waived Amount" stroke={COLOR_TERTIARY} fill="url(#colorWaivedFill)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: COLOR_TERTIARY }} activeDot={{ r: 6, strokeWidth: 2, fill: COLOR_TERTIARY, stroke: COLOR_TOOLTIP_BG }} connectNulls={false} />
               </AreaChart>
          );
     };

     const renderChartContainerContent = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                         <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading commission data...</p>
                    </div>
               );
          }

          if (error && chartData.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
                    </div>
               );
          }

          if (chartData.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                         <h5 className="fw-medium mb-1">No Data Available</h5>
                         <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                              No commission payment data for the selected period.
                         </p>
                    </div>
               );
          }

          return (
               <ResponsiveContainer width="100%" height={350}>
                    {renderChart()}
               </ResponsiveContainer>
          );
     };

     const viewButtons = [
          { type: "bar" as const, icon: RiBarChartBoxLine, label: "Bar" },
          { type: "line" as const, icon: RiLineChartLine, label: "Line" },
          { type: "area" as const, icon: RiBubbleChartLine, label: "Area" },
     ];

     if (error) {
          return (
               <main className="container py-4">
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                         <RiUserLine size={32} className="me-2" />
                         <div>
                              <strong>Could Not Load Paid Commissions</strong>
                              <div>There was a problem connecting to the API.</div>
                              <div>{error}</div>
                         </div>
                    </div>
               </main>
          );
     }

     return (
          <div className="py-4">
               {/* Chart Section - TOP */}
               <div className="card mb-4" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
                         <div className="d-flex flex-column gap-3">
                              {/* Chart Controls and Filters Row */}
                              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                   <div className="d-flex flex-wrap align-items-center gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={loadClinicians} disabled={cliniciansLoading}>
                                             {cliniciansLoading ? 'Loading...' : 'Load Clinicians'}
                                        </Button>
                                        <select className="form-select form-select-sm" style={{ width: '180px' }} value={selectedClinician ?? ''} onChange={e => { setSelectedClinician(Number(e.target.value) || null); setSelectedOrganization(null); }} disabled={clinicians.length === 0}>
                                             <option value="">Select Clinician</option>
                                             {clinicians.map(c => (
                                                  <option key={c.id} value={c.id}>{c.name}</option>
                                             ))}
                                        </select>
                                        <Button variant="outline-primary" size="sm" onClick={loadOrganizations} disabled={organizationsLoading}>
                                             {organizationsLoading ? 'Loading...' : 'Load Orgs'}
                                        </Button>
                                        <select className="form-select form-select-sm" style={{ width: '180px' }} value={selectedOrganization ?? ''} onChange={e => { setSelectedOrganization(Number(e.target.value) || null); setSelectedClinician(null); }} disabled={organizations.length === 0}>
                                             <option value="">Select Organization</option>
                                             {organizations.map(o => (
                                                  <option key={o.id} value={o.id}>{o.name}</option>
                                             ))}
                                        </select>
                                        <DateFilterReusable
                                             value={dateFilter}
                                             onChange={setDateFilter}
                                             onDateRangeChange={handleDateRangeChange}
                                             label="Filter by"
                                             className="col-12 col-lg-auto"
                                        />
                                        <Button variant="primary" size="sm" onClick={() => loadData()} disabled={loading}>
                                             {loading ? 'Loading...' : 'Load'}
                                        </Button>
                                        <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                                             Reset
                                        </Button>
                                   </div>
                                   <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                        <div className="btn-group btn-group-sm" role="group" aria-label="Chart type">
                                             {viewButtons.map(btn => (
                                                  <Button
                                                       key={btn.type}
                                                       variant={chartView === btn.type ? 'primary' : 'outline-secondary'}
                                                       size="sm"
                                                       onClick={() => setChartView(btn.type)}
                                                       style={chartView === btn.type ? { backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT } : {}}
                                                  >
                                                       <btn.icon size={16} className="me-1 align-text-bottom" /> {btn.label}
                                                  </Button>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-4">
                         <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 d-flex align-items-center">
                              <RiBarChartBoxLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
                              Commission Payments Trend
                         </h2>
                         {renderChartContainerContent()}
                    </div>
                    <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
                         <div className="print-date-range" style={{ display: 'none' }}>
                              Report Period: {startDate} - {endDate}
                         </div>
                         <div className="d-flex justify-content-between mb-2">
                              <h4 className="fs-6 fw-medium mb-3">Data Table</h4>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => window.print()}>Print</button>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th scope="col" className="py-2">Batch Reference</th>
                                             <th scope="col" className="py-2">Start Date</th>
                                             <th scope="col" className="py-2">End Date</th>
                                             <th scope="col" className="py-2">Total Commission</th>
                                             <th scope="col" className="py-2">Payment Amount</th>
                                             <th scope="col" className="py-2">Waived Amount</th>
                                             <th scope="col" className="py-2">Status</th>
                                             <th scope="col" className="py-2">Payment Date</th>
                                             <th scope="col" className="py-2">Payment Mode</th>
                                             <th scope="col" className="py-2">Created By</th>
                                             <th scope="col" className="py-2">Recipient Name</th>
                                             <th scope="col" className="py-2">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {paidCommissions.map((record, idx) => (
                                             <tr key={idx}>
                                                  <td className="py-2">{record.batch_reference}</td>
                                                  <td className="py-2">{dayjs(record.start_date).format('DD/MM/YYYY')}</td>
                                                  <td className="py-2">{dayjs(record.end_date).format('DD/MM/YYYY')}</td>
                                                  <td className="py-2 fw-medium">{currencyFormatter.format(Number(record.total_commission_amount))}</td>
                                                  <td className="py-2 fw-medium">{currencyFormatter.format(Number(record.payment_amount))}</td>
                                                  <td className="py-2 fw-medium">{currencyFormatter.format(Number(record.waived_amount))}</td>
                                                  <td className="py-2">{record.status}</td>
                                                  <td className="py-2">{dayjs(record.payment_date).format('DD/MM/YYYY')}</td>
                                                  <td className="py-2">{record.payment_mode}</td>
                                                  <td className="py-2">{record.created_by_username}</td>
                                                  <td className="py-2">{record.recipient_name}</td>
                                                  <td className="py-2">
                                                       <Dropdown>
                                                            <Dropdown.Toggle as={Button} variant="outline-secondary" size="sm">
                                                                 Actions
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                 <Dropdown.Item onClick={() => handleConvertToExpense(record)}>Convert to Expense</Dropdown.Item>
                                                                 <Dropdown.Item onClick={() => handleViewBreakdown(record)}>View Breakdown</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                       </Dropdown>
                                                  </td>
                                             </tr>
                                        ))}
                                        <tr className="fw-bold border-top">
                                             <td className="py-2">Total</td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                             <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, record) => sum + Number(record.total_commission_amount), 0))}</td>
                                             <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, record) => sum + Number(record.payment_amount), 0))}</td>
                                             <td className="py-2">{currencyFormatter.format(paidCommissions.reduce((sum, record) => sum + Number(record.waived_amount), 0))}</td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                             <td className="py-2"></td>
                                        </tr>
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>
               {/* Breakdown Modal */}
               <Modal show={showBreakdownModal} onHide={() => setShowBreakdownModal(false)} size="xl">
                    <Modal.Header closeButton>
                         <Modal.Title>Commission Breakdown - {selectedCommission?.batch_reference}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {breakdownLoading ? (
                              <div className="d-flex flex-column justify-content-center align-items-center py-5">
                                   <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                        <span className="visually-hidden">Loading commission breakdown...</span>
                                   </div>
                                   <h6 className="text-muted">Loading Commission Breakdown</h6>
                                   <p className="text-muted small">Please wait while we fetch the detailed breakdown data...</p>
                              </div>
                         ) : selectedCommission ? (
                              <>
                                   <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <h6 className="fw-bold mb-3">Commission Details</h6>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Batch Reference:</strong></div>
                                                       <div className="col-6">{selectedCommission.batch_reference}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Period:</strong></div>
                                                       <div className="col-6">{dayjs(selectedCommission.start_date).format('DD/MM/YYYY')} - {dayjs(selectedCommission.end_date).format('DD/MM/YYYY')}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Status:</strong></div>
                                                       <div className="col-6">
                                                            <span className={`badge ${selectedCommission.status === 'paid' ? 'bg-success' : selectedCommission.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                 {selectedCommission.status.charAt(0).toUpperCase() + selectedCommission.status.slice(1)}
                                                            </span>
                                                       </div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Payment Date:</strong></div>
                                                       <div className="col-6">{dayjs(selectedCommission.payment_date).format('DD/MM/YYYY')}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Payment Mode:</strong></div>
                                                       <div className="col-6">{selectedCommission.payment_mode}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Created By:</strong></div>
                                                       <div className="col-6">{selectedCommission.created_by_username}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Recipient:</strong></div>
                                                       <div className="col-6">{selectedCommission.recipient_name}</div>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="border rounded p-3">
                                                  <h6 className="fw-bold mb-3">Financial Summary</h6>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Total Commission:</strong></div>
                                                       <div className="col-6 fw-bold text-primary">{currencyFormatter.format(Number(selectedCommission.total_commission_amount))}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Payment Amount:</strong></div>
                                                       <div className="col-6 fw-bold text-success">{currencyFormatter.format(Number(selectedCommission.payment_amount))}</div>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-6"><strong>Waived Amount:</strong></div>
                                                       <div className="col-6 fw-bold text-warning">{currencyFormatter.format(Number(selectedCommission.waived_amount))}</div>
                                                  </div>
                                                  <hr />
                                                  <div className="row">
                                                       <div className="col-6"><strong>Net Amount:</strong></div>
                                                       <div className="col-6 fw-bold">
                                                            {currencyFormatter.format(Number(selectedCommission.payment_amount) - Number(selectedCommission.waived_amount))}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   {selectedCommission!.notes && (
                                        <div className="mb-4">
                                             <h6 className="fw-bold">Notes</h6>
                                             <p className="mb-0 text-muted">{selectedCommission!.notes}</p>
                                        </div>
                                   )}

                                   <div className="border-top pt-4">
                                        <h6 className="fw-bold mb-3">Commission Breakdown</h6>
                                        {breakdownData.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-sm table-striped">
                                                       <thead className="table-light">
                                                            <tr>
                                                                 <th>Service ID</th>
                                                                 <th>Commission Due</th>
                                                                 <th>Amount Allocated</th>
                                                                 <th>Waived Amount</th>
                                                                 <th>Commission %</th>
                                                                 <th>Status</th>
                                                                 <th>Type</th>
                                                                 <th>Recipient ID</th>
                                                                 <th>Date</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {breakdownData.map((item: any, index: number) => (
                                                                 <tr key={index}>
                                                                      <td>{item.serviceid || 'N/A'}</td>
                                                                      <td>{currencyFormatter.format(Number(item.commission_due || 0))}</td>
                                                                      <td>{currencyFormatter.format(Number(item.amount_allocated || 0))}</td>
                                                                      <td>{currencyFormatter.format(Number(item.waived_amount || 0))}</td>
                                                                      <td>{item.commission_percentage || 'N/A'}%</td>
                                                                      <td>
                                                                           <span className={`badge ${item.status === 'paid' ? 'bg-success' : item.status === 'pending' ? 'bg-warning' : item.status === 'partial' ? 'bg-info' : 'bg-secondary'}`}>
                                                                                {item.status || 'N/A'}
                                                                           </span>
                                                                      </td>
                                                                      <td>{item.type || 'N/A'}</td>
                                                                      <td>{item.recipient_id || 'N/A'}</td>
                                                                      <td>{item.created_at ? dayjs(item.created_at).format('DD/MM/YYYY') : 'N/A'}</td>
                                                                 </tr>
                                                            ))}
                                                            <tr className="fw-bold border-top">
                                                                 <td>Total</td>
                                                                 <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.commission_due || 0), 0))}</td>
                                                                 <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.amount_allocated || 0), 0))}</td>
                                                                 <td>{currencyFormatter.format(breakdownData.reduce((sum, item) => sum + Number(item.waived_amount || 0), 0))}</td>
                                                                 <td></td>
                                                                 <td></td>
                                                                 <td></td>
                                                                 <td></td>
                                                                 <td></td>
                                                            </tr>
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <p className="text-muted">No detailed breakdown data available for this commission batch.</p>
                                             </div>
                                        )}
                                   </div>
                              </>
                         ) : (
                              <div className="text-center py-4">
                                   <p className="text-muted">No commission data selected.</p>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="outline-secondary" size="sm" onClick={() => setShowBreakdownModal(false)}>Close</Button>
                    </Modal.Footer>
               </Modal>

               {!loading && paidCommissions.length === 0 && (
                    <main className="container py-4">
                         <div className="alert alert-info d-flex align-items-center" role="alert">
                              <RiUserLine size={28} className="me-2" style={{ opacity: 0.5 }} />
                              <div>
                                   <strong>No Paid Commissions Found</strong>
                                   <div>No paid commission records found for this clinician.</div>
                              </div>
                         </div>
                    </main>
               )}
               <style>{`
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
                         .printable-table-with-borders th:last-child,
                         .printable-table-with-borders td:last-child {
                              display: none !important;
                         }
                         .printable-table-with-borders th,
                         .printable-table-with-borders td {
                              padding: 0.25rem 0.5rem !important;
                         }
                         .print-date-range {
                              display: block !important;
                              margin-bottom: 1rem;
                              font-weight: bold;
                         }
                    }
               `}</style>
          </div>
     );
}
