import PatientFiltering from "../../components/accessories/SectorFileringComponents/CustomerFiltering";
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
	handleSubmitForm,
	loadOptions,
	onChangePractioner,
} from "../../lib/appointment";
import { getInstitutionUsers } from "../Auth/customFetch";
import SpinningLoading from "../accessories/UIAccessories/spinningLoading";
import { useSearchParams } from "next/navigation";
import AppointmentSlots from "./DisplayAppointmentSlot";
import { ToastContainer, toast } from "react-toastify";
import { Container } from "react-bootstrap";

export default function NewAppointment() {
	const [appointment, setAppointment] = useState(APPOINTMENT_DEFAULT_DATA);
	const [selected, setSelected] = useState(false);
	const [patient, setPatient] = useState(patientData);
	const [evening_slots, setEvening] = useState(eveningSlot);
	const [morning, setMorning] = useState(morningSlot);
	const [afternoon, setAfternoon] = useState(afternoonSlot);
	const [employees, setEmployees] = useState([]);
	const [isloadingEmployees, setLoadingEmployes] = useState(true);
	const searchedPatientid = useSearchParams().get("patientid");
	const [disableFilter, setDisableFilter] = useState(false);

	const getSelectedPatient = (value) => {
		if (typeof value == "object" && "patientid" in value) {
			setPatient(value);
			setSelected(true);
		}
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		handleSubmitForm({ ...appointment, patientid: patient.patientid }, toast);
	};

	useEffect(() => {
		getInstitutionUsers(setEmployees, "logins", setLoadingEmployes);
	}, []);

	useEffect(() => {
		if (searchedPatientid) {
			loadOptions(searchedPatientid)
				.then((user) => {
					setPatient(user[0]);
					setSelected(true);
				})
				.catch((err) => {
					console.log(err, "err");
				})
				.finally(() => {
					setDisableFilter(true);
				});
		}
	}, [searchedPatientid]);

	const handleSlotClick = (value) => {
		setAppointment({ ...appointment, appointment_time: value });
	};

	return (
		<><ToastContainer theme="colored" /><section>
			<div className="d-flex justify-content-between my-2">

			</div>
			<Container>
				<div className="col-6">
					<PatientFiltering getSelectedPatient={getSelectedPatient} isDisabled={disableFilter} />
				</div>
				<div >
					<div className="col-6">
						{/* <div>{selected && <PatientInfo patientdata={patient} />}</div> */}
						<div className="form-row w-100 mb-3">
							<label>Date of Appointment</label>
							<br />
							<div>
								<DatePicker
									className="custom-input"
									selected={appointment.appointment_date}
									onChange={(date) => setAppointment({ ...appointment, appointment_date: date })} />
							</div>
						</div>
						<div className="form-row mb-3">
							<label>Consulting Healthcare Practitioner</label>
							<div>
								<Autocomplete
									value={appointment.practioner}
									onChange={(value) => {
										onChangePractioner(value, setAppointment, appointment, setMorning, setAfternoon, setEvening);
									}}
									options={employees || []}
									getOptionLabel={(option) => <span className="text-uppercase">{option.username}</span>}
									getOptionValue={(option) => option.username} />
								{isloadingEmployees && <SpinningLoading color="text-dark" />}
							</div>
						</div>
						<div className="form-row mb-3">
							<label>Title of Appointment</label>
							<input
								value={appointment.title}
								onChange={(e) => setAppointment({ ...appointment, title: e.target.value })}
								type="text"
								className="custom-input" />
						</div>
						<div className="form-row mb-3">
							<label>Brief Description/Purpose</label>
							<textarea
								rows={5}
								className="form-control"
								value={appointment.purpose}
								onChange={(e) => setAppointment({ ...appointment, purpose: e.target.value })} />
						</div>
						<div className="form-row">
							<label>Duration (minutes)</label>
							<Autocomplete
								getOptionLabel={(option) => option.label}
								value={appointment.duration}
								onChange={(value) => setAppointment({ ...appointment, duration: value })}
								options={durationOptions} />
						</div>
					</div>
					<div className="col-6">
						<div className="form-row mb-3">
							<label>Preference</label>
							<Autocomplete
								value={appointment.preference}
								getOptionLabel={(options) => options.label}
								onChange={(value) => setAppointment({ ...appointment, preference: value })}
								options={preferenceOptions} />
						</div>
						<div className="form-row">
							<label>Invite Method</label>
							<Autocomplete
								value={appointment.inviteMethod}
								getOptionLabel={(options) => options.label}
								onChange={(value) => setAppointment({ ...appointment, inviteMethod: value })}
								options={inviteMethod} />
						</div>
						<div className="form-row my-2">
							{<AppointmentSlots handleClick={handleSlotClick} title={"Morning"} appointment={appointment} slot={morning} />}
							{<AppointmentSlots handleClick={handleSlotClick} title={"Afternoon"} appointment={appointment} slot={afternoon} />}
							{<AppointmentSlots handleClick={handleSlotClick} title={"Evening"} appointment={appointment} slot={evening_slots} />}
						</div>
						<button
							type="button"
							disabled={morning.length === 0 && afternoon.length === 0 && evening_slots.length === 0}
							onClick={(ev) => {
								handleFormSubmit(ev);
							}}
							className="btn btn-primary mt-3">
							Schedule Appointment
						</button>
					</div>
				</div>
			</Container>
		</section></>
	);
}
