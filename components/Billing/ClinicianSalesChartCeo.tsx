"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from '../../app/billing/sales/branches/[branchid]/day-transaction-break-down/FinancialSummary.module.css';
import { RiUserHeartLine } from '@remixicon/react';

interface ClinicianSale {
    sale_date: string;
    clinician_id: number;
    clinician_name: string;
    clinician_phone: string;
    occupation: string;
    organization: number;
    total_services: number;
    total_value: string;
    additional_services_count: string;
    test_panels_count: string;
}

interface AggregatedClinicianData {
    clinician_id: number;
    clinician_name: string;
    occupation: string;
    total_value: number;
    total_services: number;
    test_panels_count: number;
    additional_services_count: number;
}

interface ClinicianSalesProps {
    data: ClinicianSale[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const compactCurrencyFormatter = (value: number) => new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    notation: 'compact'
}).format(value);

const fullCurrencyFormatter = (value: number) => new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
}).format(value);

const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className={styles.chartTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>
                    {fullCurrencyFormatter(data.total_value)}
                </p>
                <p className={styles.tooltipDetail}>Total Services: {data.total_services}</p>
                <p className={styles.tooltipDetail}>Test Panels: {data.test_panels_count}</p>
                <p className={styles.tooltipDetail}>Additional Services: {data.additional_services_count}</p>
            </div>
        );
    }
    return null;
};

export function CeoClinicianSalesChart({ data }: ClinicianSalesProps) {
    const aggregatedData = useMemo(() => {
        const clinicianMap = new Map<string, AggregatedClinicianData>();

        data.forEach(sale => {
            const existing = clinicianMap.get(sale.clinician_name);
            if (existing) {
                existing.total_value += parseFloat(sale.total_value);
                existing.total_services += sale.total_services;
                existing.test_panels_count += parseInt(sale.test_panels_count, 10);
                existing.additional_services_count += parseInt(sale.additional_services_count, 10);
            } else {
                clinicianMap.set(sale.clinician_name, {
                    clinician_id: sale.clinician_id,
                    clinician_name: sale.clinician_name,
                    occupation: sale.occupation,
                    total_value: parseFloat(sale.total_value),
                    total_services: sale.total_services,
                    test_panels_count: parseInt(sale.test_panels_count, 10),
                    additional_services_count: parseInt(sale.additional_services_count, 10),
                });
            }
        });

        return Array.from(clinicianMap.values()).sort((a, b) => b.total_value - a.total_value);
    }, [data]);

    if (!aggregatedData || aggregatedData.length === 0) {
        return (
            <section className={styles.chartCard}>
                <h2 className={styles.cardTitle}>
                    <RiUserHeartLine />
                    Clinician Sales Performance
                </h2>
                <p>No clinician sales data available for this period.</p>
            </section>
        );
    }

    return (
        <section className={styles.chartCard} style={{ backgroundColor: 'white' ,padding:'10px'}}>
            <h2 className={styles.cardTitle}>
                <RiUserHeartLine />
                Clinician Sales Performance
            </h2>
            <div className={styles.chartGrid}>
                <div className={styles.tableContainer} style={{ gridColumn: 'span 1', marginBottom: '1.5rem' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Clinician</th>
                                <th className={styles.th}>Total Sales</th>
                                <th className={styles.th}>Total Services</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aggregatedData.map((clinician) => (
                                <tr key={clinician.clinician_id}>
                                    <td className={styles.td}>
                                        <div>{clinician.clinician_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {clinician.occupation || 'N/A'}
                                        </div>
                                    </td>
                                    <td className={styles.td}>{fullCurrencyFormatter(clinician.total_value)}</td>
                                    <td className={styles.td}>{clinician.total_services}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aggregatedData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(240 3.7% 15.9% / 0.1)" />
                        <XAxis dataKey="clinician_name" tickLine={false} axisLine={false} stroke="hsl(240 3.8% 46.1%)" fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} stroke="hsl(240 3.8% 46.1%)" fontSize={12} tickFormatter={compactCurrencyFormatter} />
                        <Tooltip cursor={{ fill: "hsl(240 3.7% 15.9% / 0.1)" }} content={<ChartTooltip />} />
                        <Bar dataKey="total_value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}