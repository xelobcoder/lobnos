
export interface PatientData {
	id: number;
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
	patientid: number;
}

export const patientData: PatientData = {
	id: 7,
	firstname: "",
	email: "",
	dob: "",
	age: 0,
	gender: "",
	marital_status: "",
	mobile_number: "",
	agetype: "",
	occupation: "",
	date: "",
	activation_status: '',
	lastname: "",
	middlename: "",
	organization: "",
	contactpointer: "self",
	patientid: 0
};

import { customFetch, customPost } from "../components/Auth/customFetch";

// Types
export interface Practitioner {
	name: string;
	role: string;
	employeeid?: string | number;
}

export interface AppointmentData {
	appointment_date: Date;
	practioner: Practitioner;
	purpose: string;
	appointment_time: string;
	location: string;
	appointment_type?: "consultation" | "laboratory" | "ultrasound" | "follow_up";
	lead_id?: number | null;
	billingid?: number | null;
	service_ids?: number[];
	patientid?: number | null;
	employeeid?: string | number;
	title: string;
	preference: string | OptionType;
	inviteMethod: string | OptionType;
	duration: number | OptionType;
	[key: string]: any;
}

export interface OptionType {
	value: string | number;
	label: string;
}


export const loadOptions = async (
	input: string = '',
	selectedField: string,
	startDate: string = '',
	endDate: string = ''
): Promise<any[]> => {
	// Check if either input or dates are provided
	const hasInput = input && input.length >= 3;
	const hasDates = startDate && endDate;

	if (!hasInput && !hasDates) {
		return [];
	}

	const payload: any = {};

	if (hasInput) {
		payload[selectedField] = input;
	}

	if (hasDates) {
		payload.startDate = startDate;
		payload.endDate = endDate;
	}

	const response = await customPost(`customer/advanced/filter`, 'POST', payload);
	const { data, success } = response || {};
	if (success && Array.isArray(data)) return data;

	return [];
}

export const APPOINTMENT_DEFAULT_DATA: AppointmentData = {
	appointment_date: new Date(),
	practioner: { name: "", role: "" },
	purpose: "",
	appointment_time: "",
	location: "Tamale",
	appointment_type: "consultation",
	lead_id: null,
	billingid: null,
	service_ids: [],
	patientid: null,
	title: "",
	preference: "in person",
	inviteMethod: "sms",
	duration: 15,
};

export const morningSlot: string[] = [
	"08:00",
	"08:30",
	"09:00",
	"09:30",
	"10:00",
	"10:30",
	"11:00",
	"11:30"
];

export const afternoonSlot: string[] = [
	"12:00",
	"12:30",
	"13:00",
	"13:30",
	"14:00",
	"14:30",
	"15:00",
	"15:30",
	"16:00",
	"16:30",
	"17:00",
	"17:30"
];

export const eveningSlot: string[] = [
	"18:00",
	"18:30",
	"19:00",
	"19:30",
	"20:00"
];



export const durationOptions: OptionType[] = [
	{ value: 30, label: "30 minutes" },
	{ value: 60, label: "60 minutes" },
	{ value: 90, label: "1 hour 30 minutes" },
	{ value: 120, label: "2 hours" }
];


export const inviteMethod: OptionType[] = [
	{ value: "sms", label: "sms" },
	{ value: "email", label: "email" },
	{ value: "both", label: "email and SMS" },
	{ value: "whatapp", label: "whatapp" },
	{ value: 'phonecall', label: 'phone call' }
];
export const preferenceOptions: OptionType[] = [
	{ value: "in person", label: "In Person" },
	{ value: "zoom", label: "Zoom" },
	{ value: "google meet", label: "Google Meet" }
];

