"use client"
import React, { useEffect, useState } from "react"
import RenderInput from "./CustomInput"
import { submitFormData } from "../Auth/registerclient"

export default function EmmergencyContactInformation({ defaultData, fields, patientid, toast }) {
	const [data, setData] = useState(defaultData)
	const [isloading, setLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const clearForm = () => {
		setData(defaultData)
	}

	useEffect(() => {
		setLoading(false)
	}, [])

	const handleSubmit = async (ev) => {
		ev.preventDefault()
		try {
			setIsSubmitting(true)
			await submitFormData(`register/emmergencycontactinformation?patientid=${patientid}`, data, toast)
		} catch (error) {
			toast.error("An error occurred while submitting the form", { autoClose: 1000 })
			console.error("Submission error", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="col-sm-12 col-md-12 col-lg-6 col-xl-6">
			<div className="form-row">
				<RenderInput
					visible={fields.emmergencyContactName.visible}
					value={fields.emmergencyContactName}
					label={"Emergency Contact Name"}
					field={
						<input
							disabled={isloading}
							type="text"
							className="custom-input"
							id="emergencyName"
							name="emergencyName"
							value={data.emmergencyContactName}
							onChange={(e) =>
								setData({
									...data,
									emmergencyContactName: e.target.value,
								})
							}
						/>
					}
				/>
			</div>
			<div className="form-row">
				<RenderInput
					visible={fields.relationship.visible}
					value={fields.relationship}
					label={"Relationship"}
					field={
						<select
							disabled={isloading}
							className="custom-select"
							id="relationship"
							name="relationship"
							value={data.relationship}
							onChange={(e) =>
								setData({
									...data,
									relationship: e.target.value,
								})
							}
						>
							<option value="">Select Relationship</option>
							<option value="Parent">Parent</option>
							<option value="Sibling">Sibling</option>
							<option value="Spouse">Spouse</option>
							<option value="Friend">Friend</option>
						</select>
					}
				/>
			</div>
			<div className="form-row">
				<RenderInput
					visible={fields.emmergencyContactNumber.visible}
					value={fields.emmergencyContactNumber}
					label={"Emergency Contact Number"}
					field={
						<input
							disabled={isloading}
							type="tel"
							inputMode="tel"
							className="custom-input"
							minLength={10}
							maxLength={10}
							id="emergencyContactNumber"
							name="emergencyContactNumber"
							value={data.emmergencyContactNumber}
							onChange={(e) =>
								setData({
									...data,
									emmergencyContactNumber: e.target.value,
								})
							}
						/>
					}
				/>
			</div>
			<div className="form-row">
				<RenderInput
					visible={fields.address.visible}
					value={fields.address}
					label={"Address"}
					field={
						<input
							disabled={isloading}
							type="text"
							className="custom-input"
							id="address"
							name="address"
							value={data.address}
							onChange={(e) =>
								setData({
									...data,
									address: e.target.value,
								})
							}
						/>
					}
				/>
			</div>
			<div className="form-row">
				<RenderInput
					visible={fields.occupation.visible}
					value={fields.occupation}
					label={"Occupation"}
					field={
						<input
							disabled={isloading}
							type="text"
							className="custom-input"
							id="occupation"
							name="occupation"
							value={data.occupation}
							onChange={(e) =>
								setData({
									...data,
									occupation: e.target.value,
								})
							}
						/>
					}
				/>
			</div>
			<button
				disabled={!patientid || isSubmitting}
				onClick={handleSubmit}
				className="btn mt-3 btn-success btn-sm text-capitalize"
			>
				{isSubmitting && (
					<span
						className="spinner-border spinner-border-sm mr-2"
						role="status"
						aria-hidden="true"
					></span>
				)}
				save current progress
			</button>
		</div>
	)
}
