import React from 'react'

export default function Syphilis(props) {
    return (
        <div>
            <label>Syphilis(VDRL)</label>
            <select className="form-control" id="vdrl">
                <option type="reactive">reactive</option>
                <option type="non reactive">Non reactive</option>
            </select>
        </div>
    )
}
