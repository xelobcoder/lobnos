import React from 'react'

export default function Validator(props) {
    return (
        <div>
            <label>validator name</label>
            <input type="text" className="form-control" id="validator" value="" required />

            <button type="submit" className= "btn-outline-primary" status="false" >save changes</button>
        </div>
    )
}
