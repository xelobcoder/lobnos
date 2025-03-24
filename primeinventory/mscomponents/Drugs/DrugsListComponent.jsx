import React, { useEffect, useState } from 'react';
import { Table, Alert, Spinner, Button } from 'react-bootstrap';
import { customFetch, customPost } from '../Auth/customFetch';
import { toast } from 'react-toastify';
import { Refresh } from '@mui/icons-material';
import { useApplicationSettings } from '../Auth/useApplicationContext';

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
            <Table className='ttable' >
                <thead>
                    <tr>
                        <th>Drug Name</th>
                        <th>Category</th>
                        <th>Created By</th>
                        <th>Added On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(drugs) && drugs.length > 0 && drugs.map((drug, index) => (
                        <tr key={index}>
                            <td style={{fontSize:'13px'}} >{drug.drug}</td>
                            <td style={{fontSize:'13px'}} >{drug.categoryName}</td>
                            <td style={{fontSize:'13px'}} >{drug.createdBy}</td>
                            <td style={{fontSize:'13px'}} >{formatDate(drug.addedOn)}</td>
                            <td style={{fontSize:'13px'}} >
                                <Button variant="warning" size="sm" onClick={() => handleEditDrug(drug)}>Edit</Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(drug.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}
