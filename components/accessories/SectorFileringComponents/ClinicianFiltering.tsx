"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface ClinicianFilteringOption {
     label: JSX.Element;
     value: number;
     content: any;
}

interface ClinicianFilteringFilteringProps {
     onSelect: (value: ClinicianFilteringOption) => void;
}

export default function ClinicianFiltering({ onSelect }: ClinicianFilteringFilteringProps) {
     const [filteredResult, setFilteredResult] = useState<any[]>([]);
     const [isClient, setIsClient] = useState(false);

     const loadOptions = async (inputValue: string) => {
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("clinicianbasicinfo", inputValue, "", 10);
               if (response && Array.isArray(response)) {
                    setFilteredResult(response);
                    return response.map((item: any) => ({
                         label: (
                              <div>
                                   <strong>{item.name}</strong>
                                   <br />
                                   <span>{item.email}</span>
                              </div>
                         ),
                         value: item.outsourceid,
                         content: item,
                    }));
               }
          }
          return [];
     };

     const handleSelectChange = (selectedOption: ClinicianFilteringOption) => {
          onSelect(selectedOption?.content);
     };

     useEffect(() => {
          setIsClient(true);
     }, []);

     return (
          <div>
               {isClient && (
                    <AsyncSelect
                         cacheOptions
                         styles={reactSelectCustomStyles}
                         loadOptions={loadOptions}
                         id="template-filtering"
                         defaultOptions={false}
                         placeholder="Filter clinician and Health Practioners Here"
                         onChange={handleSelectChange}
                         formatOptionLabel={(data: ClinicianFilteringOption) => data.label}
                    />
               )}
          </div>
     );
}
