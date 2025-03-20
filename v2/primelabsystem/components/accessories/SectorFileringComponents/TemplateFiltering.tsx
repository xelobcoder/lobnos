"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

export default function TemplateFiltering({ onSelect }: { onSelect: (value: any) => void }) {
     const [filteredResult, setFilteredResult] = useState<any[]>([]);
     const [isClient, setIsClient] = useState(false);

     const loadOptions = async (inputValue: string) => {
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("smstemplate", inputValue, "", 10);
               if (response && Array.isArray(response)) {
                    setFilteredResult(response);
                    return response.map((item: any) => ({
                         label: (
                              <div>
                                   <strong>{item.templateName}</strong>
                                   <br />
                                   <span>{item.smscontent}</span>
                              </div>
                         ),
                         value: item.tempateid,
                         content: item
                    }));
               }
          }
          return [];
     };

     const handleSelectChange = (selectedOption: any) => {
          onSelect(selectedOption);
     };

     useEffect(() => {
          setIsClient(true);
     }, []);

     return (
          <div >
               {isClient && (
                    <AsyncSelect
                         cacheOptions
                         styles={reactSelectCustomStyles}
                         loadOptions={loadOptions}
                         id="template-filtering"
                         defaultOptions={false}
                         placeholder="Type at least 4 characters to search"
                         onChange={handleSelectChange}
                         formatOptionLabel={(data: any) => data.label}
                    />
               )}
          </div>
     );
}
