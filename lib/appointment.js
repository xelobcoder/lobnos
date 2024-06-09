import { customFetch, customPost } from "../components/Auth/customFetch";

export const loadOptions = async (input = '') => {
     if (input.length >= 3 && (typeof input === 'string' || typeof input == "number")) {
          const result = await customFetch(`patients/filter?filter=${input}`);
          return Array.isArray(result) && result.length > 0 ? result : []
     }
}

export
     const APPOINTMENT_DEFAULT_DATA = {
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

export const morningSlot = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
export const afternoonSlot = [
     "12:00 PM",
     "12:30 PM",
     "1:00 PM",
     "1:30 PM",
     "2:00 PM",
     "2:30 PM",
     "3:00 PM",
     "3:30 PM",
     "4:00 PM",
     "4:30 PM",
     "5:00 PM",
     "5:30 PM",
];

export const eveningSlot = [
     "6:00 PM",
     "6:30 PM",
     "7:00 PM",
     "7:30 PM",
     "8:00 PM",
]
export const preferenceOptions = [
     { value: "in person", label: "In Person" },
     { value: "zoom", label: "Zoom" },
     { value: "google meet", label: "Google Meet" },
];

export const durationOptions = [
     { value: 15, label: "15 minutes" },
     { value: 30, label: "30 minutes" },
     { value: 45, label: "45 minutes" },
     { value: 60, label: "60 minutes" },
     { value: 120, label: "2 hours" }
];

export const patientData = {
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

export const inviteMethod = [
     { value: "sms", label: "sms" },
     { value: "email", label: "email" },
     { value: "whatapp", label: "whatapp" },
];


export const handleSubmitForm = async (data) => {
     if (typeof data == "object") {
          const practioner = data.practioner.employeeid;
          const inviteMethod = data.inviteMethod.value;
          const preference = data.preference.value;
          const duration = data.duration.value;
          var request_data = { ...data, practioner, inviteMethod, duration, preference }
          const is_string_empty = Object.entries(request_data).filter((a, i) => a[1].toString().length <= 1).length;
          if (is_string_empty > 0) return false;
          const pushData = await customPost(`appointments/create`, 'POST', request_data);
          console.log(pushData);
     }
}


export const prevAppointmentClient = async (patientid, setState) => {
     const response = await customFetch(`appointments/client/previous?patientid=${patientid}`);
     if (Array.isArray(response)) { setState(response) }
}