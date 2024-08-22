import { Add } from "@mui/icons-material";
import Link from "next/link";
import { useTheme } from "../Auth/useAuthentification";


export default function RecordVitalSignsChartForm() {
    const { employeeid } = useTheme();
    

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between">
                <div>
                    <Link href={'/customers/recordVitalSigns?iNewChart=1'}>
                        <button className="btn btn-primary btn-sm">
                            <Add />
                            Add new vitals
                        </button>
                    </Link>
                </div>
                <div>
                    <input type="number" className="custom-input" placeholder="search using patientid" name="patientid" />
                </div>
            </div>
            <h4>Vital Signs Measurement</h4>
            <hr />
            <form method="POST" className="border p-3 bg-secondary-subtle br-5">
                <div className="grid-reg">
                    <label>Blood Pressure</label>
                    <div className="d-flex">
                        <div className="col-2">
                            <input className="custom-input " placeholder="upper limit" type="number" name="bpupperlimit" />
                        </div>
                        <div className="mx-2 col-2">
                            <input placeholder="lower limt" className="custom-input" type="number" name="bplowerlimit" />
                        </div>
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>temperature</label>
                    <div className="col-2">
                        <input className="custom-input" placeholder="temperature" type="number" name="vtlSigntemperature" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>Pulse</label>
                    <div className="col-2">
                        <input className="custom-input" placeholder="Pulse" type="number" name="vtlSignpulse" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>Respiration</label>
                    <div className="col-2">
                        <input className="custom-input" placeholder="Respiration" type="number" name="vtlSignrespiration" />
                    </div>
                </div>
                <div className="grid-reg mt-2">
                    <label>spo2</label>
                    <div className="col-2">
                        <input min={0} max={100} minLength={3} className="custom-input" placeholder="Spo2" type="number" name="vtlSignspo2" />
                    </div>
                </div>
                <div>
                    <button type="button" className="btn btn-primary btn-sm">
                        save vital sign
                    </button>
                </div>
            </form>
            <hr />
            <div className="bg-secondary-subtle p-3 br-5">
                <form>
                    <div className="d-flex col-6">
                        <div>
                            <input className="custom-input" type="date" placeholder="from" name="filterFrom" />
                        </div>
                        <div>
                            <input className="custom-input mx-2" type="date" placeholder="to" name="filterTo" />
                        </div>
                        <div>
                            <button className="btn btn-secondary  mx-3">filter</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>)
}

