"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface EmployeeOption {
     label: any
     value: number;
     data: any;
}

interface EmployeeFilteringProps {
     onSelect: (value: EmployeeOption["data"]) => void;
}

export default function EmployeeFiltering({ onSelect }: EmployeeFilteringProps) {
     const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
     const [isClientSide, setIsClientSide] = useState(false);

     const loadOptions = async (inputValue: string) => {
          if (inputValue.length > 3) {
               const response = await filteringDatabaseTables("roles", inputValue, "", 10);
               console.log(response);
               if (response && Array.isArray(response)) {
                    setFilteredEmployees(response);
                    return response.map((employee: any) => ({
                         label: (
                              <div>
                                   <strong>{employee.username.toLowerCase()}</strong>
                                   ||  
                                   <span> {employee.role.toLowerCase()} {employee.mobile || "N/A"}{employee.email.toLowerCase()}</span>
                                   <br />
                              </div>
                         ),
                         value: employee.employeeid,
                         data: employee,
                    }));
               }
          }
          return [];
     };

     const handleSelectChange = (selectedOption: EmployeeOption | null) => {
          onSelect(selectedOption?.data);
     };

     useEffect(() => {
          setIsClientSide(true);
     }, []);

     return (
          <div>
               {isClientSide && (
                    <AsyncSelect
                         cacheOptions
                         styles={reactSelectCustomStyles}
                         loadOptions={loadOptions}
                         id="employee-filtering"
                         defaultOptions={false}
                         placeholder="Filter employees here"
                         onChange={handleSelectChange}
                         formatOptionLabel={(data: EmployeeOption) => data.label}
                    />
               )}
          </div>
     );
}
