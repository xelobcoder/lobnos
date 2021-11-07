import React from 'react';

export default function Password() {
    return (
        <div className="container-fluid">
            <div className="container">
                <div className="row">
                    <div className="col" id="password-change-wrapper">
                        <div>
                             <label>Enter mobile number</label>
                             <div>
                                <input type="tel" className="form-control mt-3 mr-3" placeholder="digits..." id="forgot-password" autoComplete="false" />
                                <button className="btn btn-primary text-small mt-3">send</button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
