"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { customFetch, reactSelectCustomStyles } from "../../Auth/customFetch";
import { Card, Spinner } from "react-bootstrap";


interface ClinicianFilteringOption {
     label: React.ReactNode;
     value: number;
     content: any;
}

interface ClinicianFilteringFilteringProps {
     onSelect: (value: any) => void;
     isDisabled?: boolean;
     isBulk?: boolean;
     isAutoLoadAll?: boolean;
}

export default function ClinicianFiltering({ onSelect, isDisabled = false, isBulk = false , isAutoLoadAll = false }: ClinicianFilteringFilteringProps) {
     const [filteredResult, setFilteredResult] = useState<any[]>([]);
     const [isClient, setIsClient] = useState(false);
     const [loadingAll, setLoadingAll] = useState(false);
     const [selectedOption, setSelectedOption] = useState<any>(null);


     const returnedFormat = (data: any[]) => {
          return data.map((item: any) => ({
               label: (
                    <div>
                         <strong>{item.name}</strong>
                    </div>
               ),
               labelText: item.name, // for getOptionLabel
               value: item.outsourceid,
               content: item,
          }));
     };

     const loadOptions = async (inputValue: string) => {
          console.log("Loading options for input:", inputValue);
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("clinicianbasicinfo", inputValue, "", 10);
               if (response && Array.isArray(response)) {
                    setFilteredResult(response);
                    return returnedFormat(response);   
                         
               }
          }
          return [];
     };

 
     const handleSelectChange = (selectedOption: any) => {
          setSelectedOption(selectedOption);
          if (selectedOption) {
               onSelect(selectedOption.content);
          }
     };

     const handleLoadAll = async () => {
          setLoadingAll(true);
          try {
               const data = await customFetch("clinicians/all");
               const { status, statusCode, result } = data;
               if (Array.isArray(result) && status === "success" && statusCode === 200) {
                    setFilteredResult(result);
               }
          } catch (err) {
               setFilteredResult([]);
          }
          setLoadingAll(false);
     };

     useEffect(() => {
          setIsClient(true);
     }, []);

     return (
          <Card>
               <Card.Body>
                    <div className="d-flex align-items-center mb-2 bg-secondary bg-opacity-10 p-2 rounded">
                         <label className="mb-0 me-2">Clinician Name</label>
                         {isBulk && (
                              <button className="btn btn-sm btn-outline-primary ms-auto" type="button" onClick={handleLoadAll} disabled={loadingAll}>
                                   {loadingAll ? 'Loading...' : 'Load All'}
                              </button>
                         )}
                    </div>
                    {loadingAll && (
                         <div className="d-flex align-items-center mb-2">
                              <Spinner animation="border" size="sm" className="me-2" />
                              <span>Loading clinicians...</span>
                         </div>
                    )}
                    {!isBulk && isClient && <AsyncSelect
                         cacheOptions
                         styles={reactSelectCustomStyles}
                         loadOptions={loadOptions}
                         isDisabled={filteredResult.length === 0 || loadingAll || isDisabled}
                         id="template-filtering"
                         placeholder={loadingAll ? 'Loading data ...' : (isBulk ? "Select clinician from all..." : "Filter clinician and Health Pract...")}
                         onChange={handleSelectChange}
                         formatOptionLabel={(data: ClinicianFilteringOption) => data.label}
                         getOptionLabel={(option: any) => option.labelText || option.name || ""}
                         getOptionValue={(option: any) => option.value || option.id}
                    />}

                    {isBulk && isClient && (
                         <Select
                              options={filteredResult.map((item: any) => ({
                                   label: item.name,
                                   labelText: item.name,
                                   value: item.outsourceid || item.id,
                                   content: item,
                              }))}
                              value={selectedOption}
                              isDisabled={filteredResult.length === 0 || loadingAll || isDisabled}
                              isClearable={true}
                              onChange={handleSelectChange}
                              placeholder="Select clinician from all..."
                              styles={reactSelectCustomStyles}
                              getOptionLabel={(option: any) => option.labelText || option.label || option.name || ""}
                              getOptionValue={(option: any) => option.value || option.id}
                              formatOptionLabel={(option: any) => (
                                   <div>
                                        <strong>{option.labelText || option.label}</strong>
                                        {option.content?.specialty && <span className="ms-2 text-muted">({option.content.specialty})</span>}
                                   </div>
                              )}
                              noOptionsMessage={() => loadingAll ? 'Loading clinicians...' : 'No clinicians found'}
                              menuPlacement="auto"
                              classNamePrefix="clinician-select"
                              hideSelectedOptions={false}
                         />
                    )}
               </Card.Body>
          </Card>
     );
}
