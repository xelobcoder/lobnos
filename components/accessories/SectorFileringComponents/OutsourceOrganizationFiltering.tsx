"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface OutsourceOrganizationOption {
     label: any
     value: number;
     content: any;
}

interface OutsourceOrganizationFilteringProps {
     onSelect: (value: OutsourceOrganizationOption) => void;
}

export default function OutsourceOrganizationFiltering({ onSelect }: OutsourceOrganizationFilteringProps) {
     const [filteredResult, setFilteredResult] = useState<any[]>([]);
     const [isClient, setIsClient] = useState(false);

     const loadOptions = async (inputValue: string) => {
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("outsourcingorganization", inputValue, "", 10);
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

     const handleSelectChange = (selectedOption: OutsourceOrganizationOption | null) => {
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
                         formatOptionLabel={(data: OutsourceOrganizationOption) => data.label}
                    />
               )}
          </div>
     );
}
