"use client"
import { useState, useEffect } from "react";
import Select from "react-select";
import RenderInput from "./CustomInput";
import { ghanaDistricts } from "./fields/Util";
import { submitFormData } from "../Auth/registerclient";
import { reactSelectCustomStyles } from "../Auth/customFetch";


export default function Addressing({ defaultData, fields, patientid, toast }) {
	const [isClient, setClient] = useState(false);
	const [data, setData] = useState({
		...defaultData,
		region: "",
		districtCode: "",
		districtName: "",
		area: defaultData?.area || "",
		gpsLocation: defaultData?.gpsLocation || "",
		address: defaultData?.address || ""
	});
	const [isloading, setLoading] = useState(false);
	const [districtOptions, setDistrictOptions] = useState([]);
	const [regionOptions, setRegionOptions] = useState([]);

	const clearForm = () => {
		setData({
			...defaultData,
			region: "",
			districtCode: "",
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

	const selectedDistrict = districtOptions.find(option => option.value === data.districtCode);

	return (
		<>
			<section className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
				{isloading && <div>Loading data.........................</div>}
				<div>
					<div className="form-row">
						<RenderInput
							visible={fields.region.visible}
							value={fields.region}
							displaylabel={true}
							label="Region"
							field={
								isClient && (
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
												districtCode: "",
												districtName: ""
											});
										}}
									/>
								)
							}
						/>
					</div>
					<div className="form-row">
						<RenderInput
							visible={fields.district.visible}
							value={fields.district}
							displaylabel={true}
							label="District"
							field={
								isClient && (
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
												districtCode: option ? option.value : "",
												districtName: option ? option.label : ""
											});
										}}
									/>
								)
							}
						/>
					</div>
					<div className="form-row">
						<RenderInput
							visible={fields.area.visible}
							value={fields.area}
							displaylabel={true}
							label="Area"
							field={
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
							}
						/>
					</div>
					<div className="form-row">
						<RenderInput
							visible={fields.gpsLocation.visible}
							value={fields.gpsLocation}
							displaylabel={true}
							label="GPS Location or Landmark"
							field={
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
							}
						/>
					</div>
					<div className="form-row">
						<RenderInput
							visible={fields.address.visible}
							value={fields.address}
							displaylabel={true}
							label="Address"
							field={
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
							}
						/>
					</div>
				</div>
				<button
					disabled={!patientid || isloading}
					onClick={async () => {
						setLoading(true);
						await submitFormData(`register/addressinginformation?patientid=${patientid}`, data, toast);
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
