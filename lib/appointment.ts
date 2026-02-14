
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


export const loadOptions = async (input: string = ''): Promise<any[]> => {
	if (input.length >= 3 && (typeof input === 'string' || typeof input == "number")) {
		const response = await customPost(`customer/advanced/filter?patientid=${input}`, 'POST', { patientid: input });
		const { data, success } = response || {};
		if (success && Array.isArray(data)) return data;
	}
	return [];
}

export const APPOINTMENT_DEFAULT_DATA: AppointmentData = {
	appointment_date: new Date(),
	practioner: { name: "", role: "" },
	purpose: "",
	appointment_time: "",
	location: "Tamale",
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
			const pushData = await customPost(`appointments/create?employeeid=${data.employeeid}`, 'POST', request_data);
			if (pushData?.success == true) {
				toast.success("Appointment scheduled successfully", { position: "top-center" });
				setTimeout(() => {
					window.location.href = '/appointments';
				}, 1000);
			} else {
				if (pushData?.success == false) {
					toast.error("Appointment slot not available ", 3000);
				} else {
					toast.error("something wrong occured", { position: "top-center" });
				}
			}
		}
	} catch (err) {
		console.log(err, "error in appointment submission");
		toast.error("Something went wrong, please try again later", { position: "top-center" });
	}
};

// Validate appointment data, returns array of missing/empty field names
export function validateAppointmentData(data: Record<string, any>): string[] {
	const required = [
		"appointment_date",
		"appointment_time",
		"duration",
		"inviteMethod",
		"location",
		"patientid",
		"practioner",
		"preference",
		"purpose",
		"title"
	];
	const missing: string[] = [];
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