export default function TrackAlertLevelValueForm({ field, setField }) {
    return (
        <div className="my-4" >
            <form id="trackalertlevelvalue">
                <div className="form-row">
                    <input type="checkbox" /> Track value(es) of parameter
                </div>
                <div className="form-row grid-30-30-30">
                    <div className="form-group">
                        <label>value</label>
                        <input type="text" className="custom-input" />
                    </div>
                    <div className="form-group mx-2">
                        <label>constraits</label>
                        <select className="custom-select">
                            <option value={0}>select an option here</option>
                            <option value={1}>less than value</option>
                            <option value={2}>greater than value</option>
                            <option value={3}>match value</option>
                            <option value={4}>does not match</option>
                        </select>
                    </div>
                    <div className="form-group mx-2">
                        <label>value</label>
                        <select className="custom-select">
                            <option>select an option below</option>
                            <option value={1}>alert</option>
                            <option value={2}>do not alert</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    )
}