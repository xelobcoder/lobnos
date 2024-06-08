import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../lib/appointment";

export default function PatientFiltered({ getSelectedPatient }) {
  const [isLoading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: "auto",
      minHeight: "40px",
    }),
    menu: (base) => ({
      ...base,
      maxHeight: "500px",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "500px",
    }),
    valueContainer: (base) => ({
      ...base,
      overflow: "visible",
    }),
    singleValue: (base) => ({
      ...base,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
  };

  const loadClientOptions = async (inputValue) => {
    setLoading(true);
    try {
      setSelectedOption(null);
      const result = await loadOptions(inputValue);
      const clients = result.map((client) => ({
        value: client.patientid,
        fullname: `${client.firstname.charAt(0).toUpperCase()}${client.firstname.slice(1)} ${
          client.middlename
        } ${client.lastname.trim()} (ID: ${client.patientid})\n`,
        label: `DOB: ${new Date(client.dob).toLocaleDateString()}, Gender: ${client.gender}, Age: ${client.age},\nContact: ${
          client.mobile_number
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

  return (
    <AsyncSelect
      styles={customStyles}
      isClearable={true}
      isLoading={isLoading}
      loadOptions={loadClientOptions}
      defaultOptions={[]}
      onChange={handleSelectChange}
      blurInputOnSelect={true}
      value={selectedOption}
      formatOptionLabel={formatOptionLabel}
    />
  );
}
