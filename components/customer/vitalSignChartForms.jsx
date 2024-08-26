import { Add } from "@mui/icons-material";
import Link from "next/link";
import { useContext, useState } from "react";
import AuthContext from "../Auth/useAuthentification";
import { handleChangeWithState } from "../Auth/customFetch";
import { uploadVitalSign } from "./dataActions/vitalsigns";


export default function RecordVitalSignsChartForm({ searchParams }) {
    const { patientid } = searchParams;
    const { auth } = useContext(AuthContext);
    const employeeid = auth.employeeid;
    const [formData, setFormData] = useState({ blood_pressure_lowerLimit: "", blood_pressure_upperLimit: "", temperature: "", pulse: "", respiration: "", spo2: ""})

    return (
        <div className="p-4">
            {!patientid && (
                <div className="d-flex justify-content-between">
                    <div>
                        <input type="number" className="custom-input" placeholder="search using patientid" name="patientid" />
                    </div>
                    <div>
                        <Link href={'/customers/recordVitalSigns?iNewChart=1'}>
                            <button className="btn btn-primary btn-sm">
                                <Add />Add new vitals
                            </button>
                        </Link>
                    </div>
                </div>
            )}
            <h4>Vital Signs Measurement</h4>
            <hr />
            <form method="POST" className="border p-3 bg-secondary-subtle br-5">
                <div className="grid-reg">
                    <label>Blood Pressure</label>
                    <div className="d-flex">
                        <div className="col-2">
                            <input value={formData.blood_pressure_upperLimit}
                                onChange={(ev) => { handleChangeWithState(ev, 'blood_pressure_upperLimit', setFormData, formData) }} className="custom-input " placeholder="upper limit" type="number" name="bpupperlimit" />
                        </div>
                        <div className="mx-2 col-2">
                            <input value={formData.blood_pressure_lowerLimit}
                                onChange={(ev) => { handleChangeWithState(ev, 'blood_pressure_lowerLimit', setFormData, formData) }} placeholder="lower limt" className="custom-input" type="number" name="bplowerlimit" />
                        </div>
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>temperature</label>
                    <div className="col-2">
                        <input
                            min={0}
                            max={100}
                            value={formData.temperature}
                            onChange={(ev) => { handleChangeWithState(ev, 'temperature', setFormData, formData) }}
                            className="custom-input" placeholder="temperature" type="number" name="vtlSigntemperature" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>Pulse</label>
                    <div className="col-2">
                        <input className="custom-input" value={formData.pulse}
                            onChange={(ev) => { handleChangeWithState(ev, 'pulse', setFormData, formData) }} placeholder="Pulse" type="number" name="vtlSignpulse" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>Respiration</label>
                    <div className="col-2">
                        <input className="custom-input" placeholder="Respiration" value={formData.respiration}
                            onChange={(ev) => { handleChangeWithState(ev, 'respiration', setFormData, formData) }} type="number" name="vtlSignrespiration" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>spo2</label>
                    <div className="col-2">
                        <input min={0} max={100} minLength={3} value={formData.spo2}
                            onChange={(ev) => { handleChangeWithState(ev, 'spo2', setFormData, formData) }} className="custom-input" placeholder="Spo2" type="number" name="vtlSignspo2" />
                    </div>
                </div>
                <div>
                    <button type="button" onClick={(ev) => { uploadVitalSign({...formData, patientid, employeeid }) }} className="btn btn-primary btn-sm">
                        save vital sign
                    </button>
                </div>
            </form>
        </div>)
}

