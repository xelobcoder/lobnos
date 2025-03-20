import PatientFiltering from "../../components/accessories/SectorFileringComponents/CustomerFiltering";
import { useEffect, useState } from "react";
import Autocomplete from "react-select";
import moment from "moment";
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
import { getInstitutionUsers, reactSelectCustomStyles } from "../../lib/customFetch";
import SpinningLoading from "../accessories/UIAccessories/spinningLoading";
import { useSearchParams } from "next/navigation";
import AppointmentSlots from "./DisplayAppointmentSlot";
import { ToastContainer, toast } from "react-toastify";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useId } from 'react';

export default function NewAppointment() {
	const [isClient, setIsClient] = useState(false);
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

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<><ToastContainer theme="colored" /><section>
			<div className="d-flex justify-content-between my-2">

			</div>
			<div>
				<div className="col-6">
					<PatientFiltering getSelectedPatient={getSelectedPatient} isDisabled={disableFilter} />
				</div>
				<div >
					<div className="col-6">
						<div className="form-row w-100 mb-3">
							<label>Date of Appointment</label>
							<br />
							<div>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!appointment.appointment_date && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{appointment.appointment_date ? (
												moment(appointment.appointment_date).format("MMMM Do, YYYY")
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={appointment.appointment_date}
											onSelect={(date) => setAppointment({ ...appointment, appointment_date: date })}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>
						<div className="form-row mb-3">
							<label>Consulting Healthcare Practitioner</label>
							<div>
								{isClient ? (
									<Autocomplete
										styles={reactSelectCustomStyles}
										value={appointment.practioner}
										onChange={(value) => {
											onChangePractioner(value, setAppointment, appointment, setMorning, setAfternoon, setEvening);
										}}
										options={employees || []}
										getOptionLabel={(option) => <span className="text-uppercase">{option.username}</span>}
										getOptionValue={(option) => option.username}
									/>
								) : null}
								{isloadingEmployees && <SpinningLoading color="text-dark" />}
							</div>
						</div>
						<div className="form-row mb-3">
							<label>Title of Appointment</label>
							{isClient ? (
								<Autocomplete
									styles={reactSelectCustomStyles}
									value={appointment.title}
									onChange={(value) => setAppointment({ ...appointment, title: value })}
									options={[
										{ value: "Consultation", label: "Consultation" },
										{ value: "Follow-up", label: "Follow-up" },
										{ value: "Review", label: "Review" },
										{ value: "Check-up", label: "Check-up" },
										{ value: "Treatment", label: "Treatment" }
									]}
									getOptionLabel={(option) => option.label}
								/>
							) : null}
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
							{isClient ? (
								<Autocomplete
									styles={reactSelectCustomStyles}
									getOptionLabel={(option) => option.label}
									value={appointment.duration}
									onChange={(value) => setAppointment({ ...appointment, duration: value })}
									options={durationOptions}
								/>
							) : null}
						</div>

						<div className="form-row mb-3">
							<label>Preference</label>
							{isClient ? (
								<Autocomplete
									value={appointment.preference}
									styles={reactSelectCustomStyles}
									getOptionLabel={(options) => options.label}
									onChange={(value) => setAppointment({ ...appointment, preference: value })}
									options={preferenceOptions}
								/>
							) : null}
						</div>

						<div className="form-row">
							<label>Invite Method</label>
							{isClient ? (
								<Autocomplete
									styles={reactSelectCustomStyles}
									value={appointment.inviteMethod}
									getOptionLabel={(options) => options.label}
									onChange={(value) => setAppointment({ ...appointment, inviteMethod: value })}
									options={inviteMethod}
								/>
							) : null}
						</div>
						<div className="form-row my-2">
							{<AppointmentSlots handleClick={handleSlotClick} title={"Morning"} appointment={appointment} slot={morning} />}
							{<AppointmentSlots handleClick={handleSlotClick} title={"Afternoon"} appointment={appointment} slot={afternoon} />}
							{<AppointmentSlots handleClick={handleSlotClick} title={"Evening"} appointment={appointment} slot={evening_slots} />}
						</div>

						<div className="w-full flex justify-end mt-6 mb-4">
							<Button
								variant="default"
								size="lg"
								type="button"
								disabled={morning.length === 0 && afternoon.length === 0 && evening_slots.length === 0}
								onClick={handleFormSubmit}
								className="px-8 py-3 text-base font-semibold"
							>
								Schedule Appointment
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section></>
	);
}
