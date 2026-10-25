import { customPost } from "../../Auth/customFetch";

export const uploadVitalSign = async function (formdata, method = 'POST', toast = null) {
    try {
        const { patientid, employeeid } = formdata;
        if (!patientid || !employeeid) return { status: false };
        let parsedObject = {};
        if (typeof formdata === "object" && Object.keys(formdata).length > 0)
            for (const [item, value] of Object.entries(formdata)) {
                if (value) {
                    parsedObject[item] = parseFloat(value)
                }
            }

        const response = await customPost(`customers/vitalsigns/create`, method, formdata);
        return response; // Return the response so caller can check status
    } catch (err) {
        toast ? toast.error('somthing wrong ocurred') : alert('somthing wrong ocurred');
        return { status: false }; // Return error status on catch
    }
}



export const NORMAL_RANGES = {
    bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },
    pulse: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    temperature: { min: 36.1, max: 37.2 }
};

export const getStatusClass = (value) => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? 'table-secondary' : '';


