"use client";
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useRouter } from 'next/navigation';
import { billingSource } from '../../../../../lib/billingLib';
import Select from 'react-select';
import { RiHealthBookLine, RiArrowRightLine } from '@remixicon/react';
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
                router.push(`/billing/patientid/${patientid}/multi/${selectedBillingSource.value}`);
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
        <Container className="py-4" style={{ maxWidth: 420 }}>
            <h6 className="text-center mb-3 fw-semibold d-flex align-items-center justify-content-center">
                <RiHealthBookLine size={18} className="me-2 text-primary" />
                Select Billing Source
            </h6>

            <Select
                options={options}
                value={selectedBillingSource}
                onChange={(option) => setSelectedBillingSource(option)}
                styles={customStyles}
                placeholder="Choose billing source..."
                isSearchable={false}
                className="mb-3"
            />

            <button
                className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                onClick={handleGenerateBillingId}
                disabled={!selectedBillingSource}
                style={{
                    fontSize: 14,
                    padding: '0.5rem',
                    borderRadius: 4
                }}
            >
                Continue
                <RiArrowRightLine size={16} className="ms-2" />
            </button>
        </Container>
    );
}
