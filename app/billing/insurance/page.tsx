'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Dropdown } from 'react-bootstrap';
import NewInsuranceCompanyForm from '../../../components/insurance/NewInsuranceCompanyForm';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import { 
    RiAddFill, 
    RiMore2Fill, 
    RiPriceTag3Line, 
    RiEditLine, 
    RiCloseCircleLine 
} from '@remixicon/react';
import { useRouter } from 'next/navigation';

const InsurancePage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [insurances, setInsurances] = useState<any[]>([]);
    const [reload, setReload] = useState(false);
    const [clinicianid, setClinicianid] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInsurances, setSelectedInsurances] = useState<Set<number>>(new Set());
    const router = useRouter();

    const fetchInsurances = async (pagination: { count: number, page: number }) => {
        const { page = 1, count = 10 } = pagination;
        setIsLoading(true);
        try {
            const response = await customFetch(`insurances?page=${page}&&count=${count}`);
            if (response && Array.isArray(response)) {
                setInsurances(response);
            }
        } catch (error) {
            console.error('Error fetching insurances:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsurances({ count: 10, page: 1 });
    }, []);

    const handleShow = () => {
        setShowModal(true);
        setClinicianid(null);
    }
    const handleClose = () => setShowModal(false);

    const handleAddInsurance = (data: any) => {
        setInsurances((prev) => [...prev, data]);
        handleClose();
    };

    const handleRowSelect = (index: number) => {
        setSelectedInsurances((prev) => {
            const updatedSelection = new Set(prev);
            if (updatedSelection.has(index)) {
                updatedSelection.delete(index);
            } else {
                updatedSelection.add(index);
            }
            return updatedSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedInsurances.size === insurances.length) {
            setSelectedInsurances(new Set());
        } else {
            const allIndexes = new Set(insurances.map((_, index) => index));
            setSelectedInsurances(allIndexes);
        }
    };



    const handlePricingRouter = (insurance: any) => {
        if (insurance && insurance.id) {
            router.push(`/billing/billing-strategy/insurance/${insurance.id}//check`);
        } else {
            console.error('Insurance ID is not available');
        }
    }

    const columns = [
        {
            Header: () => (
                <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedInsurances.size === insurances.length}
                />
            ),
            id: 'selectAll',
            Cell: ({ row }: any) => (
                <input
                    type="checkbox"
                    checked={selectedInsurances.has(row.index)}
                    onChange={() => handleRowSelect(row.index)}
                />
            ),
        },
        { Header: 'Name', accessor: 'insuranceName' },
        { Header: 'Code', accessor: 'insuranceCode' },
        { Header: 'Type', accessor: 'insuranceType' },
        { Header: 'Code', accessor: 'searchCode' },
        { Header: 'Network', accessor: 'network' },
        { Header: 'Tags', accessor: 'tags' },
        { Header: 'Mailing Address', accessor: 'mailingAddress' },
        { Header: 'City', accessor: 'city' },
        { Header: 'State', accessor: 'state' },
        { Header: 'County', accessor: 'county' },
        { Header: 'Zip Code', accessor: 'zipCode' },
        { Header: 'Comments', accessor: 'comments' },
        {
            Header: 'Actions',
            id: 'actions',
            Cell: ({ row }: any) => (
                <Dropdown>
                    <Dropdown.Toggle id="archives-dropdown" variant="light">
                        <RiMore2Fill />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item 
                            onClick={() => handlePricingRouter(row.original)}
                            className="d-flex align-items-center gap-2"
                        >
                            <RiPriceTag3Line size={18} />
                            <span>Create Pricing</span>
                        </Dropdown.Item>
                        <Dropdown.Item 
                            onClick={() => handleEditInsurance(row.original)}
                            className="d-flex align-items-center gap-2"
                        >
                            <RiEditLine size={18} />
                            <span>Edit</span>
                        </Dropdown.Item>
                        <Dropdown.Item 
                            onClick={() => handleDisableInsurance(row.index)}
                            className="d-flex align-items-center gap-2 text-danger"
                        >
                            <RiCloseCircleLine size={18} />
                            <span>Disable</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ];

    const handleSeverSideProcessing = async (pagination) => {
        const { page = 1, count = 10 } = pagination;
        try {
            const response = await customFetch(`insurances?page=${page}&&count=${count}`);
            if (response && Array.isArray(response) && response.length > 0) {
                return { result: response, error: false };
            } else {
                return { result: [], error: false };
            }
        } catch (error) {
            return { result: [], error: false };
        } finally {
        }
    };

    const handleEditInsurance = (row) => {
        setClinicianid(row.id || null);
        setShowModal(true);
    };

    const handleDisableInsurance = (index: number) => {
        console.log('Disable insurance at index', index);
    };

    if (isLoading) return <Loader w={20} h={20} />;

    return (
        <div>
            <div className='d-flex  justify-content-between'>
                <h4>  Insurance Master</h4>
                <Button variant="primary" className='btn-sm' onClick={handleShow}>
                    <RiAddFill />
                    Add Insurance
                </Button>
            </div>

            <PrimeTable
                filtering={false}
                column={columns}
                data={insurances}
                serverSideFiltering={true}
                handleSeverSideProcessing={handleSeverSideProcessing}
            />

            <Modal show={showModal} onHide={handleClose} size='lg' backdrop='static'>
                <Modal.Header closeButton className='bg-secondary-subtle'>
                    <h5>Add New Insurance</h5>
                </Modal.Header>
                <Modal.Body>
                    <NewInsuranceCompanyForm onSubmit={handleAddInsurance} clinicianid={clinicianid} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default InsurancePage;
