import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { customFetch, customPost, getResultEntrySettings, ResultEntrydefaultData } from '../../../components/Auth/customFetch';
import { toast, ToastContainer } from 'react-toastify';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { RiLockLine, RiPinDistanceLine, RiHistoryLine, RiFileListLine, 
         RiTimeLine, RiLockPasswordLine, RiMailLine, RiAlertLine, 
         RiNotification3Line, RiUserAddLine, RiDeleteBin6Line, RiSave3Line } from '@remixicon/react';

const ResultSettingsForm = () => {
	const { user ,tenantId} = useApplicationSettings().applicationsettings;
	const employeeid = user.employeeid
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
		try {
			setLoadingUsers(true);
			const { result } = await customFetch("logins");
			setUsers(result);
			const init = await getResultEntrySettings(employeeid);
			if (typeof init === "object") {
				const { staffQualifiedToValidationResult } = init;
				setFormData(init);

				const isValidToUpdate = staffQualifiedToValidationResult && Array.isArray(staffQualifiedToValidationResult) && staffQualifiedToValidationResult.length > 0;

				if (isValidToUpdate) {
					let QualifiedRefined = [];
					if (result.length > 0) {
						for (const item of staffQualifiedToValidationResult) {
							const findIndex = result.findIndex((_employee, index) => _employee?.employeeid == item);

							if (findIndex > 0) {
								QualifiedRefined.push(result[findIndex]);
							}
						}
					}
					setSelectedScientists(QualifiedRefined);
				}
			} else if (typeof init === "string") return toast.error(init);
			else setFormData(ResultEntrydefaultData);
			setLoadingUsers(false);
		} catch (err) {
			setSelectedScientists([])
			setUsers([]);
			setLoadingUsers(false);
		}
	};

	useEffect(() => {
		getInitData();
	}, [user.employeeid]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (selectedScientists.length < formData.minimumResultValidation) {
			return toast.error("Number of selected scientists is less than the minimum required.");
		}
		if (selectedScientists.length > formData.maximumResultValidation) {
			return toast.error("Number of selected scientists exceeds the maximum allowed.");
		}

		try {
			const response = await customPost(`applicationsetting/resultsettings/resultentrysettings?tenantId=${tenantId}&&employeeid=${auth?.employeeid}`, 'PUT', {
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
			<ToastContainer theme="colored" position="top-center" />
			<div className="px-4 py-3">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h4 className="mb-0 text-uppercase fw-bold">Result Entry Settings</h4>
					<Button 
						variant="primary" 
						onClick={handleSubmit}
						className="d-flex align-items-center gap-2"
					>
						<RiSave3Line /> Save Settings
					</Button>
				</div>

				<div className="row g-4">
					{/* Settings Panel */}
					<div className="col-lg-8">
						<div className="bg-white rounded-3 shadow-sm p-4 mb-4">
							<h5 className="mb-4 text-uppercase fw-semibold">General Settings</h5>
							<div className="row g-3">
								{[
									{ id: 'resultLockAfter24Hours', label: 'Lock Result After 24 Hours', icon: <RiLockLine /> },
									{ id: 'isPinOnResultEntry', label: 'PIN Required on Result Entry', icon: <RiPinDistanceLine /> },
									{ id: 'isPinOnResultViewAfter24Hours', label: 'PIN Required on Result View After 24 Hours', icon: <RiPinDistanceLine /> },
									{ id: 'showPastTestResult', label: 'Show Past Test Results', icon: <RiHistoryLine /> },
									{ id: 'allowScientistViewAudit', label: 'Allow Scientist View Audit', icon: <RiFileListLine /> },
									{ id: 'showTaTAnalysis', label: 'Show TaT Analysis', icon: <RiTimeLine /> },
									{ id: 'encryptResultAfter24Hours', label: 'Encrypt Result After 24 Hours', icon: <RiLockPasswordLine /> },
									{ id: 'sendLoginEmailNotificationAfterResultEdit', label: 'Send Login Email Notification After Result Edit', icon: <RiMailLine /> },
									{ id: 'monitorForCriticalValues', label: 'Monitor for Critical Values', icon: <RiAlertLine /> },
									{ id: 'notifyClientOnResultReady', label: 'Notify Client on Result Ready', icon: <RiNotification3Line /> }
								].map(({ id, label, icon }) => (
									<div key={id} className="col-md-6">
										<div className="border rounded p-3 h-100 d-flex align-items-center justify-content-between">
											<div className="d-flex align-items-center gap-2">
												<span className="text-primary">{icon}</span>
												<span className="fs-7">{label}</span>
											</div>
											<Form.Check
												type="switch"
												id={`${id}Switch`}
												name={id}
												checked={formData[id] === 1}
												onChange={handleChange}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Validation Panel */}
					<div className="col-lg-4">
						<div className="bg-white rounded-3 shadow-sm p-4">
							<h5 className="mb-4 text-uppercase fw-semibold">Validation Rules</h5>
							
							<div className="mb-4">
								<Form.Group className="mb-3">
									<Form.Label className="fw-medium">Maximum Validators</Form.Label>
									<Form.Control
										type="number"
										name="maximumResultValidation"
										value={formData.maximumResultValidation}
										onChange={handleChange}
										min="1"
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label className="fw-medium">Minimum Validators</Form.Label>
									<Form.Control
										type="number"
										name="minimumResultValidation"
										value={formData.minimumResultValidation}
										onChange={handleChange}
										min="1"
									/>
								</Form.Group>

								<div className="d-flex gap-2">
									<Form.Select
										value={currentSelection}
										onChange={(e) => setCurrentSelection(e.target.value)}
										disabled={!formData.maximumResultValidation || !formData.minimumResultValidation}
									>
										<option value="">Select Scientist</option>
										{scientists.map((item) => (
											<option key={item.employeeid} value={item.employeeid}>
												{item.username}
											</option>
										))}
									</Form.Select>
									<Button 
										variant="outline-primary"
										onClick={addStaffIDField}
										disabled={!currentSelection}
									>
										<RiUserAddLine />
									</Button>
								</div>
							</div>

							<div className="border rounded">
								<div className="p-3 border-bottom bg-light">
									<h6 className="mb-0 fw-semibold">Selected Scientists</h6>
								</div>
								<div className="p-3">
									{selectedScientists.length === 0 ? (
										<div className="text-center text-muted py-4">
											No scientists selected
										</div>
									) : (
										<div className="d-flex flex-column gap-2">
											{selectedScientists.map((scientist, index) => (
												<div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded">
													<span>{scientist.username}</span>
													<Button 
														variant="link" 
														className="text-danger p-0"
														onClick={() => removeStaffIDField(index)}
													>
														<RiDeleteBin6Line />
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainSettingsLayoutView>
	);
};

export default ResultSettingsForm;
