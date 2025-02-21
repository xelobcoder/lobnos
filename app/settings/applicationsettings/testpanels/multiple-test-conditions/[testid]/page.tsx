'use client';

import React, { useState, useEffect } from 'react';
import { customFetch, customPost } from '../../../../../../components/Auth/customFetch';
import { createConditionAction, LoadTestConditionsDefinition } from '../../../../../../components/serverActions/ActionFiltering';
import { useRouter } from 'next/navigation';
import PrimeToast from '../../../../../../components/accessories/PrimeToast';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../../../components/accessories/Datatables/PrimeTable';
import { Modal, Button } from 'react-bootstrap';

interface Condition {
    id: number;
    conditionName: string;
    testId: number;
    createdOn: string;
    updatedOn: string;
}

interface CreateConditionPageProps {
    params: { testid: number };
}

export default function CreateConditionPage({ params }: CreateConditionPageProps) {
    const { testid } = params;
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('');
    const [editingConditionId, setEditingConditionId] = useState<number | null>(null);
    const [conditionInput, setConditionInput] = useState('');
    const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchConditions();
    }, [testid]);

    const fetchConditions = async () => {
        try {
            const data = await LoadTestConditionsDefinition(testid);
            setConditions(data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!conditionInput || !testid) return;
        setIsSubmitting(true);
        try {
            if (editingConditionId) {
                const response = await customPost(`multi/definition/${editingConditionId}`, 'PUT', { conditionName: conditionInput, testid });
                if (response.status === true) {
                    toast.success('Condition updated successfully');
                    await fetchConditions();
                    setEditingConditionId(null);
                    setConditionInput('');
                } else {
                    toast.error('Error updating condition');
                }
            } else {
                const { status, conditionId } = await createConditionAction(conditionInput, testid);
                if (status === true && conditionId) {
                    toast.success('Condition created successfully, confirm redirect');
                    setRedirectUrl(`/settings/applicationsettings/testpanels/multiple-test-conditions/${testid}/${conditionId}`);
                    setShowModal(true);
                }
            }
        } catch (error) {
            toast.error('Error processing condition');
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmRedirect = () => {
        setShowModal(false);
        router.push(redirectUrl);
    };

    const cancelRedirect = () => {
        setShowModal(false);
        fetchConditions();
    }

    const handleEdit = (condition: Condition) => {
        setConditionInput(condition.conditionName);
        setEditingConditionId(condition.id);
    };

    const handleDelete = async (condition: Condition) => {
        if (window.confirm('Are you sure you want to delete this condition?')) {
            try {
                const response = await customPost(`multi/definition/${condition.id}`, 'DELETE', {});
                if (response.status === true) {
                    toast.success('Condition deleted successfully');
                    await fetchConditions();
                } else {
                    toast.error('Error deleting condition');
                }
            } catch (error) {
                toast.error('Error deleting condition');
                console.error('Error deleting condition:', error);
            }
        }
    };

    const handleSelectCondition = (conditionId: number) => {
        setSelectedConditions((prev) =>
            prev.includes(conditionId)
                ? prev.filter((id) => id !== conditionId)
                : [...prev, conditionId]
        );
    };

    const handleDeleteSelected = async () => {
        if (window.confirm('Are you sure you want to delete the selected conditions?')) {
            try {
                const deletePromises = selectedConditions.map((conditionId) =>
                    customPost(`multi/definition/${conditionId}`, 'DELETE', {})
                );
                const results = await Promise.all(deletePromises);
                if (results.every((response) => response.status === true)) {
                    toast.success('Selected conditions deleted successfully');
                    await fetchConditions();
                    setSelectedConditions([]);
                } else {
                    toast.error('Error deleting some conditions');
                }
            } catch (error) {
                toast.error('Error deleting conditions');
                console.error('Error deleting conditions:', error);
            }
        }
    };

    const handleAddEditConstraints = (conditionId: number) => {
        router.push(`/settings/applicationsettings/testpanels/multiple-test-conditions/${testid}/${conditionId}`);
    };

    const columns = [
        {
            Header: 'Select',
            accessor: 'select',
            Cell: ({ row }: { row: { original: Condition } }) => (
                <input
                    type="checkbox"
                    checked={selectedConditions.includes(row.original.id)}
                    onChange={() => handleSelectCondition(row.original.id)}
                />
            ),
        },
        {
            Header: 'Condition Name',
            accessor: 'conditionName',
        },
        {
            Header: 'Created On',
            accessor: 'createdOn',
            Cell: ({ value }: { value: string }) => new Date(value).toLocaleString(),
        },
        {
            Header: 'Updated On',
            accessor: 'updatedOn',
            Cell: ({ value }: { value: string }) => new Date(value).toLocaleString(),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }: { row: { original: Condition } }) => (
                <>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(row.original)} className="me-2">
                        Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row.original)}>
                        Delete
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleAddEditConstraints(row.original.id)} className="me-2 mx-2">
                        Add/Edit Condition Constraints
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <PrimeToast />
            <form onSubmit={handleSubmit}>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="conditionName">Condition Name</label>
                        <input
                            type="text"
                            id="conditionName"
                            name="conditionName"
                            className="custom-input"
                            value={conditionInput}
                            onChange={(e) => setConditionInput(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-sm my-2" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : editingConditionId ? 'Update Condition' : 'Create Condition'}
                        </button>
                    </div>
                </div>
            </form>
            <div className='d-flex justify-content-end' style={{ marginTop: '-60px' }}>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={selectedConditions.length === 0}
                    className="my-2"
                >
                    Delete Selected
                </Button>
            </div>
            <Modal show={showModal} onHide={cancelRedirect}>
                <Modal.Body>Do you want to redirect to create constraints?</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={confirmRedirect}>
                        Yes
                    </Button>
                    <Button variant="danger" onClick={cancelRedirect}>
                        No
                    </Button>
                </Modal.Footer>
            </Modal>
            <PrimeTable column={columns} data={conditions} filtering={false} serverSideFiltering={false} handleSeverSideProcessing={false} />
        </div>
    );
}