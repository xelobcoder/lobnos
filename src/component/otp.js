import React from 'react';

export default function Otp() {
  return (
    <div>
        <form>
            <label>Please enter Otp code sent to you</label>
            <input type="number" className="form-control" id="otp" autoComplete="one-time-code" inputMode="numeric" required/>
            <button type="submit" className="btn btn-outline-primary" id="verify-otp">verify</button>
        </form>
    </div>
  );
}
