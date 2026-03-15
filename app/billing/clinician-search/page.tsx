"use client";

import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { RiArrowLeftLine, RiSearchLine } from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";

const fieldMapping = {
     "name": "name",
     "location": "location",
     "address": "address",
     "occupation": "occupation",
     "organization": "organization",
     "phone": "phone",
     "email": "email",
     "identifier": "identifier",
};

interface Clinician {
     id?: number;
     clinicianid?: number;
     name?: string;
     firstname?: string;
     lastname?: string;
     email?: string;
     phone?: string;
     mobile?: string;
     specialization?: string;
     license?: string;
     role?: string;
     [key: string]: any;
}

interface ClinicianOption {
     value: number;
     fullname: string;
     label: string;
     export: Clinician;
}

export default function ClinicianSearch() {
     const [isLoading, setLoading] = useState(false);
     const [isClient, setIsClient] = useState(false);
     const [selectedField, setSelectedField] = useState("name");
     const [searchInput, setSearchInput] = useState("");
     const [options, setOptions] = useState<ClinicianOption[]>([]);
     const [selectedClinicians, setSelectedClinicians] = useState<ClinicianOption[]>([]);

     const goBack = () => {
          window.history.back();
     };

     const handleCheckboxChange = (option: ClinicianOption) => {
          const isSelected = selectedClinicians.some((p) => p.value === option.value);
          if (isSelected) {
               setSelectedClinicians(selectedClinicians.filter((p) => p.value !== option.value));
          } else {
               setSelectedClinicians([...selectedClinicians, option]);
          }
     };

     const handleSelectAll = (isChecked: boolean) => {
          if (isChecked) {
               setSelectedClinicians(options);
          } else {
               setSelectedClinicians([]);
          }
     };

     const handleSubmitSelected = () => {
          console.log("Selected Clinicians:", selectedClinicians.map((p) => p.export));
     };

     const loadClinicianOptions = async (inputValue: string) => {
          setLoading(true);
          try {
               const response = await customFetch(`clinicians?${selectedField}=${encodeURIComponent(inputValue)}`);

               // Extract result from response object
               const result = response?.result || response || [];

               if (!Array.isArray(result) || result.length === 0) {
                    setOptions([]);
                    return [];
               }

               const clinicians = result.map((clinician: Clinician) => ({
                    value: clinician.id || 0,
                    fullname: clinician.name || "N/A",
                    label: `Location: ${clinician.location || "N/A"}, Phone: ${clinician.phone || "N/A"}, Email: ${clinician.email || "N/A"}`,
                    export: clinician,
               })) as ClinicianOption[];

               setOptions(clinicians);
               return clinicians;
          } catch (error) {
               console.error("Error loading clinicians:", error);
               setOptions([]);
               return [];
          } finally {
               setLoading(false);
          }
     };

     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setSearchInput(value);
     };

     const handleSearchButton = () => {
          if (searchInput.length >= 3) {
               loadClinicianOptions(searchInput);
          }
     };

     useEffect(() => {
          setIsClient(true);
          setSearchInput("");
          setOptions([]);
     }, []);

     return (
          <Container className="py-4" style={{ maxWidth: 900 }}>
               <div className="mb-4 d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold">Search Clinicians</h2>
                    <button
                         className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                         onClick={goBack}
                    >
                         <RiArrowLeftLine size={18} className="me-2" />
                         Back
                    </button>
               </div>

               <div className="card border border-light border-2 mb-4">
                    <div className="card-body p-4">
                         <div className="row g-2">
                              <div className="col-md-3">
                                   <label htmlFor="filterField" className="form-label fw-bold small">
                                        Filter By Field
                                   </label>
                                   <select
                                        id="filterField"
                                        className="form-select custom-select"
                                        value={selectedField}
                                        onChange={(e) => {
                                             setSelectedField(e.target.value);
                                             setOptions([]);
                                             setSelectedClinicians([]);
                                             setSearchInput("");
                                        }}
                                   >
                                        {Object.entries(fieldMapping).map(([key, value]) => (
                                             <option key={key} value={key}>
                                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                              <div className="col-md-9">
                                   <label className="form-label fw-bold small">Search</label>
                                   <div className="input-group">
                                        <span className="input-group-text bg-transparent border-end-0">
                                             <RiSearchLine size={18} className="text-muted" />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control shadow-none border-start-0"
                                             placeholder={`Search by ${selectedField}...`}
                                             value={searchInput}
                                             onChange={handleSearchChange}
                                             disabled={isLoading}
                                        />
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={handleSearchButton}
                                             disabled={isLoading || searchInput.length < 3}
                                        >
                                             {isLoading ? (
                                                  <>
                                                       <span className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                       </span>
                                                       Loading
                                                  </>
                                             ) : (
                                                  "Search"
                                             )}
                                        </button>
                                   </div>
                                   {isLoading && (
                                        <div className="mt-2 text-muted small d-flex align-items-center">
                                             <div className="spinner-border spinner-border-sm me-2" role="status">
                                                  <span className="visually-hidden">Loading...</span>
                                             </div>
                                             Searching for clinicians...
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Results Table */}
               {options.length > 0 && (
                    <div className="card border border-light border-2 mb-4">
                         <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="fw-bold mb-0">Search Results ({options.length})</h5>
                                   {selectedClinicians.length > 0 && (
                                        <button
                                             type="button"
                                             className="btn btn-success"
                                             onClick={handleSubmitSelected}
                                        >
                                             Select {selectedClinicians.length} Clinician
                                             {selectedClinicians.length > 1 ? "s" : ""}
                                        </button>
                                   )}
                              </div>
                              <div className="table-responsive">
                                   <table className="table table-hover table-sm table-striped">
                                        <thead className="table-light sticky-top">
                                             <tr>
                                                  <th style={{ width: "30px" }}>
                                                       <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={
                                                                 selectedClinicians.length === options.length &&
                                                                 options.length > 0
                                                            }
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            title="Select All"
                                                       />
                                                  </th>
                                                  <th>Name</th>
                                                  <th>Location</th>
                                                  <th>Phone</th>
                                                  <th>Email</th>
                                                  <th>Identifier</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {options.map((option) => (
                                                  <tr
                                                       key={option.value}
                                                       style={{
                                                            backgroundColor: selectedClinicians.some(
                                                                 (p) => p.value === option.value
                                                            )
                                                                 ? "#f0f0f0"
                                                                 : "",
                                                       }}
                                                  >
                                                       <td style={{ width: "30px" }}>
                                                            <input
                                                                 type="checkbox"
                                                                 className="form-check-input"
                                                                 checked={selectedClinicians.some(
                                                                      (p) => p.value === option.value
                                                                 )}
                                                                 onChange={() => handleCheckboxChange(option)}
                                                            />
                                                       </td>
                                                       <td className="fw-semibold">{option.fullname}</td>
                                                       <td>{option.export.location || "-"}</td>
                                                       <td>{option.export.phone || "-"}</td>
                                                       <td>{option.export.email || "-"}</td>
                                                       <td>
                                                            <span className="badge bg-info">
                                                                 {option.export.identifier || "-"}
                                                            </span>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               )}
          </Container>
     );
}
