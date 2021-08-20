import React from 'react';
import Comment from '../../comment';
import Validator from '../../validator';

export default function FBS() {
    return (
        <div>
            <header>Fasting Blood Glucose</header>
            <label>FBS</label>
            <input className="form-control" id="fbs" required type="number" />
            <Comment/>
            <Validator/>
            <button type="submit" className="btn btn-outline-primary" >save</button>
        </div>
    )
}
