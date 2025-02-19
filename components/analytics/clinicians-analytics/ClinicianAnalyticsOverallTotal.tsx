"use client"
import React, { useEffect, useState } from 'react';
import { currencyFormatter, customFetch } from '../../Auth/customFetch';
import { Card, Row, Col, Container } from 'react-bootstrap';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalculateIcon from '@mui/icons-material/Calculate';

interface AnalyticsData {
    total_rows: number;
    total_cost: string;
    payable: string;
    amountIncurredDueTax: string;
}

interface ClinicianOverallAnalyticsProps {
    clinicianId: number;
    analyticsData: AnalyticsData
}

const ClinicianOverallAnalytics: React.FC<ClinicianOverallAnalyticsProps> = ({ clinicianId, analyticsData }) => {
    const [error, setError] = useState<string | null>(null);

    if (error) return (
        <div className="p-4 bg-danger-subtle text-danger rounded">
            Error: {error}
        </div>
    );

    const cardColors = {
        cases: { bg: '#ECF2FF', icon: '#3B82F6' },
        cost: { bg: '#E8FDF5', icon: '#10B981' },
        payable: { bg: '#FFF4ED', icon: '#F97316' },
        tax: { bg: '#FFF1F2', icon: '#E11D48' }
    };

    const AnalyticCard = ({
        title,
        value,
        Icon,
        bgColor,
        iconColor,
        formatAsCurrency = true
    }: {
        title: string;
        value: string | number;
        Icon: React.ElementType;
        bgColor: string;
        iconColor: string;
        formatAsCurrency?: boolean;
    }) => (
        <Card
            className="h-100 border-0"
            style={{
                background: bgColor,
                borderRadius: '12px',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                height: '89px', // Reduced by 1/3 from 133px
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'; // Reduced from 5px
                e.currentTarget.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)'; // Reduced shadow
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <Card.Body className="p-2"> {/* Reduced padding */}
                <div className="d-flex justify-content-between align-items-center mb-1"> {/* Reduced margin */}
                    <div
                        style={{
                            backgroundColor: iconColor,
                            padding: '5px', // Reduced from 8px
                            borderRadius: '8px', // Reduced from 10px
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon style={{ fontSize: '1rem', color: 'white' }} /> {/* Reduced from 1.5rem */}
                    </div>
                    <h6 className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{title}</h6> {/* Reduced from default size */}
                </div>
                <div style={{ fontSize: '1.25rem' }} className="fw-bold"> {/* Reduced from fs-3 */}
                    {formatAsCurrency ? currencyFormatter.format(Number(value) || 0) : value}
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="mb-3"> {/* Reduced margin */}
            <h2 className="fs-4 fw-bold mb-3 pls-label bg-secondary-subtle p-2 br-5 col-4">Clinician Summary</h2> {/* Reduced size and padding */}
            {analyticsData && (
                <Row xs={1} md={2} lg={4} className="g-3"> {/* Reduced gap */}
                    <Col>
                        <AnalyticCard
                            title="Total Cases"
                            value={analyticsData.total_rows}
                            Icon={PeopleAltIcon}
                            bgColor={cardColors.cases.bg}
                            iconColor={cardColors.cases.icon}
                            formatAsCurrency={false}
                        />
                    </Col>
                    <Col>
                        <AnalyticCard
                            title="Total Cost"
                            value={analyticsData.total_cost}
                            Icon={AttachMoneyIcon}
                            bgColor={cardColors.cost.bg}
                            iconColor={cardColors.cost.icon}
                        />
                    </Col>
                    <Col>
                        <AnalyticCard
                            title="Total Payable"
                            value={analyticsData.payable}
                            Icon={ReceiptIcon}
                            bgColor={cardColors.payable.bg}
                            iconColor={cardColors.payable.icon}
                        />
                    </Col>
                    <Col>
                        <AnalyticCard
                            title="Tax Amount"
                            value={analyticsData.amountIncurredDueTax}
                            Icon={CalculateIcon}
                            bgColor={cardColors.tax.bg}
                            iconColor={cardColors.tax.icon}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default ClinicianOverallAnalytics;