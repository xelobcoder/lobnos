"use client";

import React, { useEffect, useState, useCallback } from "react";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { RiRefreshLine, RiPlayLine } from "@remixicon/react";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

const IconChart = () => <span style={{ fontSize: '1.2rem', color: SHADCN_PRIMARY, marginRight: '0.5rem' }}>📊</span>;
const IconLoader = () => <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: SHADCN_PRIMARY }} role="status"><span className="visually-hidden">Loading...</span></div>;
const IconError = () => <span style={{ fontSize: '2.5rem', color: '#DC3545' }}>⚠️</span>;
const IconEmpty = () => <span style={{ fontSize: '2.5rem', color: SHADCN_MUTED_FOREGROUND }}>📦</span>;

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A";
const COLOR_HIGHEST_PAID = "oklch(0.646 0.222 41.116)";
const COLOR_LOWEST_PAID = "#F97316";

interface ClinicianSalesAPIEntry {
    clinicianId: number;
    status: string;
    totalServicesRendered: number;
    gross_revenue: string;
    cash_collected: string;
    earned_revenue: string;
    discount: string;
    total_refunded: string;
    clinician_name: string;
}

interface ChartDataEntry {
    clinicianId: number;
    name: string;
    totalServicesRendered: number;
    earned_revenue: number;
    gross_revenue: number;
    cash_collected: number;
    discount: number;
    total_refunded: number;
    profit: number;
    collectionRate: number;
}

