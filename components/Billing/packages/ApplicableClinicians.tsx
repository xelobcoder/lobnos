import React, { useEffect, useState } from 'react';
import ClinicianFiltering from '../../accessories/SectorFileringComponents/ClinicianFiltering';
import { Button } from 'react-bootstrap';
import { RiDeleteBinFill, RiSendPlaneLine } from '@remixicon/react';
import { customPost } from '../../Auth/customFetch';
import { toast, ToastContainer } from 'react-toastify';
import { loadClinicianPackage } from '../../serverActions/ActionFiltering';
import Spinner from 'react-bootstrap/Spinner';

interface Clinician {
    id: number;
    name: string;
    location: string;
    phone: string;
}

interface ApplicableCliniciansProps {
    packageid: number;
}

export default function ApplicableClinicians({ packageid }: ApplicableCliniciansProps) {
    const [selectedClinicians, setSelectedClinicians] = useState<Clinician[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSelectionOfClinician = (clinician: Clinician) => {
        if (!selectedClinicians.some(c => c.id === clinician.id)) {
            setSelectedClinicians(prev => [...prev, clinician]);
        }
    };

    const removeClinician = (id: number) => {
        setSelectedClinicians(prev => prev.filter(c => c.id !== id));
    };

    const clearAllClinicians = () => {
        setSelectedClinicians([]);
    };

    const handleSubmit = async () => {
        const dataToSubmit = selectedClinicians.map(clinician => ({
            package_id: packageid,
            clinician_id: clinician.id,
        }));
        console.log('Submitting:', dataToSubmit);

        setLoading(true);
        try {
            const response = await customPost(`clinician-packages`, 'POST', dataToSubmit);
            const { status, message } = response;

            if (status === true) {
                toast.success(message || 'Clinicians added successfully!');
            } else {
                toast.error(message || 'Something went wrong, please try again');
            }
        } catch (error) {
            toast.error(`Error: ${error.message || 'An unexpected error occurred'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (packageid) {
            setLoading(true);
            loadClinicianPackage(packageid)
                .then((response) => {
                    if (response && Array.isArray(response)) {
                        setSelectedClinicians(response);
                    }
                })
                .catch((err) => {
                    toast.error(`Error: ${err.message || 'An unexpected error occurred'}`);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [packageid]);

    return (
        <div>
            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            <ClinicianFiltering onSelect={handleSelectionOfClinician} />
            <ToastContainer position='top-center' className={'text-sm'} theme='colored' />
            <table className="table pls-color">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Phone</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedClinicians.length > 0 ? (
                        selectedClinicians.map((clinician) => (
                            <tr key={clinician.id}>
                                <td>{clinician.name}</td>
                                <td>{clinician.location}</td>
                                <td>{clinician.phone}</td>
                                <td>
                                    <RiDeleteBinFill color='error' onClick={() => removeClinician(clinician.id)} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">No clinicians selected</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedClinicians.length > 0 && (
                <div className="d-flex gap-3 mt-4">
                    <Button size='sm' variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Submitting...</span>
                            </>
                        ) : (
                            <>
                                Submit  <RiSendPlaneLine size={18}/>
                            </>
                        )}
                    </Button>
                    <Button variant="danger" size='sm' onClick={clearAllClinicians} disabled={loading}>
                        <RiDeleteBinFill size={18}/>
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    );
}