"use client"
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiListCheck } from '@remixicon/react';

import { controlMaterialSchema, ControlMaterialType } from './types/ControlMaterial';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { customFetch, customPost } from '../../Auth/customFetch';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { ControlMaterialFormModal } from './ControlManager/ControlMaterialFormModal';
import { DeviceType } from './types';
import { ControlParametersModal } from './ControlManager/ControlParametersModal';

export function ControlMaterialManager() {
    const { user } = useApplicationSettings().applicationsettings;
    const employeeid = user.employeeid;
    const [materials, setMaterials] = useState<ControlMaterialType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<ControlMaterialType | null>(null);
    const [devices, setDevices] = useState<DeviceType[]>([]);
    const [showParametersModal, setShowParametersModal] = useState(false);
    const [selectedMaterialForParams, setSelectedMaterialForParams] = useState<string | null>(null);
    const [associatedTests, setAssociatedTests] = useState<number>(0);
    const [loadingDevices, setLoadingDevices] = useState(false);



    const { register, handleSubmit, reset, watch, control, formState: { errors }, setValue } = useForm<ControlMaterialType>({
        resolver: zodResolver(controlMaterialSchema),
        defaultValues: {
            status: 'active',
            storageConditions: 'Room Temperature'
        }
    });

    const fetchDevices = async (searchQuery: string = '') => {
        try {
            setLoadingDevices(true);
            const response = await customFetch(`devices/search/devices?search=${encodeURIComponent(searchQuery)}`);
            if (response && Array.isArray(response) && response.length > 0) {
                const deviceOptions = response.map(device => ({
                    value: device.id,
                    label: `${device.deviceName} (${device.model})`,
                    device
                }));
                setDevices(deviceOptions as any);
            }
        } catch (error) {
            toast.error('Failed to load devices');
            console.error(error);
        } finally {
            setLoadingDevices(false);
        }
    };


    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await customFetch('controlmaterials');
            if (response?.data) {
                setMaterials(response.data);
            }
        } catch (error) {
            toast.error('Failed to load materials');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedMaterial(null);
        reset();
    };

    const onSubmit = async (data: ControlMaterialType) => {
        try {
            setLoading(true);
            const method = selectedMaterial ? 'PUT' : 'POST';
            const url = `controlmaterials${selectedMaterial ? `/${selectedMaterial.id}` : ''}`;

            const payload = {
                ...data,
                deviceId: typeof data.deviceId === 'object' ? data.deviceId.value : data.deviceId,
                createdby: parseInt(employeeid),
                updatedby: parseInt(employeeid)
            };

            const response = await customPost(url, method, payload);

            if (response?.status === true) {
                toast.success(`Material ${selectedMaterial ? 'updated' : 'added'} successfully`);
                fetchMaterials();
                handleClose();
            } else {
                throw new Error(response?.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save material');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (material: ControlMaterialType) => {
        setSelectedMaterial(material);
        Object.entries(material).forEach(([key, value]) => {
            setValue(key as keyof ControlMaterialType, value);
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            setLoading(true);
            const response = await customPost(`controlmaterials/${id}`, 'DELETE', {});
            if (response.status) {
                toast.success('Material deleted successfully');
                fetchMaterials();
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (error) {
            toast.error('Failed to delete material');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleServerFiltering = async (pagination: { page: number, count: number }) => {
        try {
            const { page, count } = pagination;
            const response = await customFetch(`controlmaterials?page=${page}&&count=${count}`);
            const { data } = response;
            if (data && Array.isArray(data)) {
                return { result: data, err: false }
            } else {
                return { result: [], err: false }
            }
        } catch (err) {
            return { result: [], err: true }
        }
    }



    const handleParameterOpening = async (itemdata: { testId: number, id: string }) => {
        const { testId, id } = itemdata;
        if (!testId) return toast.info("Control not associated with a Test");
        if (!id) return;
        setSelectedMaterialForParams(id)
        setAssociatedTests(testId);
        setShowParametersModal(true);
    }

    const columns = [
        {
            Header: "Associated Test",
            accessor: 'testPanelName',
        },
        {
            Header: 'DeviceName',
            accessor: 'deviceName',
            Cell: ({ row }) => {
                const model = row.original.model ? ` (${row.original.model})` : '';
                return <div>{row.original.deviceName}{model}</div>
            },
        },
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Lot Number',
            accessor: 'lotNumber',
        },
        {
            Header: 'Source',
            id: 'source',
            accessor: row => row.sourceType,
            Cell: ({ row }) => {
                let typeLabel = '';
                if (row.original.sourceType === 'manufacturer') typeLabel = 'Commercial';
                else if (row.original.sourceType === 'sister_lab') typeLabel = 'Sister Lab';
                else typeLabel = 'Trusted Source';
                const details = row.original.sourceType === 'manufacturer'
                    ? row.original.manufacturer
                    : row.original.sourceName;
                return (
                    <div>
                        <div className="fw-semibold">{typeLabel}</div>
                        <div className="small text-muted">{details}</div>
                    </div>
                );
            },
        },
        {
            Header: 'Expiry Date',
            accessor: 'expiryDate',
            Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : '-',
        },
        {
            Header: 'Storage',
            accessor: 'storageConditions',
        },
        {
            Header: 'Created By',
            accessor: 'createdByUser',
        },
        {
            Header: 'Current Status',
            accessor: 'currentStatus',
            Cell: ({ value }) => (
                <Badge bg={value === 'active' ? 'success' : 'warning'}>
                    {value}
                </Badge>
            ),
        },
        {
            Header: 'Days Until Expiry',
            accessor: 'daysUntilExpiry',
            Cell: ({ value }) => (
                <span className={value <= 30 ? 'text-danger' : ''}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Actions',
            id: 'actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                            handleParameterOpening(row.original)
                        }}
                    >
                        <RiListCheck size={14} />
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                    >
                        <RiEditLine size={14} />
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <RiDeleteBinLine size={14} />
                    </Button>
                </div>
            ),
        }
    ];


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Row className="mb-3">
                <Col><h3>Control materials</h3></Col><Col xs="auto" className='d-flex justify-content-end'>
                    <Button
                        variant="outline-primary"
                        size='sm'
                        onClick={() => setShowModal(true)}
                    >
                        <RiAddLine /> Add New Material
                    </Button>
                </Col>
            </Row>

            <ControlMaterialFormModal
                show={showModal}
                onHide={handleClose}
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                watch={watch}
                errors={errors}

                selectedMaterial={selectedMaterial}
                control={control}
                devices={devices}
                loadingDevices={loadingDevices}
                onDeviceSearch={fetchDevices}
            />

            <PrimeTable
                column={columns}
                data={materials}
                filtering={false}
                serverSideFiltering={true}
                handleSeverSideProcessing={handleServerFiltering}
            />

            <ControlParametersModal
                show={showParametersModal}
                onHide={() => {
                    setShowParametersModal(false);
                    setSelectedMaterialForParams(null);
                }}
                associatedTests={associatedTests}
                materialId={selectedMaterialForParams || ''}
                onSuccess={() => {
                    setShowParametersModal(false);
                    setSelectedMaterialForParams(null);
                    fetchMaterials();
                }}
            />
        </div>
    );
}

