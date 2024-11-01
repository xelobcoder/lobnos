import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Col,Container, Table } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { customPost, getInstitutionUsers, getResultEntrySettings, ResultEntrydefaultData } from '../../../components/Auth/customFetch';
import AuthContext from '../../../components/Auth/useAuthentification';
import { toast, ToastContainer } from 'react-toastify';


const ResultSettingsForm = () => {
	const { auth } = useContext(AuthContext);
	const [formData, setFormData] = useState(ResultEntrydefaultData);

	const [scientists, setUsers] = useState([]);
	const [selectedScientists, setSelectedScientists] = useState([]);
	const [currentSelection, setCurrentSelection] = useState('');
	const [loadingUsers, setLoadingUsers] = useState(true);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prevData => ({
			...prevData,
			[name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
		}));
	};

	const addStaffIDField = () => {
		if (formData.minimumResultValidation <= 0 || formData.maximumResultValidation <= 0 || !formData.maximumResultValidation || !formData.minimumResultValidation) {
			toast.error("Please set both minimum and maximum result validation values.");
			return;
		}

		if (!currentSelection || selectedScientists.some(s => s.employeeid === currentSelection)) {
			toast.error("Please select a valid scientist or avoid duplicates.");
			return;
		}

		if (selectedScientists.length >= formData.maximumResultValidation) {
			toast.error(`Cannot add more than ${formData.maximumResultValidation} scientists.`);
			return;
		}


		const inSelection = selectedScientists.findIndex((a, i) => a.employeeid == currentSelection);

		if (inSelection >= 0) return toast.error(`Cannot add a scientists twice`);

		const scientistToAdd = scientists.find(s => {
			return s.employeeid == currentSelection
		});


		if (scientistToAdd) {
			setSelectedScientists(prev => [...prev, scientistToAdd]);
			setCurrentSelection('');
		}
	};

	const removeStaffIDField = (index) => {
		setSelectedScientists(prev => prev.filter((_, i) => i !== index));
	};

	const getInitData = async () => {
		await getInstitutionUsers(setUsers, 'logins', setLoadingUsers);
		const init = await getResultEntrySettings(auth.employeeid);
		if (typeof init === "object") {
			const { staffQualifiedToValidationResult } = init;
			setFormData(init);
			if (staffQualifiedToValidationResult && Array.isArray(staffQualifiedToValidationResult) && staffQualifiedToValidationResult.length > 0) {
				let QualifiedRefined = [];
				if (scientists.length > 0) {
					for (const item of staffQualifiedToValidationResult) {
						const findIndex = scientists.findIndex((_employee, index) => _employee?.employeeid == item);

						if (findIndex > 0) {
							QualifiedRefined.push(scientists[findIndex]);
						}
					}
				}
				setSelectedScientists(QualifiedRefined);
			}
		} else if (typeof init === "string") return toast.error(init);
		else setFormData(ResultEntrydefaultData);
	};

	useEffect(() => {
		getInitData();
	}, [auth.employeeid]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (selectedScientists.length < formData.minimumResultValidation) {
			return toast.error("Number of selected scientists is less than the minimum required.");
		}
		if (selectedScientists.length > formData.maximumResultValidation) {
			return toast.error("Number of selected scientists exceeds the maximum allowed.");
		}

		try {
			const response = await customPost(`applicationsetting/resultsettings/resultentrysettings?employeeid=${auth?.employeeid}`, 'PUT', {
				...formData,
				staffQualifiedToValidationResult: selectedScientists.map(s => s.employeeid)
			});
			const { status } = response;
			if (status) return toast.success("Settings updated successfully");
			return toast.error("Update failed");
		} catch (err) {
			toast.error("Something went wrong");
		}
	};




	return (
		<MainSettingsLayoutView>
			<ToastContainer
				theme='colored'
				position="top-center"
				className={'text-sm'} />
			<Container>
				<div className="heightedBorder p-2 my-2 pls-color text-uppercase bg-secondary-subtle fw-bold">
					Result Entry Settings
				</div>
				<Form onSubmit={handleSubmit}>
					<Table className='ttable'>
						<thead>
							<tr>
								<th>Setting</th>
								<th>Action Enabled</th>
							</tr>
						</thead>
						<tbody>
							{[
								{ id: 'resultLockAfter24Hours', label: 'Lock Result After 24 Hours' },
								{ id: 'isPinOnResultEntry', label: 'PIN Required on Result Entry' },
								{ id: 'isPinOnResultViewAfter24Hours', label: 'PIN Required on Result View After 24 Hours' },
								{ id: 'showPastTestResult', label: 'Show Past Test Results' },
								{ id: 'allowScientistViewAudit', label: 'Allow Scientist View Audit' },
								{ id: 'showTaTAnalysis', label: 'Show TaT Analysis' },
								{ id: 'encryptResultAfter24Hours', label: 'Encrypt Result After 24 Hours' },
								{ id: 'sendLoginEmailNotificationAfterResultEdit', label: 'Send Login Email Notification After Result Edit' },
								{ id: 'monitorForCriticalValues', label: 'Monitor for Critical Values' },
								{ id: 'notifyClientOnResultReady', label: 'Notify Client on Result Ready' }
							].map(({ id, label }) => (
								<tr key={id}>
									<td className='p-3 pls-label'>{label}</td>
									<td className='p-3'>
										<Form.Check
											type="switch"
											style={{ fontSize: '24px' }}
											id={`${id}Switch`}
											name={id}
											checked={formData[id] === 1}
											onChange={handleChange}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
					<div className="heightedBorder p-2 my-2 pls-color text-uppercase bg-secondary-subtle fw-bold">
						Result Validators
					</div>
					<Form.Group controlId="maximumResultValidation">
						<Form.Label className='pls-label' column sm={4}>Maximum Result Validation</Form.Label>
						<Col sm={8}>
							<Form.Control
								className='custom-input'
								type="number"
								name="maximumResultValidation"
								value={formData.maximumResultValidation}
								onChange={handleChange} />
						</Col>
					</Form.Group>

					<Form.Group controlId="minimumResultValidation">
						<Form.Label className='pls-label' column sm={4}>Minimum Result Validation</Form.Label>
						<Col sm={8}>
							<Form.Control
								className='custom-input'
								type="number"
								name="minimumResultValidation"
								value={formData.minimumResultValidation}
								onChange={handleChange} />
						</Col>
					</Form.Group>

					<Form.Group controlId="staffQualifiedToValidationResult">
						<Form.Label className='pls-label' column sm={4}>Staff Qualified for Validation Result</Form.Label>
						<Col sm={8}>
							{Array.isArray(scientists) && scientists.length > 0 && (
								<div>
									<select
										disabled={formData.maximumResultValidation == 0 || !formData.maximumResultValidation || !formData.minimumResultValidation || formData.minimumResultValidation == 0 || formData.minimumResultValidation == formData.maximumResultValidation}
										className='custom-select'
										value={currentSelection}
										onChange={(ev) => { setCurrentSelection(ev.target.value) }}>
										<option value="">Select Scientist</option>
										{scientists.map((item) => (
											<option key={item.employeeid} value={item.employeeid}>
												{item.username}
											</option>
										))}
									</select>
									<Button variant="outline-success my-2 " className='btn-sm' onClick={(ev) => { addStaffIDField() }}>Add scientist</Button>
								</div>
							)}
						</Col>
					</Form.Group>
					<div className='col-8'>
						<Table className="mt-2 table ttable">
							<thead>
								<tr>
									<th>Selected Scientists</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{selectedScientists.map((scientist, index) => (
									<tr key={index}>
										<td>{scientist.username}</td>
										<td>
											<Button variant="outline-danger" size="sm" onClick={() => removeStaffIDField(index)}>Remove</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>

					<Button variant="primary" className='mt-2 btn-sm' type="submit">
						Save Settings
					</Button>
				</Form>
			</Container>
		</MainSettingsLayoutView>
	);
};

export default ResultSettingsForm;
