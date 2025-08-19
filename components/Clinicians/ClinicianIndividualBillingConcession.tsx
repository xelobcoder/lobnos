"use client";

import React, { useState } from "react";
import TestFiltering, { TestDetails } from "../accessories/SectorFileringComponents/TestFiltering";
import styles from '../../styles/SmsTemplateList.module.css'

interface SelectedTest {
    testName: string;
    originalPrice: number;
    concessionValue: number;
    discountedValue: number;
    actualPrice: number;
    testid: number;
    pricingType: "surcharge" | "discount";
    concessionMode: "absolute" | "percentage";
}

interface ClinicianIndividualBillingConcessionProps {
    setSelectedTests: any;
    selectedTests: SelectedTest[];
}

const ClinicianIndividualBillingConcession: React.FC<ClinicianIndividualBillingConcessionProps> = ({
    setSelectedTests,
    selectedTests
}) => {
    const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage">("absolute");
    const [concessionValueInput, setConcessionValueInput] = useState<string>("");
    const [currentTest, setCurrentTest] = useState<TestDetails | null>(null);
    const [isTestSelected, setIsTestSelected] = useState(false);
    const [pricingType, setPricingType] = useState<"surcharge" | "discount">("discount");




    // Handle test selection from TestFiltering component
    const handleSelectedTest = (test: TestDetails) => {
        setCurrentTest(test);
        setIsTestSelected(true);
    };

    // Handle adding concession details to selected tests
    const handleConcessionDetails = () => {
        if (!currentTest || concessionValueInput === "" || isNaN(parseFloat(concessionValueInput))) {
            // Prevent proceeding with invalid input
            return;
        }

        if (currentTest.price === 0) {
            // Reset state if test price is zero
            setIsTestSelected(false);
            setConcessionValueInput("");
            setCurrentTest(null);
            setPricingType("discount");
            return;
        }

        const concessionValue = parseFloat(concessionValueInput);
        if (concessionValue < 0) {
            // Prevent negative concession values
            return;
        }

        // Calculate discounted value based on concession mode
        const discountedValue =
            selectionMode === "absolute"
                ? concessionValue
                : (concessionValue / 100) * currentTest.price;

        // Calculate actual price based on pricing type (surcharge increases, discount decreases)
        const actualPrice =
            pricingType === "surcharge"
                ? currentTest.price + discountedValue
                : currentTest.price - discountedValue;

        // Ensure actualPrice is not negative for discounts
        if (pricingType === "discount" && actualPrice < 0) {
            return;
        }

        const newTest: SelectedTest = {
            testName: currentTest.name,
            originalPrice: currentTest.price,
            concessionValue,
            discountedValue,
            actualPrice,
            testid: parseInt(currentTest.id.toString()),
            pricingType,
            concessionMode: selectionMode,
        };

        setSelectedTests((prevSelectedTests: SelectedTest[]) => {
            const testExists = prevSelectedTests.some(t => t.testid === newTest.testid);
            if (!testExists) {
                return [...prevSelectedTests, newTest];
            }
            return prevSelectedTests.map(t => t.testid === newTest.testid ? newTest : t);
        });

        // Reset form state
        setIsTestSelected(false);
        setConcessionValueInput("");
        setCurrentTest(null);
        setPricingType("discount");
    };

    return (
        <div className="list-group-item">
            <div>
                <p className="text-sm">
                    This option allows you to apply custom concession amounts to specific tests rather than applying them across all tests. For each test, you can
                    specify whether the concession is an absolute amount or a percentage of the test price. For instance, a 10 cedis reduction will directly subtract
                    10 from the test price, while a 10% concession will deduct 10% of the test price. A surcharge will increase the test price accordingly. This provides
                    greater flexibility in tailoring pricing adjustments to individual tests.
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
                            onChange={(e) => setSelectionMode(e.target.value as "absolute" | "percentage")}
                        >
                            <option value="absolute">Absolute</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    </div>
                    <div>
                        <label>Pricing Method</label>
                        <br />
                        <select
                            className="custom-select col-3"
                            value={pricingType}
                            onChange={(e) => setPricingType(e.target.value as "surcharge" | "discount")}
                        >
                            <option value="surcharge">Surcharge</option>
                            <option value="discount">Discount</option>
                        </select>
                    </div>

                    <div className="form-row mt-3">
                        <label>Concession Amount</label>
                        <br />
                        <input
                            type="number"
                            className="custom-input col-3"
                            value={concessionValueInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setConcessionValueInput("");
                                } else if (selectionMode === "percentage" && parseFloat(value) > 100) {
                                    setConcessionValueInput("100"); // Cap percentage at 100
                                } else if (parseFloat(value) < 0) {
                                    setConcessionValueInput("0"); // Prevent negative values
                                } else {
                                    setConcessionValueInput(value);
                                }
                            }}
                            placeholder="Enter amount"
                            min="0"
                        />
                    </div>

                    <div className="mt-3">
                        <button className="btn btn-success btn-sm" onClick={handleConcessionDetails}>
                            Add to Selected Tests
                        </button>
                    </div>
                </div>
            )}

            {selectedTests && selectedTests.length > 0 && (
                <div className="mt-3">
                    <h6>Selected Tests</h6>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Test Name</th>
                                <th>Concession Mode</th>
                                <th>Concession Value</th>
                                <th>Pricing Type</th>
                                <th>Original Price</th>
                                <th>Discounted Value</th>
                                <th>Actual Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(selectedTests) && selectedTests.length > 0 && selectedTests.map(test => (
                                <tr key={test.testid}>
                                    <td>{test.testName}</td>
                                    <td>{test.concessionMode}</td>
                                    <td>{test.concessionValue}</td>
                                    <td>{test.pricingType}</td>
                                    <td>{test.originalPrice}</td>
                                    <td>{test.discountedValue}</td>
                                    <td>{test.actualPrice}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => setSelectedTests(selectedTests.filter(t => t.testid !== test.testid))}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClinicianIndividualBillingConcession;