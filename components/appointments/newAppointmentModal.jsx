import PatientFiltering from "../../components/accessories/SectorFileringComponents/CustomerFiltering";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Autocomplete from "react-select";

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
	isWorkflowAppointmentType,
	loadAppointmentServices,
} from "../../lib/appointment";
import { customFetch, getInstitutionUsers, reactSelectCustomStyles } from "../Auth/customFetch";
import SpinningLoading from "../accessories/UIAccessories/spinningLoading";
import { useSearchParams } from "next/navigation";
import AppointmentSlots from "./DisplayAppointmentSlot";
import { ToastContainer, toast } from "react-toastify";
import { Container } from "react-bootstrap";
import { useApplication } from "../Auth/useApplicationContext";

export default function NewAppointment() {
	const [appointment, setAppointment] = useState(APPOINTMENT_DEFAULT_DATA);
	const [patient, setPatient] = useState(patientData);
	const [evening_slots, setEvening] = useState(eveningSlot);
	const [morning, setMorning] = useState(morningSlot);
	const [afternoon, setAfternoon] = useState(afternoonSlot);
	const [employees, setEmployees] = useState([]);
	const [leads, setLeads] = useState([]);
	const [contactType, setContactType] = useState("patient");
	const [isloadingEmployees, setLoadingEmployes] = useState(true);
	const searchParams = useSearchParams();
	const searchedPatientid = searchParams.get("patientid");
	const searchedLeadId = searchParams.get("lead_id");
	const appointmentDate = searchParams.get("appointment_date");
	const appointmentType = searchParams.get("appointment_type");
	const [disableFilter, setDisableFilter] = useState(false);
	const employeeid = useApplication()?.user?.employeeid;
	const [services, setServices] = useState([]);
	const [loadingServices, setLoadingServices] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const workflowType = isWorkflowAppointmentType(appointment.appointment_type) ? appointment.appointment_type : null;
	const selectedServices = services.filter((service) => (appointment.service_ids || []).includes(service.id));
	const selectedTotal = selectedServices.reduce((sum, service) => sum + (Number(service.price) || 0), 0);

	useEffect(() => {
		if (!workflowType) {
			setServices([]);
			return;
		}
		let active = true;
		setLoadingServices(true);
		loadAppointmentServices(workflowType)
			.then((items) => { if (active) setServices(items); })
			.catch(() => { if (active) toast.error("Services could not be loaded for this appointment type."); })
			.finally(() => { if (active) setLoadingServices(false); });
		return () => { active = false; };
	}, [workflowType]);

	const getSelectedPatient = (value) => {
		if (typeof value == "object" && "patientid" in value) {
			setPatient(value);
		}
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (submitting) return;
		if (!employeeid) return toast.error("Employee ID is required to schedule an appointment", { position: "top-center" });
		setSubmitting(true);
		try {
			await handleSubmitForm({
				...appointment,
				patientid: contactType === "patient" ? patient.patientid : null,
				lead_id: contactType === "lead" ? Number(appointment.lead_id) : null,
				service_ids: workflowType ? appointment.service_ids || [] : [],
				employeeid
			}, toast);
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		getInstitutionUsers(setEmployees, "logins", setLoadingEmployes);
	}, []);

	useEffect(() => {
		if (searchedPatientid) {
			loadOptions(searchedPatientid, "patientid")
				.then((user) => {
					setPatient(user[0]);
				})
				.catch((err) => {
					console.log(err, "err");
				})
				.finally(() => {
					setDisableFilter(true);
				});
		}
	}, [searchedPatientid]);

	useEffect(() => {
		if (appointmentDate) {
			const [year, month, day] = appointmentDate.split("-").map(Number);
			if (year && month && day) {
				setAppointment((current) => ({ ...current, appointment_date: new Date(year, month - 1, day) }));
			}
		}
		if (appointmentType && ["consultation", "laboratory", "ultrasound", "follow_up"].includes(appointmentType)) {
			setAppointment((current) => ({ ...current, appointment_type: appointmentType }));
		}
		if (searchedLeadId) {
			setContactType("lead");
			setAppointment((current) => ({ ...current, lead_id: Number(searchedLeadId) }));
		}
	}, [appointmentDate, appointmentType, searchedLeadId]);

	useEffect(() => {
		if (contactType !== "lead" || !employeeid) return;
		customFetch(`leads?employeeid=${employeeid}&page=1&count=100&sortby=DESC`)
			.then((response) => {
				const items = response?.data?.data;
				if (response?.success && Array.isArray(items)) setLeads(items);
				else setLeads([]);
			})
			.catch((error) => {
				console.error("Unable to load CRM leads for appointment booking:", error);
				toast.error("CRM leads could not be loaded.");
			});
	}, [contactType, employeeid]);

	const handleSlotClick = (value) => {
		setAppointment({ ...appointment, appointment_time: value });
	};

	return (
		<>
			<section>
				<div className="d-flex justify-content-between my-2">

				</div>
				<Container>
					<div className="col-6 mb-3">
						<label htmlFor="appointment-type">Appointment workflow</label>
						<select
							id="appointment-type"
							className="form-select"
							value={appointment.appointment_type || "consultation"}
							onChange={(event) => setAppointment({
								...appointment,
								appointment_type: event.target.value,
								billingid: null,
								service_ids: []
							})}>
							<option value="consultation">Consultation</option>
							<option value="laboratory">Laboratory</option>
							<option value="ultrasound">Ultrasound</option>
							<option value="follow_up">CRM follow-up</option>
						</select>
					</div>
					<div className="col-6 mb-3">
						<label htmlFor="appointment-contact-type">Link appointment to</label>
						<select
							id="appointment-contact-type"
							className="form-select"
							value={contactType}
							onChange={(event) => {
								setContactType(event.target.value);
								setPatient(patientData);
								setAppointment((current) => ({
									...current,
									patientid: null,
									lead_id: null,
									billingid: null
								}));
							}}>
							<option value="patient">Patient</option>
							<option value="lead">CRM lead</option>
						</select>
					</div>
					<div className="col-6">
						{contactType === "patient" ? (
							<PatientFiltering getSelectedPatient={getSelectedPatient} isDisabled={disableFilter} />
						) : (
							<div className="form-row mb-3">
								<label htmlFor="appointment-lead">CRM lead</label>
								<select
									id="appointment-lead"
									className="form-select"
									value={appointment.lead_id || ""}
									onChange={(event) => setAppointment({ ...appointment, lead_id: event.target.value ? Number(event.target.value) : null })}>
									<option value="">Select a lead</option>
									{leads.map((lead) => (
										<option key={lead.id} value={lead.id}>
											{[lead.firstname, lead.lastname].filter(Boolean).join(" ") || lead.company_name || lead.contact_person || `Lead #${lead.id}`}
										</option>
									))}
								</select>
								{leads.length === 0 && <small className="text-muted">No CRM leads were found for your account.</small>}
							</div>
						)}
						{workflowType && (
							<div className="form-row mb-3">
								<label htmlFor="appointment-services">
									{workflowType === "ultrasound" ? "Ultrasound scans" : "Laboratory tests"} to perform
								</label>
								<Autocomplete
									inputId="appointment-services"
									isMulti
									isLoading={loadingServices}
									styles={reactSelectCustomStyles}
									options={services}
									value={selectedServices}
									getOptionLabel={(option) => `${option.name} — ${Number(option.price || 0).toFixed(2)}`}
									getOptionValue={(option) => String(option.id)}
									onChange={(values) => setAppointment({
										...appointment,
										service_ids: (values || []).map((value) => value.id)
									})}
									placeholder={loadingServices ? "Loading services…" : "Select services"} />
								<small className="text-muted">
									{selectedServices.length
										? `${selectedServices.length} selected · estimated ${selectedTotal.toFixed(2)} (final price is set at billing)`
										: "Select the services to perform. They prefill the bill when the appointment is opened in the workflow."}
								</small>
							</div>
						)}
						{contactType === "patient" && (appointment.appointment_type === "laboratory" || appointment.appointment_type === "ultrasound") && (
							<div className="form-row mb-3">
								<label htmlFor="appointment-billing">Billing ID (optional)</label>
								<input
									id="appointment-billing"
									type="number"
									min="1"
									className="form-control"
									value={appointment.billingid || ""}
									onChange={(event) => setAppointment({
										...appointment,
										billingid: event.target.value ? Number(event.target.value) : null
									})} />
								<small className="text-muted">Link the lab or ultrasound booking to an existing patient billing record.</small>
							</div>
						)}
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
										styles={reactSelectCustomStyles}
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
									styles={reactSelectCustomStyles}
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
									styles={reactSelectCustomStyles}
									getOptionLabel={(options) => options.label}
									onChange={(value) => setAppointment({ ...appointment, preference: value })}
									options={preferenceOptions} />

							</div>
							<div className="form-row">
								<label>Invite Method</label>
								<Autocomplete
									styles={reactSelectCustomStyles}
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
								disabled={submitting || (morning.length === 0 && afternoon.length === 0 && evening_slots.length === 0)}
								onClick={(ev) => {
									handleFormSubmit(ev);
								}}
								className="btn btn-primary mt-3">
								{submitting ? "Scheduling…" : "Schedule Appointment"}
							</button>
						</div>
					</div>
				</Container>
			</section></>
	);
}
