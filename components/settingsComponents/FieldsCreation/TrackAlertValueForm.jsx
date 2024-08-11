import { useState } from "react"
import { handleChangeWithState } from "../../Auth/customFetch"

export default function TrackAlertLevelValueForm({ field, setField }) {
    const [showTrack, setShowTrack] = useState(false);
    return (
        <div className="my-4" >
            <form id="trackalertlevelvalue">
                <div className="form-row">
                    <input onChange={(ev) => { ev.target.checked ? setShowTrack(true) : setShowTrack(false) }} type="checkbox" /> Track value(es) of parameter
                </div>
                {showTrack && (
                    <div className="form-row grid-30-30-30">
                        <div className="form-group">
                            <label>value</label>
                            <input type="text"
                                onChange={(ev) => { handleChangeWithState(ev, 'valueAlert', setField, field) }}
                                className="custom-input" value={field.valueAlert} />
                        </div>
                        <div className="form-group mx-2">
                            <label>constraits</label>
                            <select onChange={(ev) => { handleChangeWithState(ev, 'constraint', setField, field) }} value={field.constraint} className="custom-select">
                                <option value={0}>select an option here</option>
                                <option value={1}>less than value</option>
                                <option value={2}>greater than value</option>
                                <option value={3}>match value</option>
                                <option value={4}>does not match value</option>
                            </select>
                        </div>
                        <div className="form-group mx-2">
                            <label>value</label>
                            <select onChange={(ev) => { handleChangeWithState(ev, 'alert', setField, field) }} value={field.alert} className="custom-select">
                                <option>select an option below</option>
                                <option value={1}>alert</option>
                                <option value={2}>do not alert</option>
                            </select>
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}