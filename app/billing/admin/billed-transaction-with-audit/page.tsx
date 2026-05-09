"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { RiBillLine, RiMoneyDollarCircleLine, RiServiceLine, RiHistoryLine, RiTimeLine } from '@remixicon/react';
import { Badge, Row, Col, Card, ListGroup, Table, Button, Collapse } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { formatDate } from '../../../../components/HR/Payroll/utils';
import PrimeBreadcrumb from '../../../../components/accessories/PrimeBreadCrumb';
import PageHeader from '../../../../components/common/PageHeader';
import PreviewPatientInformation from '../../../../components/petientsComponent/PreviewPatientInformation';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface Billing {
    billingid: number;
    patientid: number;
    totalTransactionCost: string;
    totalcost: string;
    paid: string;
    payable: string;
    totalrefunded: string;
    discount: string;
    outstanding: string;
    balance: string;
    billedon: string;
    clientstatus: string;
    year: number;
    month: number;
    day: number;
    amountIncurredDueTax: string;
    lastupdated: string;
    branchid: number;
    isPromo: number;
    promoValue: string;
    promoMethod: string;
    promoCodeId: number;
    status: string;
    relatedBillingId: number | null;
    isAdjustment: number;
    adjustedBy: string | null;
    adjustmentReason: string | null;
    adjustmentType: string | null;
    islocked: number;
    adjustmentdate: string | null;
    adjustmentamount: string | null;
    additionalinformation: string | null;
    writeoff: string;
    lastupdatedby: number;
    surcharges: string;
    patient_firstname: string;
    patient_lastname: string;
    patient_middlename: string;
    patient_identifier: string;
    branch_name: string;
    last_updated_by_name: string | null;
}

interface Service {
    serviceid: number;
    billingid: number;
    trackId: number;
    cost: string;
    employeeid: number;
    serviceCategory: string;
    categoryTrackId: number;
    clinicianId: number | null;
    organizationId: number;
    registrationType: string;
    branchid: number;
    isoutsourced: number;
    outsourceid: number | null;
    serviceAddedOn: string;
    taxList: string | null;
    taxValue: string;
    amountIncurredDueTax: string;
    taxIncluded: number;
    discount: string;
    totalcost: string;
    totalpayable: string;
    isNHIS: number;
    isPHIS: number;
    insuranceid: number | null;
    claimCode: string | null;
    hasNightAdjustment: number;
    nightAdjustmentValue: string;
    nightAdjustmentMode: string;
    isPackageUsed: number;
    packageid: number | null;
    status: string;
    isRefunded: number;
    isLocked: number;
    isAdjustment: number;
    isCorrected: number | null;
    relatedbillingid: number | null;
    paidamount: string;
    paymentstatus: string;
    outstanding: string;
    outsourceprice: string;
    nhismembershipid: number;
    claimscheckcode: number;
    isDeleted: number | null;
    isDeletedBy: number | null;
    deletedAt: string | null;
    userAdjustmentType: string | null;
    userAdjustedValue: string | null;
    clinician_name: string | null;
    organization_name: string;
    additional_service_name: string | null;
    display_name: string | null;
    outsource_organization_name: string | null;
    outsource_status: string | null;
    outsource_comments: string | null;
}

interface PaymentHistory {
    KeyID: number;
    Billingid: number;
    Date: string;
    PaymentMode: number;
    Amount: string;
    employeeid: number;
    type: string;
    payment_mode_name: string;
    employee_name: string;
}

interface ChangeDetail {
    from: any;
    to: any;
}

interface AuditEntry {
    timestamp: string;
    action: string;
    actor: string | null;
    changes: Record<string, ChangeDetail>;
    entity_id: number;
    entity_type: string;
}

interface AuditTrail {
    billing_history: AuditEntry[];
    services_history: Record<string, AuditEntry[]>;
}

interface TransactionDetails {
    billing: Billing;
    services: Service[];
    payment_history: PaymentHistory[];
    audit_trail: AuditTrail;
}

