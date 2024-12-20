import { useState, useEffect } from "react";
import { customFetch, customPost } from "../../Auth/customFetch";
import { defaultApplicationSettings, getApplicationSettings } from "../../Auth/customFetch";
import CustomFormSwitch from "../../accessories/CustomFormSwitch";

export default function ApplicationSettingsComponent() {
	const [applicationSettings, setApplicationSettings] = useState(defaultApplicationSettings);
	const [branches, setBranches] = useState([]);
	const [defaultBranch, setDefaultBranch] = useState("");

	const getData = async (endpoint, storage) => {
		const response = await customFetch(endpoint);
		const { status, statusCode, result } = response;
		if (statusCode === 200 && status === "success") {
			storage(result);
		}
	};

	const getApplicationData = async () => {
		const data = await getApplicationSettings();
		setApplicationSettings(data);
	};

	const handleAppSettingsActivation = (target, value) => {
		setApplicationSettings({ ...applicationSettings, [target]: value });
	};

	const updateSettings = async () => {
		let isError = Object.values(applicationSettings).filter((value) => value === "").length;

		if (isError === 0) {
			const response = await customPost("applicationsettings", "POST", applicationSettings);
			const { statusCode, status, message } = response;
			if (statusCode === 200 && status === "success") {
				alert(message);
				getApplicationData();
				setDefaultBranch(localStorage.getItem("deviceDefaultBranch"));
			}
		} else {
			alert("Please fill all required settings before updating.");
		}
	};

	useEffect(() => {
		getApplicationData();
	}, []);

	return (
		<div className="container-fluid">
			<div className="row g-3">
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="bulkregistration"
						variant="number"
						value={applicationSettings.bulkregistration === 1}
						update={handleAppSettingsActivation}
						title="Registration"
						text="Detail registration including the address of the client and personal information."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="DeactivateBilling24hrs"
						variant="number"
						value={applicationSettings.DeactivateBilling24hrs === 1}
						update={handleAppSettingsActivation}
						title="Deactivation"
						text="Automatic deactivation of clients 24 hours after registration."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="PaidBillsBeforeTransaction"
						variant="number"
						value={applicationSettings.PaidBillsBeforeTransaction === 1}
						update={handleAppSettingsActivation}
						title="Billing"
						text="Clear all bills before a new transaction can be initiated. Full payment is required during registration."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="completeFlow"
						variant="number"
						value={applicationSettings.completeFlow === 1}
						update={handleAppSettingsActivation}
						title="Flow"
						text="Follow the full lifecycle of sampling and result processing, starting from registration."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="approvalbeforeprinting"
						variant="number"
						value={applicationSettings.approvalbeforeprinting === 1}
						update={handleAppSettingsActivation}
						title="Approval"
						text="Require manager approval before printing or dispatching results."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="emailNotification"
						variant="number"
						value={applicationSettings.emailNotification === 1}
						update={handleAppSettingsActivation}
						title="Email Notification"
						text="Enable email notifications for the application. Further customization available in the email section."
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						target="includeTax"
						variant="number"
						value={applicationSettings.includeTax === 1}
						update={handleAppSettingsActivation}
						title="Include Taxes in Billing"
						text="Include taxes in client billing."
					/>
				</div>
			</div>
			<div className="text-end mt-4">
				<button className="btn btn-primary btn-sm" onClick={updateSettings}>
					Update Settings
				</button>
			</div>
		</div>
	);
}
