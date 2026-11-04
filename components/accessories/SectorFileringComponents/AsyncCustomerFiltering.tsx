"use client"
import { SetStateAction, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { customFetch, reactSelectCustomStyles } from "../../Auth/customFetch";
import { AsyncPatientFilteringloadOptions } from "../../serverActions/ActionFiltering";

export default function AsyncPatientFiltering({ getSelectedPatient, isDisabled = false, inputId, placeholder = "Search patient using patient ID, email, fullname" }: {
    getSelectedPatient: (patient: any) => void;
    isDisabled?: boolean;
    inputId?: string;
    placeholder?: string;
}) {
    const [isLoading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<{export?: unknown; label?: string; value?: string | number} | null>(null);
    const [isClient, setIsClient] = useState(false);


    const loadOptions = async (input: string = ''): Promise<any[]> => {
        if (input.length >= 3 && (typeof input === 'string' || typeof input == "number")) {
            const response = await customFetch(`application/filtering/table/new_patients?value=${input}&&original=&&limit=10`);
            return Array.isArray(response) ? response : [];
        }
        return [];
    };

    const loadClientOptions = async (inputValue: string) => {
        setLoading(true);
        try {
            setSelectedOption(null);
            const result = await loadOptions(inputValue);
            if (result) {
                const clients = result.map((client) => ({
                    value: client.patientid,
                    fullname: `${client.firstname.charAt(0).toUpperCase()}${client.firstname.slice(1)} ${client.middlename} ${client.lastname.trim()} (ID: ${client.patientid})\n`,
                    label: `DOB: ${new Date(client.dob).toLocaleDateString()}, Gender: ${client.gender}, Age: ${client.age} ${client.agetype},\nContact: ${client.mobile_number}  Registered on: ${new Date(client.date).toLocaleDateString()}`,
                    export: client,
                }));
                return clients;
            }
            return [];
        } catch (error) {
            console.error("Failed to load options:", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (selectedOption: {export?: unknown; label?: string; value?: string | number} | null) => {
        setSelectedOption(selectedOption);
        getSelectedPatient(selectedOption?.export);
    };

    const formatOptionLabel = ({ label, fullname }: {label?: React.ReactNode; fullname?: string}) => {
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
                isClient && <AsyncSelect<{export?: unknown; label?: string; value?: string | number}>
                    inputId={inputId}
                    instanceId={inputId}
                    noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? 'Type at least 3 characters to search' : 'No matching patients found'}
                    loadingMessage={() => 'Searching patients...'}
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
