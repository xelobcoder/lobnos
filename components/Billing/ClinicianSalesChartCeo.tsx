"use client";

import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
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
            <div className="rounded-lg border p-2 shadow-sm"
                style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)', minWidth: '220px', fontSize: '0.8rem' }}>
                <div className="mb-2">
                    <span className="text-xs uppercase fw-medium" style={{ color: 'var(--bs-secondary-color)' }}>Clinician</span>
                    <span className="fw-bold d-block" style={{ color: 'var(--bs-body-color)' }}>{label}</span>
                </div>
                <div className="mb-1">
                    <span className="text-xs uppercase fw-medium" style={{ color: 'var(--bs-secondary-color)' }}>Total Sales</span>
                    <span className="fw-bold d-block" style={{ color: 'oklch(0.646 0.222 41.116)' }}>
                        {fullCurrencyFormatter(data.total_value)}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="text-xs uppercase fw-medium" style={{ color: 'var(--bs-secondary-color)' }}>Total Services</span>
                    <span className="fw-bold d-block" style={{ color: 'var(--bs-body-color)' }}>
                        {data.total_services}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="text-xs uppercase fw-medium" style={{ color: 'var(--bs-secondary-color)' }}>Test Panels</span>
                    <span className="fw-bold d-block" style={{ color: 'var(--bs-body-color)' }}>
                        {data.test_panels_count}
                    </span>
                </div>
                <div className="mb-0">
                    <span className="text-xs uppercase fw-medium" style={{ color: 'var(--bs-secondary-color)' }}>Additional Services</span>
                    <span className="fw-bold d-block" style={{ color: 'var(--bs-body-color)' }}>
                        {data.additional_services_count}
                    </span>
                </div>
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
            <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                    <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                        <RiUserHeartLine className="me-2" size={20} style={{ color: 'oklch(0.646 0.222 41.116)' }} />
                        Clinician Sales Performance
                    </h2>
                </div>
                <div className="p-3">
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '200px' }}>
                        <RiUserHeartLine size={48} className="mb-3 text-muted" />
                        <h5 className="fw-medium mb-1">No Data Available</h5>
                        <p className="text-muted px-3">No clinician sales data available for this period.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    <RiUserHeartLine className="me-2" size={20} style={{ color: 'oklch(0.646 0.222 41.116)' }} />
                    Clinician Sales Performance
                </h2>
            </div>
            <div className="p-3">
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <div className="table-responsive">
                            <table className="table table-sm table-hover table-striped small">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Clinician</th>
                                        <th className="text-end">Total Sales</th>
                                        <th className="text-end">Total Services</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregatedData.map((clinician) => (
                                        <tr key={clinician.clinician_id}>
                                            <td className="text-start">
                                                <div>{clinician.clinician_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--bs-secondary-color)' }}>
                                                    {clinician.occupation || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="text-end">{fullCurrencyFormatter(clinician.total_value)}</td>
                                            <td className="text-end">{clinician.total_services}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={aggregatedData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--bs-border-color-translucent)" />
                                <XAxis dataKey="clinician_name" tickLine={false} axisLine={false} stroke="var(--bs-secondary-color)" fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} stroke="var(--bs-secondary-color)" fontSize={12} tickFormatter={compactCurrencyFormatter} />
                                <Tooltip cursor={{ fill: 'var(--bs-tertiary-bg)' }} content={<ChartTooltip />} />
                                <Bar dataKey="total_value" fill="oklch(0.646 0.222 41.116)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}