import Add from "@mui/icons-material/Add";
import Link from "next/link";
import { useState } from "react";
import { handleChangeWithState } from "../Auth/customFetch";
import { uploadVitalSign } from "./dataActions/vitalsigns";
import PatientFiltered from "../accessories/CustomerFiltering";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useApplicationSettings } from "../Auth/useApplicationContext";

export default function RecordVitalSignsChartForm({ searchParams }) {
    const { patientid, iNewChart } = searchParams;
    const { applicationsettings } = useApplicationSettings();
    const { employeeid } = applicationsettings.user;

    const [formData, setFormData] = useState({
        blood_pressure_lowerLimit: "",
        blood_pressure_upperLimit: "",
        temperature: "",
        pulse: "",
        respiration: "",
        spo2: ""
    });

    const router = useRouter();

    const getFilteredPatient = function (options) {
        const hasPatientid = typeof options === "object" && options.hasOwnProperty('patientid');
        if (!hasPatientid) return;
        const { patientid } = options;
        router.push(`/customers/recordVitalSigns?patientid=${patientid}&&iNewChart=0`);
    };

    return (
        <div className="my-2">
            <ToastContainer position="top-center" className={'text-sm'} theme="colored" />
            <div className="d-flex justify-content-between flex-wrap">
                <div className="col-12 col-md-6 mb-2">
                    <PatientFiltered getSelectedPatient={getFilteredPatient} />
                </div>
                {patientid && iNewChart != 1 && (
                    <div className="mb-2">
                        <Link href={`/customers/recordVitalSigns?iNewChart=1&&patientid=${patientid}`}>
                            <button className="btn btn-primary btn-sm">
                                <Add /> Add new vitals
                            </button>
                        </Link>
                    </div>
                )}
            </div>
            {patientid && iNewChart == 1 && (
                <div className="my-2">
                    <h5>Vital Signs Measurement</h5>
                    <form method="POST" className="p-3 bg-body-secondary br-0 heightedBorder">
                        <div className="grid-reg">
                            <label className="pls-label">Blood Pressure</label>
                            <div className="d-flex flex-wrap">
                                <div className="col-12 col-md-6 mb-2">
                                    <input
                                        value={formData.blood_pressure_upperLimit}
                                        onChange={(ev) => handleChangeWithState(ev, 'blood_pressure_upperLimit', setFormData, formData)}
                                        className="custom-input w-100"
                                        placeholder="Upper limit"
                                        type="number"
                                        name="bpupperlimit"
                                    />
                                </div>
                                <div className="col-12 col-md-6 mb-2 ">
                                    <input
                                        value={formData.blood_pressure_lowerLimit}
                                        onChange={(ev) => handleChangeWithState(ev, 'blood_pressure_lowerLimit', setFormData, formData)}
                                        className="custom-input w-100"
                                        placeholder="Lower limit"
                                        type="number"
                                        name="bplowerlimit"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid-reg mt-2">
                            <label className="pls-label">Temperature</label>
                            <div className="col-12 col-md-2 mb-2">
                                <input
                                    min={0}
                                    max={100}
                                    value={formData.temperature}
                                    onChange={(ev) => handleChangeWithState(ev, 'temperature', setFormData, formData)}
                                    className="custom-input w-100"
                                    placeholder="Temperature"
                                    type="number"
                                    name="vtlSigntemperature"
                                />
                            </div>
                        </div>
                        <div className="grid-reg mt-2">
                            <label className="pls-label">Pulse</label>
                            <div className="col-12 col-md-2 mb-2">
                                <input
                                    className="custom-input w-100"
                                    value={formData.pulse}
                                    onChange={(ev) => handleChangeWithState(ev, 'pulse', setFormData, formData)}
                                    placeholder="Pulse"
                                    type="number"
                                    name="vtlSignpulse"
                                />
                            </div>
                        </div>
                        <div className="grid-reg mt-2">
                            <label className="pls-label">Respiration</label>
                            <div className="col-12 col-md-2 mb-2">
                                <input
                                    className="custom-input w-100"
                                    placeholder="Respiration"
                                    value={formData.respiration}
                                    onChange={(ev) => handleChangeWithState(ev, 'respiration', setFormData, formData)}
                                    type="number"
                                    name="vtlSignrespiration"
                                />
                            </div>
                        </div>
                        <div className="grid-reg mt-2">
                            <label className="pls-label">Spo2</label>
                            <div className="col-12 col-md-2 mb-2">
                                <input
                                    min={0}
                                    max={100}
                                    minLength={3}
                                    value={formData.spo2}
                                    onChange={(ev) => handleChangeWithState(ev, 'spo2', setFormData, formData)}
                                    className="custom-input w-100"
                                    placeholder="Spo2"
                                    type="number"
                                    name="vtlSignspo2"
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={(ev) => uploadVitalSign({ ...formData, patientid, employeeid }, 'POST', toast)}
                                className="btn btn-primary btn-sm"
                            >
                                Save Vital Sign
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
