"use client";
import React, { useState } from 'react';
import { RiCake2Line, RiMailLine, RiMessage2Line } from '@remixicon/react';

export default function BirthdaySettings() {
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const handleSmsToggle = () => {
        setSmsEnabled(!smsEnabled);
    };

    const handleEmailToggle = () => {
        setEmailEnabled(!emailEnabled);
    };

    return (
        <div className="container py-5">
             <div className="setting-section mb-4 p-3 border rounded">
                                <div className="d-flex align-items-center mb-3">
                                    <RiMessage2Line className="text-primary me-2 fs-4" />
                                    <h2 className="h5 mb-0">SMS Notifications</h2>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="smsEnabled"
                                        checked={smsEnabled}
                                        onChange={handleSmsToggle}
                                    />
                                    <label className="form-check-label ms-2" htmlFor="smsEnabled">
                                        Enable SMS notifications for birthdays
                                    </label>
                                </div>
                                <small className="text-muted d-block mt-2">
                                    Receive SMS notifications when it's someone's birthday
                                </small>
                            </div>

                            <div className="setting-section p-3 border rounded">
                                <div className="d-flex align-items-center mb-3">
                                    <RiMailLine className="text-primary me-2 fs-4" />
                                    <h2 className="h5 mb-0">Email Notifications</h2>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="emailEnabled"
                                        checked={emailEnabled}
                                        onChange={handleEmailToggle}
                                    />
                                    <label className="form-check-label ms-2" htmlFor="emailEnabled">
                                        Enable email notifications for birthdays
                                    </label>
                                </div>
                                <small className="text-muted d-block mt-2">
                                    Receive email notifications when it's someone's birthday
                                </small>
                            </div>
        </div>
    );
}
