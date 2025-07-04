"use client";
import React, { useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import { billingSource } from '../../../../../lib/billingLib';
import Select from 'react-select';
import { RiHealthBookLine, RiArrowRightLine, RiListCheck, RiUser3Line, RiBuildingLine } from '@remixicon/react';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';

interface BillingOption {
    value: number;
    label: string;
}

export default function BillingTypeSelection() {
    const [selectedBillingSource, setSelectedBillingSource] = useState<BillingOption | null>(null);
    const router = useRouter();
    const patientid = useParams()?.patientid;
    const branchid = useApplication().branchid;
    const employeeid = useApplication().user.employeeid;

    const options = billingSource.map(source => ({
        value: source.value,
        label: source.label
    }));

    // Custom label rendering for react-select (icon + label)
    const formatOptionLabel = (option: BillingOption) => (
        <span className="d-flex align-items-center gap-2">
            {option.label.toLowerCase().includes('corporate') ? <RiBuildingLine size={18} className="text-info" /> :
                option.label.toLowerCase().includes('private') ? <RiUser3Line size={18} className="text-success" /> :
                <RiListCheck size={18} className="text-primary" />}
            <span>{option.label}</span>
        </span>
    );

    const handleGenerateBillingId = async () => {
        const currentdate = new Date();
        const year = currentdate.getFullYear();
        const day = currentdate.getDate().toString().padStart(2, '0');
        const month = (currentdate.getMonth() + 1).toString().padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const response: { status: boolean } = await customFetch(`billing/sales/session/verify/session?branchid=${branchid}&&employeeid=${employeeid}&&sessiondate=${date}`);
        const { status } = response;
        if (status && status == true) {
            if (selectedBillingSource?.value && patientid) {
                // Get current URL search params
                const searchParams = new URLSearchParams(window.location.search);
                const billingid = searchParams.get('billingid');
                const isNewTransaction = searchParams.get('isNewTransaction');
                const isRelatedBilling = searchParams.get('isRelatedBilling');
                let url = `/billing/patientid/${patientid}/multi/${selectedBillingSource.value}`;
                // If any of the params exist, append them
                const paramsArr: string[] = [];
                if (billingid) paramsArr.push(`billingid=${billingid}`);
                if (isNewTransaction) paramsArr.push(`isNewTransaction=${isNewTransaction}`);
                if (isRelatedBilling) paramsArr.push(`isRelatedBilling=${isRelatedBilling}`);
                // Only add adjustmentReason and adjustmentType if present in the current query
                const adjustmentReason = searchParams.get('adjustmentReason');
                const adjustmentType = searchParams.get('adjustmentType');
                if (adjustmentReason) paramsArr.push(`adjustmentReason=${adjustmentReason}`);
                if (adjustmentType) paramsArr.push(`adjustmentType=${adjustmentType}`);
                if (paramsArr.length > 0) {
                    url += `?${paramsArr.join('&')}`;
                }
                router.push(url);
            }
        } else {
            toast.error("Sales Session Not Found.Kindly Create session to continue ");
        }
    };

    const customStyles = {
        control: (base: any) => ({
            ...base,
            minHeight: 42,
            borderColor: '#dee2e6',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#0d6efd'
            }
        }),
        option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
            ...base,
            backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#f8f9fa' : 'white',
            fontSize: 14,
            padding: '8px 12px'
        }),
        placeholder: (base: any) => ({
            ...base,
            fontSize: 14
        }),
        singleValue: (base: any) => ({
            ...base,
            fontSize: 14
        })
    };

    return (
        <Container className="py-5 d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 480 }}>
            <Card className="shadow border-0 w-100" style={{ maxWidth: 420 }}>
                <Card.Body className="p-4">
                    <div className="text-center mb-4">
                        <RiHealthBookLine size={32} className="text-primary mb-2" />
                        <h5 className="fw-bold mb-1">Select Billing Source</h5>
                        <div className="text-secondary small">Choose the type of billing you want to initiate for this patient.</div>
                    </div>
                    <div className="mb-4">
                        <Select
                            options={options}
                            value={selectedBillingSource}
                            onChange={(option) => setSelectedBillingSource(option)}
                            styles={customStyles}
                            placeholder="Choose billing source..."
                            isSearchable={false}
                            className="mb-2"
                            formatOptionLabel={formatOptionLabel}
                        />
                    </div>
                    <button
                        className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center shadow-sm"
                        onClick={handleGenerateBillingId}
                        disabled={!selectedBillingSource}
                        style={{ fontSize: 15, padding: '0.75rem', borderRadius: 6, fontWeight: 600 }}
                    >
                        Continue
                        <RiArrowRightLine size={18} className="ms-2" />
                    </button>
                </Card.Body>
            </Card>
        </Container>
    );
}
