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

export const morningSlot = [
     "08:00",
     "08:30",
     "09:00",
     "09:30",
     "10:00",
     "10:30",
     "11:00",
     "11:30"
];

export const afternoonSlot = [
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

export const eveningSlot = [
     "18:00",
     "18:30",
     "19:00",
     "19:30",
     "20:00"
];



export const durationOptions = [
     { value: 30, label: "30 minutes" },
     { value: 60, label: "60 minutes" },
     { value: 90, label: "1 hour 30 minutes" },
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
export const preferenceOptions = [
     { value: "in person", label: "In Person" },
     { value: "zoom", label: "Zoom" },
     { value: "google meet", label: "Google Meet" }
];

export const handleSubmitForm = async (data, toast) => {
     if (typeof data == "object") {
          const practioner = data.practioner.employeeid;
          const inviteMethod = data.inviteMethod.value;
          const preference = data.preference.value;
          const duration = data.duration.value;
          var request_data = { ...data, practioner, inviteMethod, duration, preference }
          const is_string_empty = Object.entries(request_data).filter((a, i) => a[1].toString().length <= 1).length;
          if (is_string_empty > 0) return false;
          const pushData = await customPost(`appointments/create`, 'POST', request_data);
          if (pushData?.success == true) {
               toast.success("Appointment scheduled successfully", { position: "top-center" })
               setTimeout(() => {
                    window.location.href = '/appointments'
               }, 1000);
          } else {
               if (pushData?.success == false) {
                    toast.error("Appointment slot not available ", 3000)
               } else {
                    toast.error("something wrong occured", { position: "top-center" })
               }
          }
     }
}


export const prevAppointmentClient = async (patientid, setState) => {
     const response = await customFetch(`appointments/client/previous?patientid=${patientid}`);
     if (Array.isArray(response)) { setState(response) }
}


export const onChangePractioner = async (details, setAppointment, appointment, m, a, e) => {
     const { employeeid } = details;
     setAppointment({ ...appointment, practioner: details });
     const slots = await customFetch(`appointments/practioner/slots?employeeid=${employeeid}`);
     const morning = [];
     const evening = [];
     const afternoon = [];

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