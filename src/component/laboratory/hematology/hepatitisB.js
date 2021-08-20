import React from 'react'

export default function HepatitisB() {
    return (
        <div>
            <label>hepatitis B virus(HBsAg)</label>
            <select className="form-control" id="hepatitisB">
                <option type="reactive">reactive</option>
                <option type="non reactive">Non reactive</option>
            </select>
        </div>
    )
}
