"use client";
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import TestFiltering, { TestDetails } from '../accessories/SectorFileringComponents/TestFiltering';


interface SelectedTest {
    testName: string;
    originalPrice: number;
    concessionAmount: number;
    discountedAmount: number;
    actualPrice: number;
}

interface ClinicianIndividualBillingConcessionProps {
    onSelect: (test: { name: string; price: number }) => void;
    selectedTests: SelectedTest[];
    setSelectedTests: React.Dispatch<React.SetStateAction<SelectedTest[]>>;
}

const ClinicianIndividualBillingConcession: React.FC<ClinicianIndividualBillingConcessionProps> = ({ onSelect, selectedTests, setSelectedTests }) => {
    const [selectionMode, setSelectionMode] = useState<'absolute' | 'percentage'>('absolute');
    const [concessionAmount, setConcessionAmount] = useState<string>('');
    const [currentTest, setCurrentTest] = useState<TestDetails | null>(null);
    const [isTestSelected, setIsTestSelected] = useState(false);

    const handleSelectedTest = (test: TestDetails) => {
        setCurrentTest(test);
        setIsTestSelected(true);
    };

    const handleConcessionDetails = () => {
        if (!currentTest || concessionAmount === '') return;

        const concessionValue = parseFloat(concessionAmount);
        const discountedAmount =
            selectionMode === 'absolute' ? concessionValue : (concessionValue / 100) * currentTest.price;

        const actualPrice = currentTest.price - discountedAmount;

        const newTest = {
            testName: currentTest.name,
            originalPrice: currentTest.price,
            concessionAmount: concessionValue,
            discountedAmount: discountedAmount,
            actualPrice: actualPrice,
        };

        setSelectedTests((prevSelectedTests) => {
            if (!prevSelectedTests.some((test) => test.testName === newTest.testName)) {
                return [...prevSelectedTests, newTest];
            }
            return prevSelectedTests;
        });

        setIsTestSelected(false);
        setConcessionAmount('');
        setCurrentTest(null);
    };

    return (
        <div className="list-group-item">
            <div>
                <p className="text-sm">
                    This option allows you to apply custom concession amounts to specific tests rather than applying them across all tests. For each test, you can
                    specify whether the concession is an absolute amount or a percentage of the test price. For instance, a 10 cedis reduction will directly subtract
                    10 from the test price, while a 10% concession will deduct 10% of the test price. This provides greater flexibility in tailoring pricing adjustments
                    to individual tests.
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
                            onChange={(e) => setSelectionMode(e.target.value as 'absolute' | 'percentage')}
                        >
                            <option value="absolute">Absolute</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    </div>

                    <div className="form-row mt-3">
                        <label>Concession Amount</label>
                        <br />
                        <input
                            type="number"
                            className="custom-input col-3"
                            value={concessionAmount}
                            onChange={(e) => setConcessionAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="mt-3">
                        <button
                            className="btn btn-success"
                            onClick={handleConcessionDetails}
                        >
                            Add to Selected Tests
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicianIndividualBillingConcession;
