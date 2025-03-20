import React, { useState } from 'react';

export default function CustomAccordion({ item }) {
    const { clientstatus, fullname, gender, age, patientid } = item;
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`list-group-item bg-white br-0 p-3`}
            style={{ backgroundColor: clientstatus === "urgent" ? 'red' : 'transparent' }} 
        >
            <div onClick={toggleAccordion} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <div className="text-capitalize">
                    {fullname} ({age} {gender})
                </div>
                <span className="accordion-icon">
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M5 11V13H19V11H5Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z" />
                        </svg>
                    )}
                </span>
            </div>
            {isOpen && (
                <div className="accordion-details">
                    <div className="d-flex justify-content-between">
                        <span>Status: {clientstatus}</span>
                        <button className="btn btn-primary btn-sm">Draw Sample</button>
                    </div>
                </div>
            )}
        </div>
    );
}
