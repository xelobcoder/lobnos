"use client";

import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { filteringDatabaseTables } from "../../serverActions/ActionFiltering";
import { currencyFormatter, reactSelectCustomStyles } from "../../Auth/customFetch";

export type TestDetails = {
    prim_key: number;
    name: string;
    category: number;
    price: number;
    created_on: string;
    sample: number;
    description: string | null;
    sample_container: string;
    unit: string;
    qty_required: string;
    shorttext: string;
    iscustom: number;
    id: number;
};

interface TestPanelOption {
    label: any
    value: number;
    content: TestDetails;
}

interface TestFilteringProps {
    onSelect: (value: TestDetails) => void;
}

export default function TestFiltering({ onSelect }: TestFilteringProps) {
    const [filteredTestPanels, setFilteredTestPanels] = useState<TestDetails[]>([]);
    const [isClientSide, setIsClientSide] = useState(false);

    const loadOptions = async (inputValue: string): Promise<TestPanelOption[]> => {
        if (inputValue.length > 3) {
            try {
                const response = await filteringDatabaseTables("test_panels", inputValue, "", 10);
                if (response && Array.isArray(response)) {
                    const mappedOptions = response.map((panel: TestDetails) => ({
                        label: (
                            <div className="d-flex justify-content-between">
                                <span>{panel.name}</span>
                                <span>{currencyFormatter.format(panel.price)}</span>
                            </div>
                        ),
                        value: panel.id,
                        content: panel,
                    }));
                    setFilteredTestPanels(response);
                    return mappedOptions;
                }
            } catch (error) {
                console.error("Error fetching test panels:", error);
            }
        }
        return [];
    };

    const handleSelectChange = (selectedOption: TestPanelOption | null) => {
        if (selectedOption) {
            onSelect(selectedOption.content);
        }
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
                    id="test-filtering"
                    defaultOptions={false}
                    placeholder="Filter test panels here"
                    onChange={handleSelectChange}
                    formatOptionLabel={(data: TestPanelOption) => data.label}
                />
            )}
        </div>
    );
}
