import { useState, useEffect } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { customPost, customFetch } from "../../../components/Auth/customFetch";
import { Button, Container, } from "react-bootstrap";
import { registrationFields } from "../../../components/registration/fields/Util";

import { ToastContainer, toast } from "react-toastify";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";


export default function RegistrationFieldsSettings() {
	const { applicationsettings } = useApplicationSettings();
	const employeeid = applicationsettings.user.employeeid;
	const [fields, setFields] = useState(registrationFields);
	const [isErrorLoadingFields, setIsErrorLoadingFields] = useState(false);

	useEffect(() => {
		async function getFieldSettings() {
			try {
				const fetchedFields = await customFetch("applicationsettings/registration/fields");
				setFields(fetchedFields);
			} catch (err) {
				setIsErrorLoadingFields(true);
			}
		}
		getFieldSettings();
	}, []);

	const handleFieldChange = (section, field, setting) => {
		setFields(prevFields => ({
			...prevFields,
			[section]: {
				...prevFields[section],
				[field]: {
					...prevFields[section][field],
					[setting]: !prevFields[section][field][setting],
				}
			}
		}));
	};



	const handleSubmit = async () => {
		const response = await customPost("applicationsettings/registration/fields", "POST", { fields, employeeid })
		const { status, message } = response
		if (status == "success") return toast.success(message, { autoClose: 500 })
		else toast.error(message, { autoClose: 2000 })
	}

	if (isErrorLoadingFields) return <div className="text-danger">Error Loading saved field settings </div>;

	return (
		<MainSettingsLayoutView>
			<ToastContainer
				theme='colored'
				position="top-center"
				className={'text-sm'} />
			<Container>
				<div className="list-group p-0">
					<div className=" heightedBorder p-2  my-2 pls-color  text-uppercase bg-secondary-subtle fw-bold">
						Registration Fields
					</div>
					<div >
						{Object.keys(fields).map(section => (
							<div key={section} className="list-group my-2">
								<div className="list-group-item pls-color bg-secondary-subtle fw-bold">{section.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
								<div className="list-group-item ">
									<table className="text-sm table ttable">
										<thead>
											<tr>
												<th className="fw-bold text-capitalize" style={{ width: '30%' }}>Field</th>
												<th className="fw-bold text-capitalize" style={{ width: '70%' }}>Settings</th>
											</tr>
										</thead>
										<tbody>
											{Object.keys(fields[section]).map(field => (
												<tr key={`${section}-${field}`}>
													<td style={{ width: '30%' }}>{field}</td>
													<td style={{ width: '70%' }}>
														<div>
															<input
																type="checkbox"
																checked={fields[section][field].visible}
																onChange={() => handleFieldChange(section, field, 'visible')}
															/> Visible
														</div>
														<div>
															<input
																type="checkbox"
																checked={fields[section][field].compulsory}
																onChange={() => handleFieldChange(section, field, 'compulsory')}
															/> Compulsory
														</div>

													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

							</div>
						))}
					</div>
				</div>
				<Button variant="primary" onClick={handleSubmit}>
					save registration changes
				</Button>
			</Container>
		</MainSettingsLayoutView>
	);
}
