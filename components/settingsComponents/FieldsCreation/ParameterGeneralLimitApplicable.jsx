export default function ParameterGeneralLimitApplicable({ setField, field }) {
    return (<div >
        <label>Upper Limit</label>
        <div className="d-flex justify-content-between">
            <input
                placeholder="Upper limit"
                type="number"
                onChange={(ev) => {
                    setField({ ...field, upperlimit: ev.target.value })
                }}
                value={field.upperlimit}
                className="custom-input"
            />
            <input
                placeholder="Lower limit"
                type="number"
                onChange={(ev) => {
                    setField({ ...field, lowerlimit: ev.target.value })
                }}
                value={field?.lowerlimit}
                className="custom-input mx-2"
            />
        </div>
    </div>)
}