export const handleSubmitForm = async (
	data: AppointmentData,
	toast: { success: (msg: string, opts?: any) => void; error: (msg: string, opts?: any) => void }
): Promise<boolean | void> => {
	try {
		if (typeof data == "object" || typeof data == "string" || typeof data == "number") {
			// Transform data to match required API payload
			const request_data = {
				appointment_date: data.appointment_date,
				appointment_time: data.appointment_time,
				duration: (data.duration as OptionType)?.value ?? data.duration,
				inviteMethod: (data.inviteMethod as OptionType)?.value ?? data.inviteMethod,
				location: data.location,
				patientid: data.patientid ?? (data.patient && data.patient.id),
				appointment_type: data.appointment_type || "consultation",
				lead_id: data.lead_id || null,
				billingid: data.billingid || null,
				...(isWorkflowAppointmentType(data.appointment_type) && Array.isArray(data.service_ids) && data.service_ids.length
					? { service_ids: data.service_ids.map(Number) }
					: {}),
				practioner: typeof data.practioner === 'object' ? (data.practioner.employeeid ?? data.practioner) : data.practioner,
				preference: (data.preference as OptionType)?.value ?? data.preference,
				purpose: data.purpose,
				title: data.title
			};
			// Validate required fields
			const missingFields = validateAppointmentData(request_data);
			if (missingFields.length > 0) {
				toast.error(`Missing or empty fields: ${missingFields.join(", ")}`, { position: "top-center" });
				return false;
			}
			let pushData: any;
			try {
				pushData = await customPost(`appointments/create?employeeid=${data.employeeid}`, 'POST', request_data);
			} catch (err) {
				// Indeterminate: the request may have been saved before the connection dropped.
				console.log(err, "error in appointment submission");
				const existing = request_data.patientid
					? await findExistingAppointment(request_data.patientid, request_data.appointment_date, request_data.appointment_time)
					: null;
				if (existing) {
					toast.success(`The appointment was saved (#${existing.refid}).`, { position: "top-center" });
					setTimeout(() => { window.location.href = '/appointments'; }, 1000);
					return true;
				}
				toast.error("We could not confirm whether the appointment was saved. Check the calendar before trying again.", { position: "top-center" });
				return false;
			}
			if (pushData?.success == true) {
				toast.success("Appointment scheduled successfully", { position: "top-center" });
				setTimeout(() => {
					window.location.href = '/appointments';
				}, 1000);
				return true;
			}
			if (pushData?.status == "error" && pushData?.message) {
				// 400 validation / 409 duplicate booking messages come straight from the server.
				toast.error(pushData.message, { position: "top-center" });
			} else if (pushData?.success == false) {
				toast.error("The practitioner already has an appointment in this slot. Choose another time.", { position: "top-center" });
			} else {
				toast.error("Something went wrong, please try again later", { position: "top-center" });
			}
			return false;
		}
	} catch (err) {
		console.log(err, "error in appointment submission");
		toast.error("Something went wrong, please try again later", { position: "top-center" });
	}
};

const normalizeDateKey = (value: unknown): string => {
	if (!value) return "";
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value as any);
	if (isNaN(date.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Looks up a patient's live appointment at the given date/time (used after an indeterminate submit). */
export async function findExistingAppointment(patientid: number | string, date: unknown, time: string): Promise<any | null> {
	try {
		const history = await customFetch(`appointments/client/previous?patientid=${patientid}&count=50&page=1`);
		const rows = Array.isArray(history) ? history : Array.isArray(history?.data) ? history.data : [];
		const day = normalizeDateKey(date);
		return rows.find((row: any) =>
			normalizeDateKey(row?.appointment_date) === day &&
			String(row?.appointment_time ?? "").slice(0, 5) === String(time ?? "").slice(0, 5) &&
			!/^cancel/i.test(String(row?.status ?? ""))
		) ?? null;
	} catch {
		return null;
	}
}

export const WORKFLOW_APPOINTMENT_TYPES = ["laboratory", "ultrasound"] as const;
export const isWorkflowAppointmentType = (type: unknown): type is "laboratory" | "ultrasound" =>
	WORKFLOW_APPOINTMENT_TYPES.includes(String(type ?? "").toLowerCase() as any);

export interface AppointmentService {
	id: number;
	name: string;
	price: number;
	department: string | null;
	missing?: boolean;
}

/** Billable services for a lab/ultrasound appointment, filtered by department on the server. */
export async function loadAppointmentServices(type: string): Promise<AppointmentService[]> {
	if (!isWorkflowAppointmentType(type)) return [];
	const response = await customFetch(`appointments/services?appointment_type=${encodeURIComponent(type)}`);
	return Array.isArray(response?.data) ? response.data : [];
}

export const appointmentWorkflowUrl = (refid: number | string) => `/appointments/${refid}/workflow`;

// Validate appointment data, returns array of missing/empty field names
export function validateAppointmentData(data: Record<string, any>): string[] {
	const required = [
		"appointment_date",
		"appointment_time",
		"duration",
		"inviteMethod",
		"location",
		"practioner",
		"preference",
		"purpose",
		"title"
	];
	const missing: string[] = [];
	if (!data.patientid && !data.lead_id) {
		missing.push("patient or CRM lead");
	}
	for (const key of required) {
		const val = data[key];
		if (val === undefined || val === null || (typeof val === 'string' && val.trim().length === 0)) {
			missing.push(key);
		}
	}
	return missing;
}


export const prevAppointmentClient = async (
	patientid: string | number,
	setState: (data: any[]) => void
): Promise<void> => {
	const response = await customFetch(`appointments/client/previous?patientid=${patientid}`);
	if (Array.isArray(response)) { setState(response); }
};


export const onChangePractioner = async (
	details: Practitioner,
	setAppointment: (data: AppointmentData) => void,
	appointment: AppointmentData,
	m: (slots: string[]) => void,
	a: (slots: string[]) => void,
	e: (slots: string[]) => void
): Promise<void> => {
	const { employeeid } = details;
	setAppointment({ ...appointment, practioner: details });
	const slots = await customFetch(`appointments/practioner/slots?employeeid=${employeeid}`);
	const morning: string[] = [];
	const evening: string[] = [];
	const afternoon: string[] = [];

	if (Array.isArray(slots) && slots.length > 0) {
		for (let i = 0; i < slots.length; i++) {
			const time = parseInt(slots[i].split(":")[0]);
			if (time < 12) morning.push(slots[i]);
			else if (time >= 12 && time <= 16) afternoon.push(slots[i]);
			else evening.push(slots[i]);
		}
	}
	a(afternoon);
	e(evening);
	m(morning);
};