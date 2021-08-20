import React from 'react';
import Validator from '../../validator';
import Comment from '../../comment';

export default function Esr() {
    return (
        <div>
            <header>Erthrocyte sedimentation rate</header>
            <label>ESR</label>
            <input type="number" className="form-control" required id="esr" />
            <Comment/>
            <Validator/>
            <button className="btn btn-outline-primary" id="save" type="submit">save</button>
        </div>
    )
}
