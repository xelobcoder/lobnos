import React from 'react';

export default function Literature(props) {
  return (
    <div>
        <label>Search test here</label>
        <input type="text" className="form-control" id="literature" autoCapitalize="true" autoComplete="true"/>
        <select>
            <option>full blood count</option>
        </select>
        <label>write your literature here</label>
        <textarea value={props}>
             
        </textarea>

        <button type="button" className="btn btn-outline-primary" id="litBtn">save</button>
    </div>
  );
}
