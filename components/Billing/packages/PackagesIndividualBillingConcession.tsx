"use client";

import React, { useState } from "react";
import TestFiltering, { TestDetails } from "../../accessories/SectorFileringComponents/TestFiltering";



interface SelectedTest {
    testName: string;
    originalPrice: number;
    concessionValue: number;
    discountedValue: number;
    actualPrice: number;
    testid: number;
    concessionMode: "absolute" | "percentage" | "none"; 
}

interface ClinicianIndividualBillingConcessionProps {
    setSelectedTests: React.Dispatch<React.SetStateAction<SelectedTest[]>>;
}

const PackagesIndividualBillingConcession: React.FC<ClinicianIndividualBillingConcessionProps> = ({
    setSelectedTests,
}) => {
    const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage" | "none">("none"); 
    const [concessionValueInput, setConcessionValueInput] = useState<string>("");
    const [currentTest, setCurrentTest] = useState<TestDetails | null>(null);
    const [isTestSelected, setIsTestSelected] = useState(false);

    const handleSelectedTest = (test: TestDetails) => {
        setCurrentTest(test);
        setIsTestSelected(true);
    };

    const handleConcessionDetails = () => {
        if (!currentTest) return;

        let concessionValue = 0;
        let discountedValue = 0;
        let actualPrice = currentTest.price;

        if (selectionMode !== "none" && concessionValueInput !== "") {
            concessionValue = parseFloat(concessionValueInput);
            discountedValue =
                selectionMode === "absolute"
                    ? concessionValue
                    : (concessionValue / 100) * currentTest.price;
            actualPrice = currentTest.price - discountedValue;
        }

        const newTest = {
            testName: currentTest.name,
            originalPrice: currentTest.price,
            concessionValue,
            discountedValue,
            actualPrice,
            testid: currentTest.id,
            concessionMode: selectionMode,
        };

        setSelectedTests((prevSelectedTests) => {
            if (!prevSelectedTests.some((test) => test.testid === newTest.testid)) {
                return [...prevSelectedTests, newTest];
            }
            return prevSelectedTests;
        });

        setIsTestSelected(false);
        setConcessionValueInput("");
        setCurrentTest(null);
    };

    return (
        <div className="list-group-item">
            <div>
                <p className="text-sm">
                    This option allows you to apply custom concession amounts to specific tests or retain the original price. You can specify whether the concession is an absolute amount, a percentage of the test price, or no concession at all. For instance, a 10 cedis reduction will directly subtract 10 from the test price, while a 10% concession will deduct 10% of the test price. If no concession is applied, the original price will be retained.
                </p>
            </div>

            <TestFiltering onSelect={handleSelectedTest} />

            {isTestSelected && currentTest && (
                <div>
                    <div className="form-row mt-3">
                        <label>Concession Mode</label>
                        <br />
                        <select
                            className="custom-select col-3"
                            value={selectionMode}
                            onChange={(e) => {
                                setSelectionMode(e.target.value as "absolute" | "percentage" | "none");
                                if (e.target.value === "none") {
                                    setConcessionValueInput(""); // Clear concession value if "none" is selected
                                }
                            }}
                        >
                            <option value="none">No Concession</option>
                            <option value="absolute">Absolute</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    </div>

                    {selectionMode !== "none" && (
                        <div className="form-row mt-3">
                            <label>Concession Amount</label>
                            <br />
                            <input
                                type="number"
                                className="custom-input col-3"
                                value={concessionValueInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (selectionMode === "percentage" && parseInt(value) > 100) {
                                        setConcessionValueInput("99");
                                    } else {
                                        setConcessionValueInput(value);
                                    }
                                }}
                                placeholder="Enter amount"
                            />
                        </div>
                    )}

                    <div className="mt-3">
                        <button className="btn btn-success btn-sm" onClick={handleConcessionDetails}>
                            Add to Selected Tests
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagesIndividualBillingConcession;