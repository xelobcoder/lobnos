import React from 'react';
import Comment from '../../comment';
import Validator from '../../validator';

export default function GlycatedHemaglobin() {
    return (
        <div>
            <header>Glycated Hemaglobin</header>
            <label>HbAIc(%)</label>
            <input type="number" className="form-control" id="hbiac" required/>
            <label>eAG</label>
            <input type="number" className="form-control" id="eAG" required/>
            <Comment/>
            <Validator/>
            <button className="btn btn-outline-priamry" type="submit" >save</button>
        </div>
    )
}
