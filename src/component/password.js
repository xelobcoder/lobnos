import React from 'react';

export default function Password() {
    return (
        <div className="container-fluid">
            <div className="container">
                <div className="row">
                    <div className="col">
                        <label>enter phone number</label>
                        <input type="number" className="form-control" id="forgot-password" autoComplete="false" />
                        <button className="btn btn-primary text-small">send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
