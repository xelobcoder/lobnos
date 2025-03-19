import React, { useEffect, useState } from 'react';
import { Table, Alert, Spinner, Button } from 'react-bootstrap';
import { customFetch, customPost } from '../Auth/customFetch';
import { toast } from 'react-toastify';
import { Refresh } from '@mui/icons-material';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import PrimeTable from '../accessories/Datatables/PrimeTable';

export default function DrugsListPLSMASTER({ resetEditDrug, handleEditDrug, }) {
    const { applicationsettings } = useApplicationSettings();
    const { employeeid } = applicationsettings.user;
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const fetchDrugs = async () => {
        try {
            const response = await customFetch('drugs');
            setDrugs(response);
            setLoading(false);
        } catch (error) {
            setError('Failed to load drugs');
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchDrugs();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await customPost(`drugs?id=${id}&&employeeid=${employeeid}`, 'DELETE');
            const { status, message } = response;

            if (status) {
                setDrugs(drugs.filter(drug => drug.id !== id));
                toast.success(message);
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error('An error occurred while deleting the drug');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toDateString()
    };

    const columns = [{
        Header: 'Drug Name',
        accessor: 'drug',
    },
    {
        Header: 'Category',
        accessor: 'categoryName',
    },
    {
        Header: 'Created By',
        accessor: 'createdBy',
    },
    {
        Header: 'Added On',
        accessor: 'addedOn',
        Cell: ({ value }) => new Date(value).toDateString(),
    },
    {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ row }) => (
            <>
                <Button variant="warning" size="sm" onClick={() => handleEditDrug(row.original)}>
                    Edit
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(row.original.id)}>
                    Delete
                </Button>
            </>
        ),
    },]

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="p-3">
            <div className='d-flex justify-content-between'>
                <h5 className='mt-2'>Drug Categories</h5>
                <button
                    type='button'
                    onClick={fetchDrugs}
                    className='btn btn-outline-light bg-white text-primary border-2'>
                    <Refresh />
                </button>
            </div>
            <PrimeTable column={columns} data={drugs} serverSideFiltering={false} handleSeverSideProcessing={null} />
        </div>
    );
}
