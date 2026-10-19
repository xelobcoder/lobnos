"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { plsEncryption } from "../../../../lib/encryption";
import { unwrap, errorMessage } from "../../../../lib/patientPortal";
import {
    appointmentConversionUrl,
    appointmentOperationsUrl,
    type AppointmentWorkflow,
} from "../../../../lib/appointmentWorkflow";

const money = (value: unknown) => (Number(value) || 0).toFixed(2);
const STAGE_LABEL = { booked: 'Booked — not billed', billed: 'Billed — awaiting payment', paid: 'Paid' } as const;

export default function AppointmentWorkflowPage() {
    const params = useParams<{ id: string }>();
    const appointmentId = Number(params?.id);
    const [workflow, setWorkflow] = useState<AppointmentWorkflow | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
            setError('Invalid appointment.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            setWorkflow(unwrap<AppointmentWorkflow>(await customFetch(`appointments/${appointmentId}/workflow`)));
        } catch (err) {
            setWorkflow(null);
            setError(errorMessage(err, 'Unable to load the appointment workflow.'));
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="container py-4" role="status">Loading appointment…</div>;
    if (error || !workflow) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger" role="alert">{error || 'Appointment not found.'}</div>
                <button type="button" className="btn btn-outline-primary me-2" onClick={load}>Retry</button>
                <Link href="/appointments" className="btn btn-link">Back to appointments</Link>
            </div>
        );
    }

    const { appointment, patient, services, bill } = workflow;
    const patientName = patient
        ? [patient.firstname, patient.middlename, patient.lastname].filter(Boolean).join(' ')
        : 'No registered patient';
    const conversionUrl = workflow.canConvert && appointment.patientid
        ? appointmentConversionUrl(plsEncryption(String(appointment.patientid)), appointment.refid)
        : '';
    const operationsUrl = appointment.billingid && appointment.patientid
        ? appointmentOperationsUrl(appointment.appointment_type, appointment.patientid, appointment.billingid)
        : '';

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h4 mb-0">Appointment #{appointment.refid} — recommended services</h1>
                <Link href="/appointments" className="btn btn-link">Back to appointments</Link>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <p className="mb-1"><strong>Patient:</strong> {patientName}{patient?.fullpatientid ? ` (${patient.fullpatientid})` : ''}</p>
                    <p className="mb-1"><strong>Type:</strong> {appointment.appointment_type}</p>
                    <p className="mb-1"><strong>When:</strong> {String(appointment.appointment_date ?? '').slice(0, 10)} {appointment.appointment_time}</p>
                    <p className="mb-1"><strong>Status:</strong> {appointment.status ?? 'scheduled'}</p>
                    <p className="mb-0"><strong>Stage:</strong> {STAGE_LABEL[workflow.stage]}</p>
                </div>
            </div>

            <table className="table table-sm">
                <caption>Booked services (current General prices; the bill is priced again when saved)</caption>
                <thead><tr><th scope="col">Service</th><th scope="col">Department</th><th scope="col" className="text-end">Price</th></tr></thead>
                <tbody>
                    {services.length === 0 && <tr><td colSpan={3}>No services selected on this appointment.</td></tr>}
                    {services.map(service => (
                        <tr key={service.id} className={service.missing ? 'table-warning' : undefined}>
                            <td>{service.name}{service.missing ? ' (no longer available)' : ''}</td>
                            <td>{service.department ?? '—'}</td>
                            <td className="text-end">{money(service.price)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot><tr><th colSpan={2}>Estimated total</th><th className="text-end">{money(workflow.estimatedTotal)}</th></tr></tfoot>
            </table>

            {workflow.blockers.length > 0 && (
                <div className="alert alert-warning" role="alert">
                    <ul className="mb-0">{workflow.blockers.map(blocker => <li key={blocker}>{blocker}</li>)}</ul>
                </div>
            )}

            {bill ? (
                <div className="alert alert-info" role="status">
                    This appointment is linked to bill #{bill.billingid}: payable {money(bill.payable)}, paid {money(bill.paid)},
                    outstanding {money(bill.outstanding)}. Do not create another bill for this appointment.
                </div>
            ) : appointment.billingid ? (
                <div className="alert alert-info" role="status">Linked to bill #{appointment.billingid}.</div>
            ) : null}

            <div className="d-flex gap-2">
                {conversionUrl && <Link href={conversionUrl} className="btn btn-primary">Convert to bill</Link>}
                {operationsUrl && <Link href={operationsUrl} className="btn btn-success">Open {appointment.appointment_type === 'ultrasound' ? 'ultrasound' : 'laboratory'} workspace</Link>}
            </div>
        </div>
    );
}
