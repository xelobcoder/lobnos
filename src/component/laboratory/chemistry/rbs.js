import React from 'react';
import Comment from '../../comment';
import Validator from '../../validator';

export default function RBS() {
    return (
        <div>
            <header>Random Blood Glucose</header>
            <label>RBS</label>
            <input className="form-control" id="rbs" required type="number" />
            <Comment/>
            <Validator/>
            <button type="submit" className="btn btn-outline-primary" >save</button>
        </div>
    )
}
