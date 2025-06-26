import { useEffect, useState } from "react";
import CustomFormSwitch from "../../accessories/CustomFormSwitch";
import { customPost, defaultResultSettings, getResultSettings } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";

export default function ApplicationResultSettings() {
	const [result, setResult] = useState(defaultResultSettings);
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getResultSettings(setResult, setLoading);
	}, []);

	const handleSubmit = async () => {
		setLoading(true);
		customPost("applicationsetting/resultsettings", "PUT", { data: result })
			.then((data) => {
				const { status, message } = data;
				if (status === "success") {
					toast.success(message, { autoClose: 500 });
				} else {
					toast.error(message, { autoClose: 500 });
				}
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				toast.error("Something went wrong.", { autoClose: 500 });
			});
	};

	const update = (target, value) => {
		setResult({ ...result, [target]: value });
	};

	if (isLoading) {
		return <h5>Loading settings, please wait...</h5>;
	}

	return (
		<div className="mx-3">
			<ToastContainer />
			<div className="row">
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						text="Literature review text added in test setup will be included in the result printout."
						target="literatureReview"
						title="Literature Review"
						value={result.literatureReview}
						variant="number"
						update={update}
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						text="Include letter headings in the result print before dispatching."
						title="Letter Heading"
						value={result.letterHeading}
						variant="number"
						target="letterHeading"
						update={update}
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						text="Require lab scientists to enter passwords before saving results."
						title="Password on Result Entry"
						value={result.passwordonResult}
						variant="number"
						target="passwordonResult"
						update={update}
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						text="Ensure result entry is done according to created departments."
						title="Result Entry"
						value={result.DepartmentEntry}
						variant="number"
						target="DepartmentEntry"
						update={update}
					/>
				</div>
				<div className="col-12 col-md-6 col-lg-4">
					<CustomFormSwitch
						text="Include sampling information in the final result printout."
						title="Sampling Information"
						value={result.samplingInformation}
						variant="number"
						target="samplingInformation"
						update={update}
					/>
				</div>
			</div>
			<div className="text-end mt-3">
				<button type="button" onClick={handleSubmit} className="btn btn-primary btn-sm">
					Update Result Settings
				</button>
			</div>
		</div>
	);
}
