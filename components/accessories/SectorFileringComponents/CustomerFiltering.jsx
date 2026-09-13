"use client"
import { useEffect, useState, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../../lib/appointment";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

const fieldMapping = {
	"fullname": "fullname",
	"mobile number": "mobile_number",
	"patientid": "patientid",
	"firstname": "firstname",
	"lastname": "lastname",
	"middlename": "middlename",
	"fullpatientid": "fullpatientid",
	"email": "email",
	"gender": "gender",
	"maritalstatus": "marital_status",
	"patientOrganization": "organization",
	"occupation": "occupation",
	"date": "date"
};

export default function PatientFiltered({ getSelectedPatient, isDisabled = false, wrapped = false, placeholder = "Search patient using the selected field" }) {
	const [isLoading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [isClient, setIsClient] = useState(false);
	const [selectedField, setSelectedField] = useState("fullname");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [options, setOptions] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedPatients, setSelectedPatients] = useState([]);


	const handleCheckboxChange = (option) => {
		const isSelected = selectedPatients.some(p => p.value === option.value);
		if (isSelected) {
			setSelectedPatients(selectedPatients.filter(p => p.value !== option.value));
		} else {
			setSelectedPatients([...selectedPatients, option]);
		}
	};


	const handleSelectAll = (isChecked) => {
		if (isChecked) {
			setSelectedPatients(options);
		} else {
			setSelectedPatients([]);
		}
	};


	const handleSubmitSelected = () => {
		getSelectedPatient(selectedPatients.map(p => p.export));
		setShowModal(false);
	};

	const loadClientOptions = async (inputValue) => {
		setLoading(true);
		if (inputValue) setSearchInput(inputValue);
		try {
			setSelectedOption(null);
			const result = await loadOptions(inputValue || searchInput || "", selectedField, startDate, endDate);
			if (!Array.isArray(result) || result.length == 0) {
				setOptions([]);
				return [];
			}
			const clients = result.map((client) => ({
				value: client.patientid,
				fullname: `${client.firstname.charAt(0).toUpperCase()}${client.firstname.slice(1)} ${client.middlename
					} ${client.lastname.trim()} ( ${client.fullpatientid}) **** ${client.patientid} AS SHORTCUT\n`,
				label: `DOB: ${client.dob ? new Date(client.dob).toLocaleDateString() : "NIL"}, Gender: ${client.gender}, Age: ${client.age} ${client.agetype || client.ageType},\nContact: ${client.mobile_number
					}  Registered on: ${new Date(client.date).toLocaleDateString()}`,
				export: client,
			}));
			setOptions(clients);
			return clients;
		} catch (error) {
			setOptions([]);
			return [];
		} finally {
			setLoading(false);
		}
	};

	const handleSelectChange = useCallback((selectedOption) => {
		setSelectedOption(selectedOption);
		if (selectedField === "date") {
			getSelectedPatient({
				type: "individual",
				patient: selectedOption?.export
			});
		} else {
			getSelectedPatient(selectedOption?.export);
		}
	}, [selectedField, getSelectedPatient]);

	const formatOptionLabel = ({ label, fullname }) => {
		return !selectedOption ? (
			<div style={{ whiteSpace: "pre-wrap", margin: "0", paddingBottom: "12px", borderBottom: "1px solid #e0e0e0" }}>
				<div style={{ fontWeight: 700 }} className="text-uppercase">
					<strong>{fullname}</strong>
				</div>
				<div style={{ fontWeight: 400 }}>{label}</div>
			</div>
		) : (
			<div style={{ fontWeight: 700 }} className="text-uppercase">
				<strong>{fullname}</strong>
			</div>
		);
	};

	useEffect(() => { setIsClient(true) }, [])


	useEffect(() => {
		if (startDate && endDate) {
			loadClientOptions(searchInput);
		}
	}, [startDate, endDate]);

	// Automatically open modal when filtered results are available
	useEffect(() => {
		if (selectedField === "date" && startDate && endDate && options.length > 0) {
			setShowModal(true);
		}
	}, [options, selectedField, startDate, endDate]);



	return (
		<div style={{ fontFamily: "candara" }} className={wrapped ? "border p-3 rounded bg-white" : ""}>
			<div className="row g-2">
				<div className="col-md-3">
					<label htmlFor="filterField" className="form-label">Filter By Field</label>
					<select
						id="filterField"
						className="form-select"
						value={selectedField}
						onChange={(e) => setSelectedField(e.target.value)}
						disabled={isDisabled}
					>
						{Object.entries(fieldMapping).map(([key, value]) => (
							<option key={key} value={key}>
								{key.charAt(0).toUpperCase() + key.slice(1)}
							</option>
						))}
					</select>
				</div>
				{selectedField === "date" ? (
					<>
						<div className="col-md-3">
							<label htmlFor="startDate" className="form-label">From Date</label>
							<input
								id="startDate"
								type="date"
								className="form-control"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								disabled={isDisabled}
							/>
						</div>
						<div className="col-md-3">
							<label htmlFor="endDate" className="form-label">To Date</label>
							<input
								id="endDate"
								type="date"
								className="form-control"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								disabled={isDisabled}
								min={startDate}
							/>
						</div>
						<div className="col-md-3">
							<label className="form-label">&nbsp;</label>
							<button
								className="btn btn-outline-secondary w-100"
								onClick={() => {
									setStartDate("");
									setEndDate("");
									setSelectedOption(null);
								}}
								disabled={isDisabled}
							>
								Clear Dates
							</button>
						</div>
					</>
				) : (
					<div className="col-md-9">
						<label className="form-label">&nbsp;</label>
						{
							isClient && <AsyncSelect
								styles={reactSelectCustomStyles}
								className="react-select-container"
								classNamePrefix="react-select"
								isClearable={true}
								isLoading={isLoading}
								isDisabled={isDisabled}
								loadOptions={loadClientOptions}
								options={options}
								defaultOptions={[]}
								placeholder={placeholder}
								onChange={handleSelectChange}
								blurInputOnSelect={true}
								value={selectedOption}
								formatOptionLabel={formatOptionLabel}
							/>
						}
					</div>
				)}
			</div>
			{/* Modal */}
			{showModal && (
				<>
					<div
						className="modal show"
						id="patientModal"
						tabIndex="-1"
						role="dialog"
						style={{ display: "block" }}
					>
						<div className="modal-dialog modal-lg" role="document">
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title">
										Filtered Patients ({options.length})
									</h5>
									<button
										type="button"
										className="btn-close"
										onClick={() => setShowModal(false)}
										aria-label="Close"
									/>
								</div>
								<div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
									{options.length > 0 ? (
										<div className="table-responsive">
											<table className="table table-hover table-sm">
												<thead className="table-light sticky-top">
													<tr>
														<th style={{ width: "30px" }}>
															<input
																type="checkbox"
																className="form-check-input"
																checked={selectedPatients.length === options.length && options.length > 0}
																onChange={(e) => handleSelectAll(e.target.checked)}
																title="Select All"
															/>
														</th>
														<th>Name</th>
														<th>Patient ID</th>
														<th>DOB</th>
														<th>Gender</th>
														<th>Contact</th>
														<th>Registered</th>
													</tr>
												</thead>
												<tbody>
													{options.map((option) => (
														<tr key={option.value} style={{ backgroundColor: selectedPatients.some(p => p.value === option.value) ? "#f0f0f0" : "" }}>
															<td style={{ width: "30px" }}>
																<input
																	type="checkbox"
																	className="form-check-input"
																	checked={selectedPatients.some(p => p.value === option.value)}
																	onChange={() => handleCheckboxChange(option)}
																/>
															</td>
															<td className="fw-semibold">{option.fullname}</td>
															<td>{option.export.fullpatientid}</td>
															<td>{option.export.dob ? new Date(option.export.dob).toLocaleDateString() : "N/A"}</td>
															<td>{option.export.gender}</td>
															<td>{option.export.mobile_number}</td>
															<td>{new Date(option.export.date).toLocaleDateString()}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="alert alert-info mb-0">No patients found for the selected date range.</div>
									)}
								</div>
								<div className="modal-footer">
									{selectedPatients.length > 0 && (
										<button
											type="button"
											className="btn btn-success me-auto"
											onClick={handleSubmitSelected}
										>
											Select {selectedPatients.length} Patient{selectedPatients.length > 1 ? "s" : ""}
										</button>
									)}
									<button
										type="button"
										className="btn btn-secondary"
										onClick={() => setShowModal(false)}
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
					<div
						className="modal-backdrop fade show"
						onClick={() => setShowModal(false)}
						style={{ display: "block" }}
					/>
				</>
			)}
		</div>
	)
}
