"use client"
import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../../lib/appointment";
import { reactSelectCustomStyles } from "../../../lib/customFetch";

// Update the Patient interface
interface Patient {
  patientid: number;  // Changed from string to number
  firstname: string;
  middlename: string;
  lastname: string;
  dob: string;
  gender: string;
  age: number;
  agetype: string;
  mobile_number: string;
  date: string;
}

// Update the PatientOption interface
interface PatientOption {
  value: string;  // Keep as string since we convert patientid to string in the mapping
  fullname: string;
  label: string;
  export: Patient;
}

interface PatientFilteredProps {
  getSelectedPatient: (patient: Patient | undefined) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export default function PatientFiltered({ 
  getSelectedPatient, 
  isDisabled, 
  placeholder = "Search patient using patient ID, email, fullname" 
}: PatientFilteredProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<PatientOption | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  const loadClientOptions = async (inputValue: string): Promise<PatientOption[]> => {
    setLoading(true);
    try {
      setSelectedOption(null);
      const result = await loadOptions(inputValue);
      const clients = result.map((client: Patient) => ({
        value: client.patientid.toString(), // Convert number to string
        fullname: `${client.firstname.charAt(0).toUpperCase()}${client.firstname.slice(1)} ${client.middlename
          } ${client.lastname.trim()} (ID: ${client.patientid})\n`,
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

  const handleSelectChange = (selectedOption: PatientOption | null) => {
    setSelectedOption(selectedOption);
    getSelectedPatient(selectedOption?.export);
  };

  const formatOptionLabel = ({ label, fullname }: PatientOption) => {
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

  useEffect(() => { setIsClient(true) }, []);

  return (
    <div style={{ width: '100%' }}>
      {isClient && (
        <AsyncSelect<PatientOption>
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
      )}
    </div>
  );
}