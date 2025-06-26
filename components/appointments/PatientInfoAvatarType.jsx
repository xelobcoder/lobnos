import React from "react";
import { 
    RiStickyNoteLine, 
    RiMailLine, 
    RiPhoneLine, 
    RiTaskLine, 
    RiGroupLine, 
    RiMoreFill 
} from '@remixicon/react';

export default function PatientInfo({ patientdata = {} }) {
  const { firstname, middlename, lastname, email, gender, age, mobile_number, age_Type } = patientdata;

  const formatInitials = () => {
    const initials = `${firstname}`.charAt(0) + `${middlename}`.charAt(0) + `${lastname}`.charAt(0);
    return initials.trim().toUpperCase();
  };
  return (
    <div className="contact-card w-100 ui">
      <div className="contact-header">
        <div className="contact-avatar">{formatInitials(patientdata)}</div>
        <div className="contact-info">
          <h2 className="text-capitalize">{firstname} {middlename} {lastname}</h2>
          <p className="text-capitalize">Midwife</p>
          <p>{`${email}`.charAt(0).toUpperCase()}{`${email}`.slice(1)}</p>
        </div>
      </div>
      <div className="contact-info">
        <div className="w-100 my-1">
          Age: {age} {age_Type}
        </div>
        <div className="w-100 my-1">Contact: {mobile_number}</div>
      </div>
      <div className="d-flex">
        <button className="btn btn-outline-primary shadow border-2">
          <RiStickyNoteLine className="me-1" /> Note
        </button>
        <button className="btn btn-outline-primary shadow mx-2 border-2">
          <RiMailLine className="me-1" /> Email
        </button>
        <button className="btn btn-outline-primary shadow mx-2 border-2">
          <RiPhoneLine className="me-1" /> Call
        </button>
        <button className="btn btn-outline-primary shadow mx-2 border-2">
          <RiTaskLine className="me-1" /> Task
        </button>
        <button className="btn btn-outline-primary shadow mx-2 border-2">
          <RiGroupLine className="me-1" /> Meeting
        </button>
        <button className="btn btn-outline-primary shadow mx-2 border-2">
          <RiMoreFill className="me-1" /> More
        </button>
      </div>
    </div>
  );
}
