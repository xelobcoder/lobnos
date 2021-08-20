import React from 'react';
import Validator from '../../validator';
import Comment from '../../comment';

export default function Bloodgrouping() {
    return (
        <div>
            <header>Blood Grouping</header>
            <label>blood group</label>
            <select>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
            </select>
            <label>Rhesus</label>
            <select>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
            </select>
            <Validator/>
            <Comment/>
            <button type="button" className ="btn btn-outline-primary" >save</button>
        </div>
    )
}
