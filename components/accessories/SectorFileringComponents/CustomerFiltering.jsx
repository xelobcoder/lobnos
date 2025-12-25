"use client"
import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../../lib/appointment";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

export default function PatientFiltered({ getSelectedPatient, isDisabled=false, placeholder = "Search patient using patient ID, email, fullname" }) {
	const [isLoading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [isClient, setIsClient] = useState(false);


	const loadClientOptions = async (inputValue) => {
		setLoading(true);
		try {
			setSelectedOption(null);
			const result = await loadOptions(inputValue);
			if (!Array.isArray(result) || result.length == 0) return 
			const clients = result.map((client) => ({
				value: client.patientid,
				fullname: `${client.firstname.charAt(0).toUpperCase()}${client.firstname.slice(1)} ${client.middlename
					} ${client.lastname.trim()} (ID: ${client.fullpatientid}) **** ${client.patientid} AS SHORTCUT\n`,
				label: `DOB: ${new Date(client.dob).toLocaleDateString()}, Gender: ${client.gender}, Age: ${client.age} ${client.agetype},\nContact: ${client.mobile_number
					}  Registered on: ${new Date(client.date).toLocaleDateString()}`,
				export: client,
			}));
			return clients;
		} catch (error) {
			console.error("Failed to load options:", error);
			return [];
		} finally {
			setLoading(false);
		}
	};

	const handleSelectChange = (selectedOption) => {
		setSelectedOption(selectedOption);
		getSelectedPatient(selectedOption?.export);
	};

	const formatOptionLabel = ({ label, fullname }) => {
		return !selectedOption ? (
			<div style={{ whiteSpace: "pre-wrap", margin: "0" }}>
				<div style={{ fontWeight: 500 }} className="text-uppercase">
					{fullname}
				</div>
				<div style={{ fontWeight: 400 }}>{label}</div>
			</div>
		) : (
			<div style={{ fontWeight: 500 }} className="text-uppercase">
				{fullname}
			</div>
		);
	};

	useEffect(() => { setIsClient(true) }, [])
	return (
		<div style={{ width: '100%' }}>
			{
				isClient && <AsyncSelect
					styles={reactSelectCustomStyles}
					className="react-select-container"
					classNamePrefix="react-select"
					isClearable={true}
					isLoading={isLoading}
					isDisabled={isDisabled}
					loadOptions={loadClientOptions}
					defaultOptions={[]}
					placeholder={placeholder}
					onChange={handleSelectChange}
					blurInputOnSelect={true}
					value={selectedOption}
					formatOptionLabel={formatOptionLabel}
				/>

			}
		</div>
	)
}
