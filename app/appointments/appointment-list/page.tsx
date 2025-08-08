'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customFetch } from '../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { Badge } from 'react-bootstrap';
import { fetchServerSideAppointments } from '../../../components/serverActions/ActionFiltering';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import Loader from '../../../components/isLoading';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import AppointmentModal from '../../../components/appointments/AppointmentModal';
import SmsReminderModal from '../../../components/appointments/SmsReminderModal';
// import EmailReminderModal from '../../../components/appointments/EmailReminderModal';
import { RiMessage2Fill, RiMailFill, RiPhoneFill } from '@remixicon/react';


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
    const router = useRouter();
    
    const resetReminderModal = () => {
        setShowReminderModal(false);
        setReminderTarget(null);
        setReminderMode('');
        setSendType('now');
        setScheduleDate('');
    };
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showSmsModal, setShowSmsModal] = useState(false);
    // const [showEmailModal, setShowEmailModal] = useState(false);
    const [reminderMode, setReminderMode] = useState<'sms' | 'email' | 'phone' | ''>('');
    const [reminderTarget, setReminderTarget] = useState<Appointment | null>(null);
    const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
    const [scheduleDate, setScheduleDate] = useState('');
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
            Cell: ({ row }: any) => {
                const inviteMethod = row.original.inviteMethod?.toLowerCase();
                return (
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-info btn-sm" onClick={() => handleView(row.original)}>
                            View
                        </button>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => handleEdit(row.original)}>
                            Edit
                        </button>
                        {inviteMethod === 'sms' && (
                            <button className="btn btn-outline-warning btn-sm" onClick={() => handleSendSmsReminder(row.original)}>
                                <RiMessage2Fill /> Send SMS
                            </button>
                        )}
                        {inviteMethod === 'email' && (
                            <button className="btn btn-outline-warning btn-sm" onClick={() => handleSendEmailReminder(row.original)}>
                                <RiMailFill /> Send Email
                            </button>
                        )}
                        {inviteMethod === 'phonecall' && (
                            <button className="btn btn-outline-warning btn-sm" onClick={() => handleLogPhoneCall(row.original)}>
                                <RiPhoneFill /> Phone Call
                            </button>
                        )}
                    </div>
                );
            },
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


    const handleSendSmsReminder = (appointment: Appointment) => {
        setReminderTarget(appointment);
        setSendType('now');
        setScheduleDate('');
        setShowSmsModal(true);
    };

    const handleSendEmailReminder = (appointment: Appointment) => {
        setReminderTarget(appointment);
        // setShowEmailModal(true);
        alert('Email modal not implemented yet');
    };

    const handleLogPhoneCall = (appointment: Appointment) => {
        const patientName = `${appointment.designation || ''} ${appointment.firstname || ''} ${appointment.lastname || ''}`.trim();
        const queryParams = new URLSearchParams({
            patientid: appointment.patientid.toString(),
            refid: appointment.refid.toString(),
            patientName: patientName,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            appointmentPurpose: appointment.purpose || ''
        });
        
        router.push(`/appointments/phone-call-log?${queryParams.toString()}`);
    };

    const handleSendReminder = (appointment: Appointment) => {
        setReminderTarget(appointment);
        setReminderMode('');
        setSendType('now');
        setScheduleDate('');
        setShowReminderModal(true);
    }; const handleConfirmSendReminder = () => {
        if (reminderTarget) {
            if (sendType === 'now') {
                alert(`Reminder (${reminderMode}) sent now to ${reminderTarget.firstname} ${reminderTarget.lastname}`);
            } else {
                alert(`Reminder (${reminderMode}) scheduled for ${scheduleDate} to ${reminderTarget.firstname} ${reminderTarget.lastname}`);
            }
        }
        resetReminderModal();
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
                handleEditChange={() => { }}
                handleSaveChanges={() => { }}
                handleCancelEdit={() => setShowModal(false)}
                formatTime={(t: string) => t}
                getStatusColor={getStatusColor}
            />

            <SmsReminderModal
                show={showSmsModal}
                onHide={() => setShowSmsModal(false)}
                appointment={reminderTarget}
                sendType={sendType}
                setSendType={setSendType}
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
                onSend={() => setShowSmsModal(false)}
                disableSend={sendType === 'schedule' && !scheduleDate}
            />
        </div>
    );
}
