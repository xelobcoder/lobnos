import { customPost } from "../../Auth/customFetch";

export const uploadVitalSign = async function (formdata, method = 'POST', toast = null) {
    try {
        const { patientid, employeeid } = formdata;
        if (!patientid || !employeeid) return;
        let parsedObject = {};
        if (typeof formdata === "object" && Object.keys(formdata).length > 0)
            for (const [item, value] of Object.entries(formdata)) {
                if (value) {
                    parsedObject[item] = parseFloat(value)
                }
            }

        const response = await customPost(`customers/vitalsigns/create`, method, formdata);
        const { status } = response;
        status == true ? toast.success("vital sign recorded successfully") : toast.error("somthing wrong occured. upload failed")
    } catch (err) {
        toast.error('somthing wrong ocurred');
    }
}



export const NORMAL_RANGES = {
    bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },
    pulse: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    temperature: { min: 36.1, max: 37.2 }
};

export const getStatusClass = (value, range) => {
    if (value < range.min || value > range.max) return 'table-danger';
    return 'table-success';
};

