"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface InsuranceOrganization {
    label: any
    value: number;
    content: any;
}

interface InsuranceOrganizationFilteringProps {
    onSelect: (value: InsuranceOrganization) => void;
    isDisabled?: boolean;
}

export default function InsuranceOrganizationFiltering({ onSelect,isDisabled=false }: InsuranceOrganizationFilteringProps) {
    const [filteredResult, setFilteredResult] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    const loadOptions = async (inputValue: string) => {
        if (inputValue.length > 3) {
            const response = await filteringDatabaseTables("privateinsurance", inputValue, "", 10);
            if (response && Array.isArray(response)) {
                setFilteredResult(response);
                return response.map((item: any) => ({
                    label: (
                        <div>
                            <strong>{item.insuranceName}</strong>
                        </div>
                    ),
                    value: item.id,
                    content: item,
                }));
            }
        }
        return [];
    };

    const handleSelectChange = (selectedOption: InsuranceOrganization) => {
        onSelect(selectedOption?.content);
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div>
            {isClient && (
                <AsyncSelect
                    isClearable
                    isSearchable
                    isDisabled={isDisabled}
                    cacheOptions
                    styles={reactSelectCustomStyles}
                    loadOptions={loadOptions}
                    id="template-filtering"
                    defaultOptions={false}
                    placeholder="Type at least 4 characters"
                    onChange={handleSelectChange}
                    formatOptionLabel={(data: InsuranceOrganization) => data.label}
                />
            )}
        </div>
    );
}
