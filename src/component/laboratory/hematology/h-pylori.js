import React from 'react'

export default function Helicobacter() {
    return (
        <div>
            <headers>Helicobacter pylori(H-pylori)</headers>
            <label>Sample type</label>
            <select className="form-control" id="sample">
               <option type="stool">stool</option>
               <option type="blood">blood</option>
            </select>
            <label>Result</label>
            <select className="form-control" id="Hpylori">
                <option type="reactive">reactive</option>
                <option type="non reactive">Non reactive</option>
            </select>
        </div>
    )
}
