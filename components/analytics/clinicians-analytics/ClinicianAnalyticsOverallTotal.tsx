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

    return (
        <div
            className={`card h-100 shadow-sm border-0 border-top-0 ${borderClass}`}
            style={{
                borderTopWidth: '4px !important', // Ensure top border thickness
                borderRadius: '0.75rem', // Bootstrap's rounded-lg is 0.5rem, this is a bit more
            }}
        >
            <div className="card-body d-flex flex-column p-3 p-lg-4"> {/* Responsive padding */}
                <div className="d-flex align-items-start mb-3">
                    <div
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle me-3 ${bgSubtleClass} ${textClass}`}
                        style={{
                            width: '44px', // Fixed size for icon container
                            height: '44px',
                            flexShrink: 0,
                        }}
                    >
                        <Icon size={ICON_SIZE} />
                    </div>
                    <h3 className="card-title h6 fw-medium text-body-secondary mb-0 pt-1">
                        {title}
                    </h3>
                </div>
                <div className={`h3 fw-bold mt-auto mb-0 ${textClass}`} style={{ fontSize: '1.75rem' }}> {/* Larger value */}
                    {formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value}
                </div>
            </div>
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
                <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Total Service Cost"
                        value={analyticsData.total_cost}
                        Icon={RiMoneyDollarCircleLine}
                        variant="success"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Net Amount Payable"
                        value={analyticsData.payable}
                        Icon={RiBillLine}
                        variant="warning"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <AnalyticCard
                        title="Withholding Tax (WHT)"
                        value={analyticsData.amountIncurredDueTax}
                        Icon={RiCalculatorLine}
                        variant="danger"
                    />
                </div>
            </div>
        </div>
    );
};

export default ClinicianOverallAnalytics;