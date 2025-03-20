import { useState, useEffect } from "react";
import { customFetch, customPost, defaultSmsSettings } from "../../Auth/customFetch";
import Loader from "../../accessories/Loader";
import CustomFormSwitch from "../../accessories/CustomFormSwitch";
import { toast, ToastContainer } from "react-toastify";

export default function SMS_SETTINGS() {
	const [data, setData] = useState({});
	const [isLoading, setLoading] = useState(true);

	const handleSubmit = async () => {
		try {
			const response = await customPost("applicationsettings/smsupdate", "PUT", data);
			const { status } = response;

			if (status) {
				toast.success("SMS settings updated successfully.");
			} else {
				toast.error("Failed to update SMS settings.");
			}
		} catch (error) {
			toast.error("An error occurred while updating settings.");
		}
	};

	const update = (target, value) => {
		setData({ ...data, [target]: value });
	};

	const fetchSmsSettings = async () => {
		try {
			setLoading(true);
			const response = await customFetch("applicationsettings/smsupdate");
			setData(response);
		} catch (error) {
			setData(defaultSmsSettings);
			toast.error("Failed to fetch SMS settings, using defaults.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSmsSettings();
	}, []);

	if (isLoading) return <Loader />;

	const keys = Object.keys(data);

	return (
		<div>
			<ToastContainer theme="colored" position="top-center" className="text-sm" />
			<div className="container-fluid">
				<div className="row g-3">
					{keys.map((item, index) => (
						<div className="col-12 col-md-6 col-lg-4" key={index}>
							<CustomFormSwitch
								text={`A SMS message will be sent if a ${item} event occurs.`}
								title={item}
								target={item}
								variant="string"
								value={data[item]}
								update={update}
							/>
						</div>
					))}
				</div>
				<div className="text-end mt-3">
					<button className="btn btn-primary btn-sm" onClick={handleSubmit}>
						Save Preferences
					</button>
				</div>
			</div>
		</div>
	);
}
