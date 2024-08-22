// 'use server'
export async function CreateNewVitals(formData) {
    const vitals = {
        blood_pressure_upperLimit: formData.get("bpupperlimit"),
        blood_pressure_lowerLimit: formData.get("bplowerlimit"),
        temperature: formData.get("vtlSigntemperature"),
        pulse: formData.get("vtlSignpulse"),
        respiration: formData.get("vtlSignrespiration"),
        spo2: formData.get("vtlSignspo2"),
    }
    console.log(patientid);
}
