export type AppointmentWorkflowStage = 'booked' | 'billed' | 'paid';

export interface AppointmentWorkflowService {
    id: number;
    name: string;
    price: number;
    department: string | null;
    missing?: boolean;
}

export interface AppointmentWorkflow {
    appointment: {
        refid: number;
        appointment_type: string;
        appointment_date: string;
        appointment_time: string;
        duration?: number | null;
        status: string | null;
        title: string | null;
        purpose: string | null;
        practioner: string | null;
        location: string | null;
        patientid: number | null;
        lead_id: number | null;
        billingid: number | null;
        service_ids: number[];
        converted_by: number | null;
        converted_at: string | null;
    };
    patient: {
        patientid: number;
        fullpatientid?: string | null;
        firstname?: string | null;
        middlename?: string | null;
        lastname?: string | null;
        mobile_number?: string | null;
        email?: string | null;
    } | null;
    services: AppointmentWorkflowService[];
    estimatedTotal: number;
    bill: {
        billingid: number;
        payable: number | string | null;
        paid: number | string | null;
        outstanding: number | string | null;
        isPaid: boolean;
    } | null;
    stage: AppointmentWorkflowStage;
    canConvert: boolean;
    blockers: string[];
}

const positiveId = (value: unknown, label: string): number => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
    return id;
};

/** Opens the existing General billing composer prefilled with the appointment's booked services. */
export function appointmentConversionUrl(encryptedPatientId: string, appointmentId: number): string {
    const id = positiveId(appointmentId, 'appointment');
    if (!encryptedPatientId) throw new Error('Invalid patient.');
    return `/billing/patientid/${encodeURIComponent(encryptedPatientId)}/multi/1?entitytype=general&isRelatedBilling=0&appointmentId=${id}`;
}

/** Downstream clinical workspace once the appointment has a bill. */
export function appointmentOperationsUrl(type: string, patientid: number, billingid: number): string {
    const pid = positiveId(patientid, 'patient');
    const bid = positiveId(billingid, 'bill');
    if (type === 'ultrasound') return `/operations/imaging/ultrasound?patientid=${pid}&billingid=${bid}`;
    if (type === 'laboratory') return `/operations/laboratory?patientid=${pid}&billingid=${bid}`;
    return '';
}
