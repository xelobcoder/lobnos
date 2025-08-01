'use client'
import React from 'react';
import { currencyFormatter } from '../../Auth/customFetch';
import { RiTeamLine, RiMoneyDollarCircleLine, RiBillLine, RiCalculatorLine, RiErrorWarningLine } from '@remixicon/react';

interface AnalyticsData {
    total_rows: number;
    total_cost: string;
    payable: string;
    amountIncurredDueTax: string;
}

interface ClinicianOverallAnalyticsProps {
    clinicianId: number; // Maintained for prop consistency
    analyticsData: AnalyticsData | null | undefined;
}

type CardVariant = 'primary' | 'success' | 'warning' | 'danger';

interface AnalyticCardProps {
    title: string;
    value: string | number;
    Icon: React.ElementType;
    variant: CardVariant;
    formatAsCurrency?: boolean;
}

const ICON_SIZE = 22;

const AnalyticCard: React.FC<AnalyticCardProps> = ({
    title,
    value,
    Icon,
    variant,
    formatAsCurrency = true
}) => {
    // Map variant to Bootstrap classes
    const bgSubtleClass = `bg-${variant}-subtle`;
    const textClass = `text-${variant}`;
    const borderClass = `border-${variant}`;
    // Custom accent color for border and icon background
    const accentGradients: Record<CardVariant, string> = {
        primary: 'linear-gradient(135deg, oklch(0.646 0.222 41.116) 0%, oklch(0.7 0.15 41.116) 100%)',
        success: 'linear-gradient(135deg, oklch(0.4 0.18 140) 0%, oklch(0.6 0.18 140) 100%)',
        warning: 'linear-gradient(135deg, oklch(0.68 0.22 15) 0%, oklch(0.72 0.18 15) 100%)',
        danger: 'linear-gradient(135deg, oklch(0.7 0.18 20) 0%, oklch(0.8 0.18 20) 100%)',
    };
    return (
        <div
            className={`card h-100 shadow-sm border-0 border-top ${borderClass} analytic-card-hover`}
            style={{
                borderTopWidth: 5,
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #fff 80%, #f8f9fa 100%)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                minHeight: 170
            }}
        >
            <div className="card-body d-flex flex-column p-3 p-lg-4">
                <div className="d-flex align-items-start mb-3">
                    <div
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle me-3 shadow-sm ${textClass}`}
                        style={{
                            width: '46px',
                            height: '46px',
                            flexShrink: 0,
                            background: accentGradients[variant],
                            boxShadow: `0 2px 8px ${variant === 'primary' ? 'oklch(0.646 0.222 41.116 / 0.18)' : '#00000018'}`
                        }}
                    >
                        <Icon size={ICON_SIZE} color="#fff" />
                    </div>
                    <h3 className="card-title h6 fw-medium text-body-secondary mb-0 pt-1">
                        {title}
                    </h3>
                </div>
                <div className={`h2 fw-bold mt-auto mb-0 ${textClass} lh-1`} style={{ fontSize: '1.45rem', letterSpacing: '0.01em' }}>
                    {formatAsCurrency ? (
                        <span title={String(value)}>{currencyFormatter.format(Number(value) || 0)}</span>
                    ) : (
                        <span title={String(value)}>{value}</span>
                    )}
                </div>
            </div>
            <style jsx>{`
                .analytic-card-hover:hover {
                    box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important;
                    transform: translateY(-3px) scale(1.015);
                    border-top-width: 6px !important;
                }
            `}</style>
        </div>
    );
};


const ClinicianOverallAnalytics: React.FC<ClinicianOverallAnalyticsProps> = ({ analyticsData }) => {

    if (!analyticsData) {
        return (
            <div className="container-fluid py-4">
                 <div className="card shadow-sm" style={{ borderRadius: '0.75rem' }}>
                    <div className="card-body text-center p-4 p-lg-5">
                        <RiErrorWarningLine size={40} className="mb-3 text-warning" />
                        <h5 className="card-title">Summary Data Unavailable</h5>
                        <p className="card-text text-muted">
                            Clinician financial summary data could not be loaded at this time. Please try again later.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container-fluid py-4 px-0 px-md-3"> {/* Responsive padding for the container */}
            <h2 className="fs-4 fw-semibold text-body-emphasis mb-4 px-2 px-md-0">
                Clinician Financial Overview
            </h2>
            <div className="row g-3 g-lg-4"> {/* Responsive gap */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Total Cases Managed"
                        value={analyticsData.total_rows}
                        Icon={RiTeamLine}
                        variant="primary"
                        formatAsCurrency={false}
                    />
                </div>
                {/* <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Total Service Cost"
                        value={analyticsData.total_cost}
                        Icon={RiMoneyDollarCircleLine}
                        variant="success"
                    />
                </div> */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Total Sales Made"
                        value={analyticsData.payable}
                        Icon={RiBillLine}
                        variant="warning"
                    />
                </div>
                {/* <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Withholding Tax (WHT)"
                        value={analyticsData.amountIncurredDueTax}
                        Icon={RiCalculatorLine}
                        variant="danger"
                    />
                </div> */}
            </div>
        </div>
    );
};

export default ClinicianOverallAnalytics;