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
import { RiBuildingLine, RiWalletLine } from '@remixicon/react';
import { currencyFormatter } from '../Auth/customFetch';

interface BranchData {
    branchid: number;
    accrued_revenue: string;
    actual_revenue: string;
    total_discount: string;
    total_outstanding: string;
    total_tests: number;
    total_refunds: string;
    branchname: string;
}

interface ModeData {
    mode: string;
    total_transactions: number;
    total_amount: string;
}

interface FinancialChartsProps {
    branchesData: BranchData[];
    modesData: ModeData[];
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

export function CEOFinancialCharts({ branchesData, modesData }: FinancialChartsProps) {
    const processedBranchData = useMemo(() =>
        branchesData.map(branch => ({
            ...branch,
            revenue: parseFloat(branch.actual_revenue),
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