export default function TotalSalesByClinician() {
    const [data, setData] = useState<ChartDataEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useApplicationSettings().applicationsettings || {};
    const employeeid = user?.employeeid;

    const getInitialDates = () => {
        const today = new Date();
        const endDate = today.toISOString().split("T")[0];
        const startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 29);
        const startDate = startDateObj.toISOString().split("T")[0];
        return { startDate, endDate };
    };

    const initialDates = getInitialDates();
    const [startDate, setStartDate] = useState<string>(initialDates.startDate);
    const [endDate, setEndDate] = useState<string>(initialDates.endDate);
    const [dateFilter, setDateFilter] = useState<string>("");

    const fetchData = useCallback(async (fetchStartDate: string, fetchEndDate: string, currentEmployeeId?: number) => {
        if (!currentEmployeeId) {
            setData([]);
            setLoading(false);
            return;
        }
        if (!fetchStartDate || !fetchEndDate) {
            setError("Please select valid start and end dates.");
            setData([]);
            setLoading(false);
            return;
        }
        if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
            setError("Start date cannot be after end date.");
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        const url = `financials/billing/summary?key=totalSalesByClinician&startDate=${fetchStartDate}&endDate=${fetchEndDate}&employeeid=${currentEmployeeId}`;
        try {
            const fetchedData: ClinicianSalesAPIEntry[] = await customFetch(url);

            if (!fetchedData || !Array.isArray(fetchedData)) {
                throw new Error("Invalid data format received from the API.");
            }

            const formattedData = fetchedData.map((item) => {
                const earned_revenue = parseFloat(item.earned_revenue) || 0;
                const gross_revenue = parseFloat(item.gross_revenue) || 0;
                const cash_collected = parseFloat(item.cash_collected) || 0;
                const discount = parseFloat(item.discount) || 0;
                const total_refunded = parseFloat(item.total_refunded) || 0;
                const profit = earned_revenue - gross_revenue;
                const collectionRate = earned_revenue > 0 ? (cash_collected / earned_revenue) * 100 : 0;

                return {
                    clinicianId: item.clinicianId,
                    name: item.clinician_name === "Unknown" ? "Lab Direct Cases" : item.clinician_name,
                    totalServicesRendered: item.totalServicesRendered,
                    earned_revenue,
                    gross_revenue,
                    cash_collected,
                    discount,
                    total_refunded,
                    profit,
                    collectionRate,
                };
            });

            setData(formattedData);

        } catch (err) {
            setData([]);
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
            console.error("Error fetching TotalSalesByClinician:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (employeeid) {
            // Initial load with default dates
            fetchData(startDate, endDate, employeeid);
        } else {
            setLoading(false);
            setError("Employee information is not loaded yet.");
        }
    }, [employeeid]); // Only run when employeeid is available

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value);
    const handleLoadData = () => {
        if (employeeid) {
            fetchData(startDate, endDate, employeeid);
        }
    };
    const handleResetFilters = () => {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getInitialDates();
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        setDateFilter("");
        // Load data with default dates
        if (employeeid) {
            fetchData(defaultStartDate, defaultEndDate, employeeid);
        }
    };

    const renderChartContent = () => {
        if (loading) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <IconLoader />
                    <p className="mt-3" style={{ color: SHADCN_MUTED_FOREGROUND }}>Loading clinician sales data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconError />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>Error Loading Data</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <IconEmpty />
                    <h5 className="fw-medium mt-3 mb-1" style={{ color: SHADCN_FOREGROUND }}>No Data Available</h5>
                    <p className="px-3" style={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem' }}>
                        No sales data found for clinicians in the selected period.
                    </p>
                </div>
            );
        }

        const numDataPoints = data.length;
        const angleXAxis = numDataPoints > 6;
        const bottomMargin = angleXAxis ? 70 : 30;

        const summary = data.reduce(
            (totals, item) => {
                totals.services += item.totalServicesRendered;
                totals.gross_revenue += item.gross_revenue;
                totals.cash_collected += item.cash_collected;
                totals.earned_revenue += item.earned_revenue;
                totals.discount += item.discount;
                totals.total_refunded += item.total_refunded;
                return totals;
            },
            {
                services: 0,
                gross_revenue: 0,
                cash_collected: 0,
                earned_revenue: 0,
                discount: 0,
                total_refunded: 0,
            }
        );

        const totalPaidValues = data.map((item) => item.cash_collected);
        const maxPaid = Math.max(...totalPaidValues);
        const minPaid = Math.min(...totalPaidValues);

        return (
            <>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data} margin={{ top: 5, right: 15, left: 10, bottom: bottomMargin }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} vertical={false} />
                        <XAxis
                            dataKey="name"
                            angle={angleXAxis ? -40 : 0}
                            textAnchor={angleXAxis ? "end" : "middle"}
                            height={angleXAxis ? 80 : 40}
                            interval={0}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={{ stroke: SHADCN_BORDER }}
                            tickLine={{ stroke: SHADCN_BORDER }}
                        />
                        <YAxis
                            tickFormatter={(value: number) => currencyFormatter.format(value)}
                            tick={{ fontSize: 11, fill: SHADCN_MUTED_FOREGROUND }}
                            axisLine={false}
                            tickLine={false}
                            width={90}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === 'cash_collected') return [currencyFormatter.format(value), 'Cash Collected'];
                                return [value, name];
                            }}
                            cursor={{ fill: `${SHADCN_PRIMARY}20` }}
                            contentStyle={{
                                backgroundColor: SHADCN_TOOLTIP_BG,
                                color: SHADCN_TOOLTIP_FG,
                                borderRadius: '0.375rem',
                                border: `1px solid ${SHADCN_BORDER}`,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '0.8rem',
                                padding: '0.5rem 0.75rem'
                            }}
                            labelStyle={{ marginBottom: '0.25rem', fontWeight: '500' }}
                        />
                        <Bar
                            dataKey="cash_collected"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        >
                            {data.map((item) => (
                                <Cell
                                    key={`cell-${item.clinicianId}`}
                                    fill={
                                        item.cash_collected === maxPaid
                                            ? COLOR_HIGHEST_PAID
                                            : item.cash_collected === minPaid
                                                ? COLOR_LOWEST_PAID
                                                : SHADCN_PRIMARY
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="table-responsive mt-4">
                    <p className="small text-muted mb-2">
                        Table reflects clinician sales revenue for the selected period. These are service sales totals, not commission payouts.
                    </p>
                    <table className="table table-sm table-hover table-striped small text-start">
                        <thead className="sticky-top bg-body-tertiary">
                            <tr>
                                <th>Clinician</th>
                                <th className="text-end">Services</th>
                                <th className="text-end">Gross Revenue</th>
                                <th className="text-end">Cash Collected</th>
                                <th className="text-end">Earned Revenue</th>
                                <th className="text-end">Discount</th>
                                <th className="text-end">Refunded</th>
                                <th className="text-end">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const detailUrl = `/analytics/sales/clinician-services?clinicianId=${item.clinicianId}&startDate=${startDate}&endDate=${endDate}`;
                                return (
                                    <tr key={`${item.clinicianId}-${item.name}`}>
                                        <td>{item.name}</td>
                                        <td className="text-end">{item.totalServicesRendered}</td>
                                        <td className="text-end">{currencyFormatter.format(item.gross_revenue)}</td>
                                        <td className="text-end">{currencyFormatter.format(item.cash_collected)}</td>
                                        <td className="text-end">{currencyFormatter.format(item.earned_revenue)}</td>
                                        <td className="text-end">{currencyFormatter.format(item.discount)}</td>
                                        <td className="text-end">{currencyFormatter.format(item.total_refunded)}</td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className="btn  btn-outline-primary"
                                                onClick={() => window.open(detailUrl, '_blank')}
                                            >
                                                VIEW DETAILS <br /> BREAKDOWN
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="fw-semibold border-top">
                                <td>Total</td>
                                <td className="text-end">{summary.services}</td>
                                <td className="text-end">{currencyFormatter.format(summary.gross_revenue)}</td>
                                <td className="text-end">{currencyFormatter.format(summary.cash_collected)}</td>
                                <td className="text-end">{currencyFormatter.format(summary.earned_revenue)}</td>
                                <td className="text-end">{currencyFormatter.format(summary.discount)}</td>
                                <td className="text-end">{currencyFormatter.format(summary.total_refunded)}</td>
                                <td />
                            </tr>
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    return (
        <div className="card shadow-sm" style={{
            borderRadius: '0.75rem',
            borderColor: SHADCN_BORDER,
            backgroundColor: SHADCN_CARD_BG
        }}>
            <div
                className="card-header py-3 px-4"
                style={{
                    backgroundColor: SHADCN_MUTED_BG,
                    borderBottom: `1px solid ${SHADCN_BORDER}`
                }}
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                        <h2 className="fs-6 fw-semibold text-body-emphasis mb-1 d-flex align-items-center">
                            <IconChart />
                            Total Sales by Clinician
                        </h2>
                        <p className="small text-muted mb-0">
                            Shows revenue generated by clinicians from services rendered, not commission payments to clinicians.
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <DateFilterReusable
                            value={dateFilter}
                            onChange={setDateFilter}
                            onDateRangeChange={(newStartDate, newEndDate) => {
                                setStartDate(newStartDate);
                                setEndDate(newEndDate);
                                if (employeeid) {
                                    fetchData(newStartDate, newEndDate, employeeid);
                                }
                            }}
                            label="Filter by"
                            className="w-auto"
                        />
                        <button onClick={handleLoadData} className="btn btn-sm btn-primary d-flex align-items-center" type="button" aria-label="Load data" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <RiPlayLine size={16} className="me-1" /> Load
                        </button>
                        <button onClick={handleResetFilters} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" aria-label="Reset date filters" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                            <RiRefreshLine size={16} className="me-1" /> Reset
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 p-md-4">
                {error && data.length > 0 && (
                    <div className="alert alert-light-warning border-warning border-opacity-50 border-start-0 border-end-0 border-bottom-0 rounded-0 d-flex align-items-center small p-2 mb-3" role="alert" style={{ borderTopWidth: '3px' }}>
                        <span>⚠️</span> {error}
                        <button type="button" className="btn-close ms-auto p-2" onClick={() => setError(null)} aria-label="Close" style={{ fontSize: '0.7rem' }}></button>
                    </div>
                )}
                {renderChartContent()}
            </div>
        </div>
    );
}