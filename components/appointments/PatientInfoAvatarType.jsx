import React from "react";
import NoteIcon from "@mui/icons-material/Note";
import EmailIcon from "@mui/icons-material/Email";
import CallIcon from "@mui/icons-material/Call";
import TaskIcon from "@mui/icons-material/Task";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function PatientInfo({ patientdata }) {
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
      <div className="contact-actions">
        <button>
          <NoteIcon /> Note
        </button>
        <button>
          <EmailIcon /> Email
        </button>
        <button>
          <CallIcon /> Call
        </button>
        <button>
          <TaskIcon /> Task
        </button>
        <button>
          <MeetingRoomIcon /> Meeting
        </button>
        <button>
          <MoreHorizIcon /> More
        </button>
      </div>
    </div>
  );
}
