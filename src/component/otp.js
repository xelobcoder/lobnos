import React from 'react';

export default function Otp() {
  return (
    <div>
        <form>
           <div className="alert alert-info">
              <ul>
                  <li>a six digit one time password would be sent to your phone number</li>
                  <li>kindly enter password within one minute</li>
              </ul>
           </div>
            <label>Please enter Otp code sent to you</label>
            <input type="number" className="form-control" id="otp" autoComplete="one-time-code" inputMode="numeric" required/>
            <button type="submit" className="btn btn-outline-primary" id="verify-otp">verify</button>
        </form>
    </div>
  );
}
