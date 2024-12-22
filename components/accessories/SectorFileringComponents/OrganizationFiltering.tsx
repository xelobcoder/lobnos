"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface OrganizationOption {
     label: JSX.Element;
     value: number;
     content: any;
}

interface OrganizationFilteringProps {
     onSelect: (value: OrganizationOption) => void;
}

export default function OrganizationFiltering({ onSelect }: OrganizationFilteringProps) {
     const [filteredResult, setFilteredResult] = useState<any[]>([]);
     const [isClient, setIsClient] = useState(false);

     const loadOptions = async (inputValue: string) => {
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("organization", inputValue, "", 10);
               if (response && Array.isArray(response)) {
                    setFilteredResult(response);
                    return response.map((item: any) => ({
                         label: (
                              <div>
                                   <strong>{item.name}</strong>
                                   <br />
                                   <span>{item.address}</span>
                                   <br />
                                   <span>{item.contact}</span>
                                   <br />
                                   <span>{item.location}</span>
                              </div>
                         ),
                         value: item.id,
                         content: item,
                    }));
               }
          }
          return [];
     };

     const handleSelectChange = (selectedOption: OrganizationOption) => {
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
                         placeholder="Type at least 4 characters to search"
                         onChange={handleSelectChange}
                         formatOptionLabel={(data: OrganizationOption) => data.label}
                    />
               )}
          </div>
     );
}
