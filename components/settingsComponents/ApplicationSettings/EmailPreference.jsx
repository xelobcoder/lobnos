import { useState, useEffect } from "react";
import { customFetch, customPost, emailPreference, handleResponse } from "../../../components/Auth/customFetch";
import Loader from "../../../components/accessories/Loader";
import CustomFormSwitch from "../../accessories/CustomFormSwitch";
import { Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

export default function ApplicationEmailPreference() {
	const [preference, setPreference] = useState(emailPreference);
	const [loading, setLoading] = useState(true);
	const [activateAll, setActivateAll] = useState(false);

	const handleSubmit = async () => {
		const pushPreference = await customPost("applicationssettings/emailpreference", "POST", preference);
		handleResponse(pushPreference, toast);
	};

	async function getPreference() {
		try {
			setLoading(true);
			const response = await customFetch("applicationssettings/emailpreference");
			const { statusCode, status, message, result } = response;
			if (statusCode === 200 && status === "success" && result) {
				if (Object.keys(result).length > 0) {
					setPreference(result);
				} else {
					setPreference(emailPreference);
				}
			}
			setLoading(false);
		} catch (err) {
			setLoading(false);
			toast.error("Something went wrong, defaulting to default settings.");
		}
	}

	const handleChangeWithState = (key, value) => {
		setPreference({ ...preference, [key]: value });
	};

	const bulkActivate = (value) => {
		if (Object.keys(preference).length === 0) return;
		const newdata = { ...preference };
		for (const key of Object.keys(preference)) {
			newdata[key] = value ? "Yes" : "No";
		}
		setActivateAll(value);
		setPreference(newdata);
	};

	useEffect(() => {
		getPreference();
	}, []);

	const renderSwitches = () => {
		if (loading) return <Loader />;
		const keys = Object.keys(preference);
		return (
			<div className="row">
				{keys.map((item, index) => (
					<div className="col-12 col-md-6 col-lg-4 mb-3" key={index}>
						<CustomFormSwitch
							key={index + 1}
							title={item}
							target={item}
							variant="string"
							value={preference[item]}
							update={handleChangeWithState}
							text={`Send an email notification when ${item} event occurs. This will be triggered automatically when activated.`}
						/>
					</div>
				))}
			</div>
		);
	};

	return (
		<main className="mx-3">
			<ToastContainer />
			<div className="d-flex align-items-center mb-3 d-flex justify-content-end my-2 text-sm  bg-secondary-subtle p-2">
				<Form.Check
					onChange={(ev) => bulkActivate(ev.target.checked)}
					type="switch"
					id="activateAllSwitch"
					className="me-2"
				/>
				<span className="text-capitalize">
					{activateAll ? "Deactivate all settings" : "Activate all settings"}
				</span>
			</div>
			{renderSwitches()}
			<div className="text-end mt-4">
				<button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
					Update Preferences
				</button>
			</div>
		</main>
	);
}
