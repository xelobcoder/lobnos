"use client"
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { DeviceFormModal } from './DeviceFormModal';
import { deviceSchema, DeviceType } from './types';
import { customFetch, customPost } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import PrimeToast from '../../accessories/PrimeToast';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import moment from 'moment';
import { fetchDevices } from './lib';


export function DeviceManager() {
    const [devices, setDevices] = useState<DeviceType[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useApplicationSettings().applicationsettings;
    const employeeid = user.employeeid;
    const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<DeviceType>({
        resolver: zodResolver(deviceSchema)
    });

    useEffect(() => {
        fetchDevices({ setDevices, setLoading, toast })
    }, []);



    const handleClose = () => {
        setShowModal(false);
        setSelectedDevice(null);
        reset();
    };

    const handleEdit = (device: DeviceType) => {
        setSelectedDevice(device);
        Object.keys(device).forEach((key) => {
            setValue(key as keyof DeviceType, device[key as keyof DeviceType]);
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this device?')) return;

        try {
            const response = await customPost(`devices/${id}`, 'DELETE', {});
            console.log(response)
            toast.success('Device deleted successfully');
            fetchDevices({ setDevices, setLoading, toast })
        } catch (error) {
            toast.error('Failed to delete device');
            console.error(error);
        }
    };

    const onSubmit = async (data: DeviceType) => {
        try {
            const method = selectedDevice ? 'PUT' : 'POST';
            const url = selectedDevice
                ? `devices/${selectedDevice.id}`
                : 'devices';

            let payload = {
                ...data,
                calibrationFrequency: Number(data.calibrationFrequency),
                installationDate: new Date(data.installationDate).toISOString().split('T')[0],
                lastCalibrationDate: new Date(data.lastCalibrationDate).toISOString().split('T')[0],
                createdby: employeeid,
            };

            if (selectedDevice) {
                payload = {
                    ...payload,
                    id: selectedDevice.id,
                    updatedby: employeeid,
                };
            }

            const response = await customPost(url, method, payload);
            const { status } = response;
            if (status === true) {
                toast.success(`Device ${selectedDevice ? 'updated' : 'added'} successfully`);
                handleClose();
                fetchDevices({ setDevices, setLoading, toast })
            } else {
                toast.error(`Failed to ${selectedDevice ? 'update' : 'add'} device`);
            }
        } catch (error) {
            toast.error(`Failed to ${selectedDevice ? 'update' : 'add'} device`);
            console.error(error);
        }
    };

    const columns = [
        {
            Header: 'Device Name',
            accessor: 'deviceName',
        },
        {
            Header: 'Model',
            accessor: 'model',
        },
        {
            Header: 'Manufacturer',
            accessor: 'manufacturer',
        },
        {
            Header: 'Location',
            accessor: 'location',
        },
        {
            Header: 'Last Calibration',
            accessor: 'lastCalibrationDate',
            Cell: ({ row }) => moment(row.original.lastCalibrationDate).format('DD/MM/YYYY'),
        },
        {
            Header: 'Next Due',
            accessor: 'calibrationFrequency',
            Cell: ({ row }) => {
                const lastCalibration = moment(row.original.lastCalibrationDate);
                return lastCalibration.add(row.original.calibrationFrequency, 'days').format('DD/MM/YYYY');
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <Badge bg={
                    row.original.status === 'active' ? 'success' :
                        row.original.status === 'maintenance' ? 'warning' : 'danger'
                }>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }) => (
                <>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(row.original)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];


    if (loading) {
        return <div role="status" className="text-center p-4">Loading laboratory devices…</div>;
    }

    const handleServerFiltering = async (pagination: { page: number, count: number }) => {
        try {
            const { page, count } = pagination;
            const response = await customFetch(`devices?page=${page}&&count=${count}`);
            const { data } = response;
            if (data && Array.isArray(data)) {
                return { result: data, err: false };
            } else {
                return { result: [], err: false };
            }
        } catch (err) {
            console.error('Server filtering error:', err);
            return { result: [], err: true };
        }
    };

    return (
        <div>
            <Row className="mb-4">
                <Col>
                    <h4>Laboratory Devices</h4>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        size='sm'
                        onClick={() => setShowModal(true)}
                    >
                        Add New Device
                    </Button>
                </Col>
            </Row>

            <DeviceFormModal
                show={showModal}
                onHide={handleClose}
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                selectedDevice={selectedDevice}
            />

            <PrimeTable
                column={columns}
                data={devices || []}
                serverSideFiltering={true}
                filtering={false}
                handleSeverSideProcessing={handleServerFiltering}
            />
            <PrimeToast />
        </div>
    );
}