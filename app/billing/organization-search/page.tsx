"use client";

import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { RiArrowLeftLine, RiSearchLine } from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";

interface Organization {
     id?: number;
     name?: string;
     location?: string;
     street?: string;
     mobile?: string;
     address?: string;
     email?: string;
     [key: string]: any;
}

interface OrganizationOption {
     value: number;
     fullname: string;
     label: string;
     export: Organization;
}

export default function OrganizationSearch() {
     const [isLoading, setLoading] = useState(false);
     const [isClient, setIsClient] = useState(false);
     const [searchInput, setSearchInput] = useState("");
     const [options, setOptions] = useState<OrganizationOption[]>([]);
     const [selectedOrganizations, setSelectedOrganizations] = useState<OrganizationOption[]>([]);

     const goBack = () => {
          window.history.back();
     };

     const handleCheckboxChange = (option: OrganizationOption) => {
          const isSelected = selectedOrganizations.some((p) => p.value === option.value);
          if (isSelected) {
               setSelectedOrganizations(selectedOrganizations.filter((p) => p.value !== option.value));
          } else {
               setSelectedOrganizations([...selectedOrganizations, option]);
          }
     };

     const handleSelectAll = (isChecked: boolean) => {
          if (isChecked) {
               setSelectedOrganizations(options);
          } else {
               setSelectedOrganizations([]);
          }
     };

     const handleSubmitSelected = () => {
          console.log("Selected Organizations:", selectedOrganizations.map((p) => p.export));
     };

     const loadOrganizationOptions = async (inputValue: string) => {
          setLoading(true);
          try {
               const response = await customFetch(
                    `organizations/details?count=10&page=1&organization=${encodeURIComponent(inputValue)}`
               );

               // Extract result from response object
               const result = response?.result || response || [];

               if (!Array.isArray(result) || result.length === 0) {
                    setOptions([]);
                    return [];
               }

               const organizations = result.map((organization: Organization) => ({
                    value: organization.id || 0,
                    fullname: organization.name || "N/A",
                    label: `Location: ${organization.location || "N/A"}, Street: ${organization.street || "N/A"}, Mobile: ${organization.mobile || "N/A"}`,
                    export: organization,
               })) as OrganizationOption[];

               setOptions(organizations);
               return organizations;
          } catch (error) {
               console.error("Error loading organizations:", error);
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
               loadOrganizationOptions(searchInput);
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
                    <h2 className="fw-bold">Search Organizations</h2>
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
                              <div className="col-12">
                                   <label className="form-label fw-bold small">Search Organization</label>
                                   <div className="input-group">
                                        <span className="input-group-text bg-transparent border-end-0">
                                             <RiSearchLine size={18} className="text-muted" />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control shadow-none border-start-0"
                                             placeholder="Enter organization name..."
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
                                             Searching for organizations...
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
                                   {selectedOrganizations.length > 0 && (
                                        <button
                                             type="button"
                                             className="btn btn-success"
                                             onClick={handleSubmitSelected}
                                        >
                                             Select {selectedOrganizations.length} Organization
                                             {selectedOrganizations.length > 1 ? "s" : ""}
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
                                                                 selectedOrganizations.length === options.length &&
                                                                 options.length > 0
                                                            }
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                            title="Select All"
                                                       />
                                                  </th>
                                                  <th>Name</th>
                                                  <th>Location</th>
                                                  <th>Street</th>
                                                  <th>Mobile</th>
                                                  <th>Email</th>
                                                  <th>Address</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {options.map((option) => (
                                                  <tr
                                                       key={option.value}
                                                       style={{
                                                            backgroundColor: selectedOrganizations.some(
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
                                                                 checked={selectedOrganizations.some(
                                                                      (p) => p.value === option.value
                                                                 )}
                                                                 onChange={() => handleCheckboxChange(option)}
                                                            />
                                                       </td>
                                                       <td className="fw-semibold">{option.fullname}</td>
                                                       <td>{option.export.location || "-"}</td>
                                                       <td>{option.export.street || "-"}</td>
                                                       <td>{option.export.mobile || "-"}</td>
                                                       <td>{option.export.email || "-"}</td>
                                                       <td>{option.export.address || "-"}</td>
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
