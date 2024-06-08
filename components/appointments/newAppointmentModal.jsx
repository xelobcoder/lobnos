import { Breadcrumb } from "react-bootstrap";
import PatientFiltering from "../../components/accessories/CustomerFiltering";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Autocomplete from "react-select";
import PatientInfo from "./PatientInfoAvatarType";

import {
  inviteMethod,
  preferenceOptions,
  APPOINTMENT_DEFAULT_DATA,
  morningSlot,
  afternoonSlot,
  eveningSlot,
  patientData,
  durationOptions,
} from "../../lib/appointment";
import { getInstitutionUsers } from "../Auth/customFetch";
import SpinningLoading from "../accessories/UIAccessories/spinningLoading";


export default function NewAppointment({ patientid = null }) {
  const [appointment, setAppointment] = useState(APPOINTMENT_DEFAULT_DATA);
  const [selected, setSelected] = useState(false);
  const [patient, setPatient] = useState(patientData);
  const [employees, setEmployees] = useState([]);
  const [isloadingEmployees, setLoadingEmployes] = useState(true);

  const getSelectedPatient = (value) => {
    setPatient(value);
    setSelected(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Appointment Details:", appointment);
  };

  useEffect(() => {
    getInstitutionUsers(setEmployees, "logins", setLoadingEmployes);
  }, []);

  return (
    <section>
      <div className="d-flex justify-content-between">
        <div className="p-2">
          <Breadcrumb>
            <Breadcrumb.Item className="text-sm">Calendar</Breadcrumb.Item>
            <Breadcrumb.Item className="text-sm">Appointment List</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="col-6">
          <PatientFiltering getSelectedPatient={getSelectedPatient} />
        </div>
      </div>
      <div className="grid-50 mx-2">
        <div className="appointment-sideview">
          {selected && <PatientInfo patientdata={patient} />}
        </div>
        <div>
          <form>
            <div className="form-row w-100 mb-3">
              <label>Date of Appointment</label>
              <br />
              <div>
                <DatePicker
                  className="custom-input"
                  selected={appointment.appointment_date}
                  onChange={(date) => setAppointment({ ...appointment, appointment_date: date })}
                />
              </div>
            </div>
            <div className="form-row mb-3">
              <label>Consulting Healthcare Practitioner</label>
              <div>
                <Autocomplete
                  value={appointment.practioner}
                  onChange={(value) => setAppointment({ ...appointment, practioner: value })}
                  options={employees || []}
                  getOptionLabel={(option) => <span className="text-uppercase">{option.username}</span>}
                  getOptionValue={(option) => option.username}
                />
                {isloadingEmployees && <SpinningLoading color="text-dark" />}
              </div>
            </div>
            <div className="form-row mb-3">
              <label>Title of Appointment</label>
              <input
                value={appointment.title}
                onChange={(e) => setAppointment({ ...appointment, title: e.target.value })}
                type="text"
                className="custom-input"
              />
            </div>
            <div className="form-row mb-3">
              <label>Brief Description/Purpose</label>
              <textarea
                rows={5}
                className="form-control"
                value={appointment.purpose}
                onChange={(e) => setAppointment({ ...appointment, purpose: e.target.value })}
              />
            </div>
            <div className="form-row mb-3">
              <label>Duration (minutes)</label>
              <Autocomplete
                getOptionLabel={(option) => option.label}
                value={appointment.duration}
                onChange={(value) => setAppointment({ ...appointment, duration: value })}
                options={durationOptions}
              />
            </div>
            <div className="form-row mb-3">
              <label>Preference</label>
              <Autocomplete
                value={appointment.preference}
                getOptionLabel={(options) => options.label}
                onChange={(value) => setAppointment({ ...appointment, preference: value })}
                options={preferenceOptions}
              />
            </div>
            <div className="form-row mb-3">
              <label>Invite Method</label>
              <Autocomplete
                value={appointment.inviteMethod}
                getOptionLabel={(options) => options.label}
                onChange={(value) => setAppointment({ ...appointment, inviteMethod: value })}
                options={inviteMethod}
              />
            </div>
            <div className="form-row my-2">
              <h5>Morning Slot</h5>
              <div className="col-12">
                {morningSlot.map((item, index) => (
                  <div
                    onClick={() => setAppointment({ ...appointment, appointment_time: item })}
                    key={index}
                    className={`shadow btn btn-outline-primary border-2 p-2 rounded mx-2 my-2 ${
                      appointment.appointment_time === item ? "time-appointment-box" : ""
                    }`}>
                    {item}
                  </div>
                ))}
              </div>
              <h5>Afternoon Slot</h5>
              <div className="col-12">
                {afternoonSlot.map((item, index) => (
                  <div
                    onClick={() => setAppointment({ ...appointment, appointment_time: item })}
                    key={index}
                    className={`shadow btn btn-outline-primary border-2 p-2 rounded mx-2 my-2 ${
                      appointment.appointment_time === item ? "time-appointment-box" : ""
                    }`}>
                    {item}
                  </div>
                ))}
              </div>
              <h5>Evening Slot</h5>
              <div className="col-12">
                {eveningSlot.map((item, index) => (
                  <div
                    onClick={() => setAppointment({ ...appointment, appointment_time: item })}
                    key={index}
                    className={`shadow btn btn-outline-primary border-2 p-2 rounded mx-2 my-2 ${
                      appointment.appointment_time === item ? "time-appointment-box" : ""
                    }`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={(ev) => {
                handleFormSubmit();
              }}
              className="btn btn-primary mt-3">
              Schedule Appointment
            </button>
          </form>
        </div>
      </div>
      <div className="content">
        <p>This is the content below the dropdown.</p>
      </div>
    </section>
  );
}
