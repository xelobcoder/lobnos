'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import NewInsuranceCompanyForm from '../../components/insurance/NewInsuranceCompanyForm';
import { Add } from '@mui/icons-material';
import PrimeTable from '../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../components/Auth/customFetch';
import Loader from '../../components/accessories/Loader'

const InsurancePage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [insurances, setInsurances] = useState<any[]>([]);
    const [reload, setReload] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInsurances, setSelectedInsurances] = useState<Set<number>>(new Set());

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

    const handleShow = () => setShowModal(true);
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
        { Header: 'Insurance Name', accessor: 'insuranceName' },
        { Header: 'Insurance Code', accessor: 'insuranceCode' },
        { Header: 'Insurance Type', accessor: 'insuranceType' },
        { Header: 'Search Code', accessor: 'searchCode' },
        { Header: 'Network', accessor: 'network' },
        { Header: 'Tags', accessor: 'tags' },
        { Header: 'Mailing Address', accessor: 'mailingAddress' },
        { Header: 'City', accessor: 'city' },
        { Header: 'State', accessor: 'state' },
        { Header: 'County', accessor: 'county' },
        { Header: 'Zip Code', accessor: 'zipCode' },
        { Header: 'Comments', accessor: 'comments' },
    ];

    const handleSeverSideProcessing = async (pagination) => {
        const { page = 1, count = 10 } = pagination;
        setIsLoading(true);
        try {
            const response = await customFetch(`insurances?page=${page}&&count=${count}`);
            setIsLoading(false)
            if (response && Array.isArray(response) && response.length > 0) {
                return { result: response, error: false };
            } else {
                return { result: [], error: false };
            }
        } catch (error) {
            console.error('Error fetching insurances:', error);
            setIsLoading(false)
            return { result: [], error: false };
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) <Loader w={20} h={20} />

    return (
        <div>
            <div className='d-flex justify-content-end'>
                <Button variant="primary" className='btn-sm' onClick={handleShow}>
                    <Add /> Add Insurance
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
                    <NewInsuranceCompanyForm onSubmit={handleAddInsurance} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default InsurancePage;
