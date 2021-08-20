import React from 'react';
import Validator from './validator';

export default function Widal(props) {
    return (
        <div>
           <div>
                <label>O</label>  
                <input type="number" className="form-control" value="" id="o" required />
           </div>
           <div>
                <label>H</label>  
                <input type="number" className="form-control" value="" id="h" required />
           </div>
           <Validator/>
        </div>
    )
}
