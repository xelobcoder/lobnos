"use client"
import { useState, useEffect } from "react";
import Select from "react-select";
import { ghanaDistricts } from "./fields/Util";
import { submitFormData } from "../Auth/registerclient";
import { customPost, reactSelectCustomStyles } from "../Auth/customFetch";


export default function Addressing({ defaultData, fields, patientid, toast }) {
	const [isClient, setClient] = useState(false);
	const [data, setData] = useState({
		region: "",
		district: "",
		districtName: "",
		area: defaultData?.area || "",
		gpsLocation: defaultData?.gpsLocation || "",
		address: defaultData?.address || "",
		patientid: patientid || "",
		...defaultData,
	});

	useEffect(() => {
		setData((prevData) => ({
			region: "",
			district: "",
			districtName: "",
			area: defaultData?.area || "",
			gpsLocation: defaultData?.gpsLocation || "",
			address: defaultData?.address || "",
			...defaultData,
		}));
	}, [defaultData]);
	const [isloading, setLoading] = useState(false);
	const [districtOptions, setDistrictOptions] = useState([]);
	const [regionOptions, setRegionOptions] = useState([]);

	const clearForm = () => {
		setData({
			...defaultData,
			region: "",
			district: "",
			districtName: ""
		});
		setDistrictOptions([]);
		setRegionOptions([]);
	};

	useEffect(() => {
		const regionOpts = Object.keys(ghanaDistricts).map(region => ({
			value: region,
			label: region
		}));
		setRegionOptions(regionOpts);
		setClient(true);
	}, []);



	const handlePatientInformationSave = async () => {
		try {
			const requestData = {
				district: data.district,
				region: data.region,
				area: data.area,
				gpsLocation: data.gpsLocation,
				address: data.address,
				patientid: patientid
			}
			const response = await customPost(`register/addressinginformation?patientid=${patientid}`, 'PUT', requestData);
			if (response && Number(response.statusCode) === 200 && response.status === "success") {
				toast.success("Addressing information saved successfully!");
			} else {
				toast.error("Failed to save addressing information.");
			}
		} catch (error) {
			console.error("Error saving addressing information:", error);
			toast.error("An error occurred while saving addressing information.");
		}
	}

	useEffect(() => {
		if (data.region && ghanaDistricts[data.region]) {
			const districtOpts = Object.entries(ghanaDistricts[data.region]).map(
				([code, { name }]) => ({
					value: code,
					label: name
				})
			);
			setDistrictOptions(districtOpts);
		} else {
			setDistrictOptions([]);
		}
	}, [data.region]);

	const selectedDistrict = districtOptions.find(option => option.value === data.district);

	return (
		<>
			<section className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
				{isloading && <div>Loading data.........................</div>}
				<div>
					<div className="form-row mt-2 mb-1 mt-2">
						{isClient && (
						<Select
							isDisabled={isloading}
							options={regionOptions}
							className="react-select-container"
							styles={reactSelectCustomStyles}
							classNamePrefix="react-select"
							value={regionOptions.find(option => option.value === data.region)}
							onChange={option => {
								setData({
									...data,
									region: option ? option.value : "",
									district: "",
									districtName: ""
								});
							}}
						/>
						)}
					</div>
					<div className="form-row mt-2 mb-1">
						{isClient && (
						<Select
							isDisabled={isloading || !data.region}
							options={districtOptions}
							className="react-select-container"
							styles={reactSelectCustomStyles}
							classNamePrefix="react-select"
							value={selectedDistrict}
							onChange={option => {
								setData({
									...data,
									district: option ? option.value : "",
									districtName: option ? option.label : ""
								});
							}}
						/>
						)}
					</div>
					<div className="form-row mt-2 mb-1">
						<input
							disabled={isloading}
							className="custom-input"
							value={data.area || ""}
							onChange={e =>
								setData({
									...data,
									area: e.target.value
								})
							}
							placeholder="Area"
							type="text"
						/>
					</div>
					<div className="form-row mt-2 mb-1">
						<input
							disabled={isloading}
							className="custom-input"
							value={data.gpsLocation || ""}
							onChange={e =>
								setData({
									...data,
									gpsLocation: e.target.value
								})
							}
							placeholder="GPS Location"
							type="text"
						/>
					</div>
					<div className="form-row mt-2 mb-1">
						<textarea
							disabled={isloading}
							id="address"
							className="form-control"
							name="address"
							rows={5}
							value={data.address || ""}
							onChange={e => {
								setData({ ...data, address: e.target.value });
							}}
						></textarea>
					</div>
				</div>
				<button
					disabled={!patientid || isloading}
					onClick={async () => {
						setLoading(true);
						await handlePatientInformationSave();
						setLoading(false);
					}}
					className="btn mt-3 btn-success btn-sm text-capitalize"
				>
					{isloading ? (
						<span
							className="spinner-border spinner-border-sm mr-2"
							role="status"
							aria-hidden="true"
						></span>
					) : null}
					Save current progress
				</button>
			</section>
		</>
	);
}
