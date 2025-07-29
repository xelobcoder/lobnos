'use client';

import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { Badge } from 'react-bootstrap';
import { fetchServerSideAppointments } from '../../../components/serverActions/ActionFiltering';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import Loader from '../../../components/isLoading';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import AppointmentModal from '../../../components/appointments/AppointmentModal';

type Appointment = {
    refid: number;
    patientid: number;
    duration: number;
    status: string;
    appointment_time: string;
    appointment_date: string;
    inviteMethod: string;
    purpose: string;
    title: string;
    preference: string;
    practioner: number;
    location: string;
    notes: string | null;
    fullpatientid: string;
    designation: string;
    firstname: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string;
    activation_status: string;
    lastname: string;
    middlename: string;
    organization: string;
    contactpointer: string;
    whatAppcontact: string;
    practioner_name: string;
};

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const employeeid = useApplication()?.user?.employeeid;

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await customFetch('appointments?page=1&count=10&&employeeid=' + employeeid);
                if (Array.isArray(response)) {
                    setAppointments(response);
                } else {
                    setAppointments([]);
                }
            } catch (error) {
                setAppointments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, [employeeid]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const statusBodyTemplate = (rowData: Appointment) => (
        <Badge bg={getStatusColor(rowData.status)}>{rowData.status}</Badge>
    );

    const patientBodyTemplate = (rowData: Appointment) => (
        `${rowData.designation || ''} ${rowData.firstname || ''} ${rowData.lastname || ''}`.trim()
    );

    const contactBodyTemplate = (rowData: Appointment) => (
        rowData.mobile_number || rowData.whatAppcontact || '-'
    );

    if (isLoading) return <Loader />;

    const columns = [
        { Header: 'Ref ID', accessor: 'refid' },
        { Header: 'Patient', accessor: 'patient', Cell: ({ row }: any) => patientBodyTemplate(row.original) },
        { Header: 'Contact', accessor: 'contact', Cell: ({ row }: any) => contactBodyTemplate(row.original) },
        { Header: 'Duration', accessor: 'duration', Cell: ({ value }: any) => `${value} mins` },
        { Header: 'Status', accessor: 'status', Cell: ({ row }: any) => statusBodyTemplate(row.original) },
        { Header: 'Appointment Date', accessor: 'appointment_date', Cell: ({ value }: any) => dayjs(value).format('DD MMM YYYY') },
        { Header: 'Time', accessor: 'appointment_time' },
        { Header: 'Purpose', accessor: 'purpose' },
        { Header: 'Title', accessor: 'title' },
        { Header: 'Preference', accessor: 'preference' },
        { Header: 'Invite Method', accessor: 'inviteMethod' },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }: any) => (
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-info btn-sm" onClick={() => handleView(row.original)}>
                        View
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(row.original)}>
                        Edit
                    </button>
                </div>
            ),
        },
    ];

    const handleView = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setModalMode('edit');
        setShowModal(true);
    };

    return (
        <div className="">
            <h4 className="mb-4">All Appointments</h4>
            <PrimeTable column={columns} data={appointments} filtering={true} handleSeverSideProcessing={fetchServerSideAppointments} serverSideFiltering={true} />
            <AppointmentModal
                show={showModal}
                onHide={() => setShowModal(false)}
                selectedDate={selectedAppointment ? selectedAppointment.appointment_date : null}
                selectedAppointments={selectedAppointment ? [selectedAppointment] : []}
                editedAppointments={selectedAppointment ? [selectedAppointment] : []}
                modalMode={modalMode}
                setModalMode={setModalMode}
                handleEditChange={() => {}}
                handleSaveChanges={() => {}}
                handleCancelEdit={() => setShowModal(false)}
                formatTime={(t: string) => t}
                getStatusColor={getStatusColor}
            />
        </div>
    );
}
