"use client";

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import styles from '../../app/billing/sales/branches/[branchid]/day-transaction-break-down/FinancialSummary.module.css';
import {
    RiBuildingLine,
    RiWalletLine,
    RiLineChartLine,
    RiHandCoinLine,
    RiBankCardLine,
    RiCashLine,
    RiTestTubeLine,
} from '@remixicon/react';
import { currencyFormatter } from '../Auth/customFetch';

interface BranchData {
    branchid: number;
    earned_revenue: string;
    cash_collected: string;
    discount: string;
    outstanding: string;
    total_tests: number;
    total_refunded: string;
    branchname: string;
}

interface ModeData {
    mode: string;
    total_transactions: number;
    total_amount: string;
}

interface DailySnapshot {
    gross_revenue: string;
    cash_collected: string;
    earned_revenue: string;
    discount: string;
    outstanding: string;
    total_refunded: string;
    expenses_paid: string;
    total_tests_conducted: number;
    net_operating_cash: string;
}

interface FinancialChartsProps {
    branchesData: BranchData[];
    modesData: ModeData[];
    dailySnapshot?: DailySnapshot;
}


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.card} style={{ padding: '0.75rem' }}>
                <p className="label">{`${label} : ${currencyFormatter.format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const StatCard = ({ label, value, icon, color = '#2563eb' }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) => (
    <div className={styles.card} style={{ padding: '1rem', borderLeft: `4px solid ${color}` }}>
        <div className="d-flex align-items-center gap-3">
            <div style={{ color, fontSize: '1.5rem', opacity: 0.8 }}>
                {icon}
            </div>
            <div>
                <p className="text-muted small mb-0">{label}</p>
                <h3 className="h5 mb-0 fw-bold">{value}</h3>
            </div>
        </div>
    </div>
);

export function CEODailySnapshot({ data }: { data: DailySnapshot }) {
    return (
        <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Gross Revenue" value={currencyFormatter.format(Number(data.gross_revenue))} icon={<RiLineChartLine />} color="#0088FE" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Cash Collected" value={currencyFormatter.format(Number(data.cash_collected))} icon={<RiHandCoinLine />} color="#00C49F" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Earned Revenue" value={currencyFormatter.format(Number(data.earned_revenue))} icon={<RiLineChartLine />} color="#FFBB28" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Net Operating Cash" value={currencyFormatter.format(Number(data.net_operating_cash))} icon={<RiCashLine />} color="#FF8042" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Outstanding" value={currencyFormatter.format(Number(data.outstanding))} icon={<RiBankCardLine />} color="#AF19FF" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Total Refunded" value={currencyFormatter.format(Number(data.total_refunded))} icon={<RiCashLine />} color="#FF1943" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Expenses Paid" value={currencyFormatter.format(Number(data.expenses_paid))} icon={<RiHandCoinLine />} color="#dc2626" />
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <StatCard label="Tests Conducted" value={data.total_tests_conducted} icon={<RiTestTubeLine />} color="#2563eb" />
            </div>
        </div>
    );
}

export function CEOFinancialCharts({ branchesData, modesData }: FinancialChartsProps) {
    const processedBranchData = useMemo(() =>
        branchesData.map(branch => ({
            ...branch,
            revenue: parseFloat(branch.earned_revenue),
        })), [branchesData]);

    const processedModesData = useMemo(() =>
        modesData.map(mode => ({
            ...mode,
            value: parseFloat(mode.total_amount),
            name: mode.mode,
        })), [modesData]);

    return (
        <div className={styles.statsGrid}>
            {processedBranchData.length > 0 && (
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        <RiBuildingLine />
                        Top Performing Branches
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={processedBranchData}
                            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="branchname" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => currencyFormatter.format(value)}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(237, 242, 247, 0.5)' }} />
                            <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </section>
            )}

            {processedModesData.length > 0 && (
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        <RiWalletLine />
                        Payment Mode Breakdown
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={processedModesData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {processedModesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </section>
            )}
        </div>
    );
}