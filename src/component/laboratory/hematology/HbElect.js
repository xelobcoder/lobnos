import React from 'react'

export default function HBElectrophoresis() {
    return (
        <div>
            <label>HB Electrophoresis</label>
            <select className="form-control" id="electrophoresis">
                <option option="AA">AA</option>
                <option option="AS">AS</option>
                <option option="SS">SS</option>
                <option option="SC">SC</option>
                <option option="CC">CC</option>
                <option option="Beta Thalessiamia">Beta Thal-S</option>
                <option option="AF">AF</option>
                <option option="SF">SF</option>
                <option option="ASF">ASF</option>
            </select>
        </div>
    )
}
