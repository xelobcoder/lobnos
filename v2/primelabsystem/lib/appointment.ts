import { customFetch, customPost } from "../lib/customFetch";
import { toast } from "react-toastify";

interface Patient {
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

interface Practitioner {
  name: string;
  role: string;
  employeeid: string;
  username?: string;
}

interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

interface AppointmentData {
  appointment_date: Date;
  practioner: Practitioner;
  purpose: string;
  appointment_time: string;
  location: string;
  title: string;
  preference: SelectOption | string;
  inviteMethod: SelectOption | string;
  duration: SelectOption<number> | number;
  patientid?: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const loadOptions = async (input: string | number = ''): Promise<Patient[]> => {
  if (input.toString().length >= 3) {
    const response = await customFetch(`application/filtering/table/new_patients?value=${input}&&original=&&limit=10`);
    return Array.isArray(response) ? response : [];
  }
  return [];
};

export const APPOINTMENT_DEFAULT_DATA: AppointmentData = {
  appointment_date: new Date(),
  practioner: { name: "", role: "", employeeid: "" },
  purpose: "",
  appointment_time: "",
  location: "Tamale",
  title: "",
  preference: "in person",
  inviteMethod: "sms",
  duration: 15,
};

export const morningSlot: string[] = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30"
];

export const afternoonSlot: string[] = [
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

export const eveningSlot: string[] = [
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

export const durationOptions: SelectOption[] = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "1 hour 30 minutes" },
  { value: 120, label: "2 hours" }
];

export const patientData: Patient = {
  id: 7,
  firstname: "Tifiu",
  email: "",
  dob: "1995-11-05T23:00:00.000Z",
  age: 30,
  gender: "male",
  marital_status: "",
  mobile_number: "",
  agetype: "years",
  occupation: "",
  date: "2024-05-17T23:00:00.000Z",
  activation_status: "TRUE",
  lastname: "Hamza",
  middlename: "",
  organization: "",
  contactpointer: "self",
  patientid: 20245187,
};

export const inviteMethod: SelectOption[] = [
  { value: "sms", label: "sms" },
  { value: "email", label: "email" },
  { value: "whatapp", label: "whatapp" },
];

export const preferenceOptions: SelectOption[] = [
  { value: "in person", label: "In Person" },
  { value: "zoom", label: "Zoom" },
  { value: "google meet", label: "Google Meet" }
];

export const handleSubmitForm = async (
  data: AppointmentData, 
  toast: {
    success: (message: string, options?: object) => void;
    error: (message: string, options?: object | number) => void;
  }
): Promise<boolean> => {
  if (typeof data === "object") {
    const practioner = data.practioner.employeeid;
    const inviteMethod = typeof data.inviteMethod === 'object' ? data.inviteMethod.value : data.inviteMethod;
    const preference = typeof data.preference === 'object' ? data.preference.value : data.preference;
    const duration = typeof data.duration === 'object' ? data.duration.value : data.duration;
    
    const request_data = { ...data, practioner, inviteMethod, duration, preference };
    const is_string_empty = Object.entries(request_data)
      .filter(([key, value]) => 
        typeof value === 'string' && value.length <= 1 && key !== 'middlename'
      ).length;
    
    if (is_string_empty > 0) return false;
    
    try {
      const pushData = await customPost('appointments/create', 'POST', request_data);
      
      if ((pushData as ApiResponse)?.success) {
        toast.success("Appointment scheduled successfully", { position: "top-center" });
        setTimeout(() => {
          window.location.href = '/appointments';
        }, 1000);
        return true;
      }
      
      toast.error(
(pushData as ApiResponse)?.success === false
          ? "Appointment slot not available"
          : "Something wrong occurred",
        { position: "top-center" }
      );
      return false;
    } catch (error) {
      toast.error("Failed to schedule appointment", { position: "top-center" });
      return false;
    }
  }
  return false;
};

export const prevAppointmentClient = async (
  patientid: number | string,
  setState: (data: Partial<AppointmentData>[]) => void,
  errorHandler?: (error: unknown) => void
): Promise<void> => {
  try {
    const response = await customFetch(
      `appointments/client/previous?patientid=${patientid}`
    );
    if (Array.isArray(response)) {
      setState(response);
    }
  } catch (error) {
    errorHandler?.(error);
  }
};

export const onChangePractioner = async (
  details: Practitioner,
  setAppointment: (appointment: AppointmentData) => void,
  appointment: AppointmentData,
  setMorning: (slots: string[]) => void,
  setAfternoon: (slots: string[]) => void,
  setEvening: (slots: string[]) => void
): Promise<void> => {
  try {
    setAppointment({ ...appointment, practioner: details });
    const slots = await customFetch(`appointments/practioner/slots?employeeid=${details.employeeid}`);
    
    const morning: string[] = [];
    const evening: string[] = [];
    const afternoon: string[] = [];

    if (Array.isArray(slots)) {
      slots.forEach(slot => {
        const time = parseInt(slot.split(":")[0]);
        if (time < 12) morning.push(slot);
        else if (time >= 12 && time <= 16) afternoon.push(slot);
        else evening.push(slot);
      });
    }

    setAfternoon(afternoon);
    setEvening(evening);
    setMorning(morning);
  } catch (error) {
    console.error('Failed to fetch practitioner slots:', error);
  }
};