export default function BilledTransactionWithAudit() {
    const searchParams = useSearchParams();
    const billingidParam = searchParams?.get('billingid') || '200';
    const { applicationsettings } = useApplicationSettings() || {};
    const employeeid = applicationsettings?.user?.employeeid || '3';
    const tenantId = applicationsettings?.tenantId || '3';

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<TransactionDetails | null>(null);
    const [expandedAudit, setExpandedAudit] = useState<Set<string>>(new Set());

    const formatValue = (field: string, value: any) => {
        if (value === null || value === undefined) return <span className="text-muted">N/A</span>;
        
        const currencyFields = [
            'totalTransactionCost', 'totalcost', 'paid', 'payable', 'totalpayable', 
            'totalrefunded', 'discount', 'outstanding', 'balance', 'writeoff', 
            'surcharges', 'cost', 'amountIncurredDueTax', 'paidamount', 'outsourceprice'
        ];
        
        const dateFields = ['billedon', 'lastupdated', 'timestamp', 'adjustmentdate', 'serviceAddedOn', 'deletedAt', 'approvalDate'];
        
        if (currencyFields.includes(field)) {
            const num = parseFloat(value);
            return isNaN(num) ? value : currencyFormatter.format(num);
        }
        
        if (dateFields.includes(field)) {
            try {
                return new Date(value).toLocaleString();
            } catch (e) {
                return value;
            }
        }
        
        if (typeof value === 'number' && (field.startsWith('is') || field === 'status')) {
            if (value === 1) return <Badge bg="success" className="fw-normal">Yes</Badge>;
            if (value === 0) return <Badge bg="secondary" className="fw-normal">No</Badge>;
        }

        return String(value);
    };

    const formatFieldLabel = (field: string) => {
        return field
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/_/g, ' ')         // Replace underscores with spaces
            .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
            .trim();
    };

    const toggleAudit = (id: string) => {
        setExpandedAudit(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const fetchTransactionDetails = async () => {
        setLoading(true);
        try {
            const endpoint = `billing/management/details/${billingidParam}?tenantId=${tenantId}&&employeeid=${employeeid}`;
            const response = await customFetch(endpoint);
            if (response && response.statusCode === 200) {
                setData(response.result);
            } else {
                toast.error(response?.message || 'Failed to retrieve transaction details');
            }
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            toast.error('An error occurred while fetching transaction details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (billingidParam) {
            fetchTransactionDetails();
        }
    }, [billingidParam]);

    const primeTableColumns = useMemo(() => {
        const serviceColumnsRaw = [
            'serviceid', 'billingid', 'trackId', 'cost', 'employeeid', 'serviceCategory', 
            'categoryTrackId', 'clinicianId', 'organizationId', 'registrationType', 
            'branchid', 'isoutsourced', 'outsourceid', 'serviceAddedOn', 'taxList', 
            'taxValue', 'amountIncurredDueTax', 'taxIncluded', 'discount', 'totalcost', 
            'totalpayable', 'isNHIS', 'isPHIS', 'insuranceid', 'claimCode', 
            'hasNightAdjustment', 'nightAdjustmentValue', 'nightAdjustmentMode', 
            'isPackageUsed', 'packageid', 'status', 'isRefunded', 'isLocked', 
            'isAdjustment', 'isCorrected', 'relatedbillingid', 'paidamount', 
            'paymentstatus', 'outstanding', 'outsourceprice', 'nhismembershipid', 
            'claimscheckcode', 'isDeleted', 'isDeletedBy', 'deletedAt', 
            'userAdjustmentType', 'userAdjustedValue', 'clinician_name', 
            'organization_name', 'additional_service_name', 'display_name',
            'outsource_organization_name', 'outsource_status', 'outsource_comments'
        ];
        return serviceColumnsRaw.map(col => ({
            Header: col,
            accessor: col,
            Cell: ({ value }: { value: any }) => formatValue(col, value)
        }));
    }, []);

    const paymentColumns = useMemo(() => [
        { Header: 'Date', accessor: 'Date', Cell: ({ value }: { value: any }) => formatDate(value) },
        { 
            Header: 'Mode', 
            accessor: 'payment_mode_name', 
            Cell: ({ value }: { value: any }) => (
                <Badge bg="info" className="fw-normal">{value}</Badge>
            )
        },
        { 
            Header: 'Amount', 
            accessor: 'Amount', 
            Cell: ({ value }: { value: any }) => (
                <span className="fw-bold">{currencyFormatter.format(parseFloat(value))}</span>
            )
        }
    ], []);

    if (loading) return <Loader />;
    if (!data) return <div className="p-4 text-center">No transaction details found for Billing ID: {billingidParam}</div>;

    const { billing, services, payment_history, audit_trail } = data;

    const renderAuditEntry = (audit: AuditEntry, idx: number, type: 'billing' | 'service', id: string) => {
        const isExpanded = expandedAudit.has(`${type}-${id}-${idx}`);
        const changedFields = Object.entries(audit.changes).filter(([_, detail]) => {
            return JSON.stringify(detail.from) !== JSON.stringify(detail.to);
        });

        return (
            <div key={`${type}-${id}-${idx}`} className="mb-4 position-relative">
                {/* Timeline Dot */}
                <div
                    style={{
                        position: 'absolute',
                        left: '-28px',
                        top: '8px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: audit.action === 'INSERT' ? '#198754' : '#0d6efd',
                        border: '3px solid white',
                        zIndex: 1
                    }}
                />

                <div className="bg-white border rounded p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <Badge bg={audit.action === 'INSERT' ? 'success' : 'primary'} className="text-uppercase">
                                    {audit.action}
                                </Badge>
                                <h6 className="mb-0 fw-bold">
                                    {type === 'billing' ? 'Billing Update' : `Service #${id} Update`}
                                </h6>
                            </div>
                            <small className="text-muted d-flex align-items-center">
                                <RiTimeLine size={14} className="me-1" />
                                {new Date(audit.timestamp).toLocaleString()} by <span className="fw-semibold ms-1">{audit.actor || 'System'}</span>
                            </small>
                        </div>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleAudit(`${type}-${id}-${idx}`)}
                            className="text-decoration-none p-0"
                        >
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </Button>
                    </div>

                    <p className="mb-2 small text-muted">
                        {audit.action === 'INSERT' ? 'New record created.' : 'Record information has been updated.'}
                    </p>

                    <Collapse in={isExpanded}>
                        <div className="mt-3">
                            {changedFields.length > 0 ? (
                                <Table responsive size="sm" bordered hover className="mb-0 small audit-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: '30%' }}>Field</th>
                                            <th style={{ width: '35%' }}>Old Value</th>
                                            <th style={{ width: '35%' }}>New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {changedFields.map(([field, detail]) => (
                                            <tr key={field}>
                                                <td className="fw-semibold text-secondary">{formatFieldLabel(field)}</td>
                                                <td style={{ backgroundColor: 'rgba(255, 182, 193, 0.1)' }} className="text-muted">
                                                    {formatValue(field, detail.from)}
                                                </td>
                                                <td style={{ backgroundColor: 'rgba(144, 238, 144, 0.1)' }} className="fw-semibold text-primary">
                                                    {formatValue(field, detail.to)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-muted small italic mb-0">No field changes recorded</p>
                            )}
                        </div>
                    </Collapse>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4">
            <PrimeBreadcrumb
                links={[
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: '/billing/admin', label: 'Billing Admin' },
                    { href: '#', label: 'Transaction Audit' }
                ]}
            />

            <PageHeader
                title="Transaction Details & Audit"
                subtitle={`Billing ID: #${billing.billingid} | Patient: ${billing.patient_firstname} ${billing.patient_lastname}`}
                actions={
                    <Badge bg={billing.status === 'paid' ? 'success' : 'warning'} className="text-uppercase p-2 fs-6">
                        {billing.status}
                    </Badge>
                }
            />

            <div className="mb-4">
                <PreviewPatientInformation patientid={billing.patientid} compact />
            </div>

            <Row>
                <Col lg={6}>
                    <Card className="mb-4 shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3 d-flex align-items-center">
                            <RiBillLine className="me-2 text-primary" /> Billing Summary
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="px-0 d-flex justify-content-between">
                                    <span className="text-muted">Billing ID:</span>
                                    <span className="fw-bold">#{billing.billingid}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between">
                                    <span className="text-muted">Billed On:</span>
                                    <span>{formatDate(billing.billedon)}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between">
                                    <span className="text-muted">Branch:</span>
                                    <span>{billing.branch_name}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between mt-3 pt-3 border-top">
                                    <span className="text-muted">Total Cost:</span>
                                    <span className="fw-bold text-primary">{currencyFormatter.format(parseFloat(billing.totalcost))}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between">
                                    <span className="text-muted">Paid:</span>
                                    <span className="fw-bold text-success">{currencyFormatter.format(parseFloat(billing.paid))}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between">
                                    <span className="text-muted">Outstanding:</span>
                                    <span className="fw-bold text-danger">{currencyFormatter.format(parseFloat(billing.outstanding))}</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="mb-4 shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3 d-flex align-items-center">
                            <RiMoneyDollarCircleLine className="me-2 text-success" /> Payment History
                        </Card.Header>
                        <Card.Body className="p-0">
                            <PrimeTable 
                                column={paymentColumns} 
                                data={payment_history || []} 
                                filtering={false}
                                serverSideFiltering={false}
                                handleSeverSideProcessing={null}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-2">
                <Col lg={12}>
                    <Card className="mb-4 shadow-sm border-0">
                        <Card.Header className="bg-white fw-bold py-3 d-flex align-items-center">
                            <RiServiceLine className="me-2 text-info" /> Detailed Services Summary
                        </Card.Header>
                        <Card.Body className="p-0">
                            <PrimeTable 
                                column={primeTableColumns || []} 
                                data={services || []} 
                                filtering={true} 
                                isExpoerted={true}
                                serverSideFiltering={false}
                                handleSeverSideProcessing={null}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-2">
                <Col lg={12}>
                    <h4 className="mt-4 mb-4 d-flex align-items-center">
                        <RiHistoryLine className="me-2 text-info" /> Detailed Audit Trail
                    </h4>

                    <div className="position-relative ms-4" style={{ paddingLeft: '40px' }}>
                        {/* Timeline Line */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '20px',
                                top: '0',
                                bottom: '0',
                                width: '2px',
                                background: 'linear-gradient(to bottom, #dee2e6 0%, #dee2e6 100%)'
                            }}
                        />

                        {/* Billing History Section */}
                        {audit_trail.billing_history.map((audit, idx) => 
                            renderAuditEntry(audit, idx, 'billing', billing.billingid.toString())
                        )}

                        {/* Services History Section */}
                        {Object.entries(audit_trail.services_history).map(([serviceId, history]) => 
                            history.map((audit, aIdx) => 
                                renderAuditEntry(audit, aIdx, 'service', serviceId)
                            )
                        )}
                    </div>
                </Col>
            </Row>

            <style jsx>{`
                .extra-small {
                    font-size: 0.75rem;
                }
                .audit-table th {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .audit-table td {
                    vertical-align: middle;
                }
            `}</style>
        </div>
    );
}
