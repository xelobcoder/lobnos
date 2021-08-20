import React from "react";
import Comment from "../../comment";

export default function Cardiac(props) {
    return (
        <div>
            <header>Cardiac enzymes</header>
            <label>ck(total)</label>
            <input type="number" className="form-control" id="ck-total" required />
            <label>ck-mb</label>
            <input type="number" className="form-control" id="ck-mb" required />
            <label>ldh</label>
            <input type="number" className="form-control" id="ldh" required/>
            <label>myoglobin</label>
            <input type="number" className="form-control" id ="myoglobin" required/>
            <label>troponin</label>
            <input type="number" className="form-control"  id="troponin" required/>
            <Comment/>
            <button type="button" className="btn btn-outline-primary" id="save-in-cardiac">save</button>
        </div>
    )
}
