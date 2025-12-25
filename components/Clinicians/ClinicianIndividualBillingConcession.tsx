"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { customFetch } from '../Auth/customFetch';
import styles from '../../styles/SmsTemplateList.module.css'

interface Test {
    id: number;
    name: string;
    price: number;
    testid?: number;
}

interface SelectedTest {
    testName: string;
    originalPrice: number;
    concessionValue: number;
    discountedValue: number;
    actualPrice: number;
    testid: number;
    pricingType: "surcharge" | "discount";
    concessionMode: "absolute" | "percentage";
    nhisTariff?: number; // For NHIS tariff amounts
}

interface ClinicianIndividualBillingConcessionProps {
    setSelectedTests: any;
    selectedTests: SelectedTest[];
    isNHIS?: boolean;
    onSave?: () => void;
}

const ClinicianIndividualBillingConcession: React.FC<ClinicianIndividualBillingConcessionProps> = ({
    setSelectedTests,
    selectedTests,
    isNHIS = false,
    onSave
}) => {
    const [allTests, setAllTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage">("absolute");
    const [concessionValueInput, setConcessionValueInput] = useState<string>("");
    const [currentTest, setCurrentTest] = useState<Test | null>(null);
    const [isTestSelected, setIsTestSelected] = useState(false);
    const [pricingType, setPricingType] = useState<"surcharge" | "discount">("discount");
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const [showModal, setShowModal] = useState(false);
    const [showConfiguredModal, setShowConfiguredModal] = useState(false);

    // Load all tests on component mount
    useEffect(() => {
        const fetchAllTests = async () => {
            try {
                const response = await customFetch('testpanel/list/bulk');
                if (response?.status === 'success' && response?.data) {
                    const tests = response.data.map((test: any) => ({
                        id: test.id,
                        name: test.name,
                        price: test.price || 0,
                        testid: test.id
                    }));
                    setAllTests(tests);
                }
            } catch (error) {
                console.error('Error loading tests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTests();
    }, []);




    // Handle test selection from dropdown
    const handleSelectedTest = (testId: string) => {
        const test = allTests.find(t => t.id.toString() === testId);
        if (test && test.price > 0) {
            setCurrentTest(test);
            setIsTestSelected(true);
            setShowModal(true);
            // Reset inputs
            setConcessionValueInput("");
            setInputValues(prev => ({ ...prev, [test.id]: '' }));
        }
    };

    // Handle direct price entry for a test
    const handleDirectPriceEntry = (testId: string, priceInput: string) => {
        const test = allTests.find(t => t.id.toString() === testId);
        if (test && priceInput !== "") {
            const actualPrice = parseFloat(priceInput);
            if (!isNaN(actualPrice) && actualPrice >= 0) {
                const pricingType: "surcharge" | "discount" = actualPrice > test.price ? "surcharge" : "discount";
                const concessionValue = Math.abs(test.price - actualPrice);

                const newTest: SelectedTest = {
                    testName: test.name,
                    originalPrice: test.price,
                    concessionValue: isNHIS ? actualPrice : concessionValue,
                    discountedValue: isNHIS ? (test.price - actualPrice) : (test.price - actualPrice),
                    actualPrice: actualPrice,
                    testid: test.id,
                    pricingType: isNHIS ? "discount" : pricingType,
                    concessionMode: "absolute",
                    nhisTariff: isNHIS ? actualPrice : undefined
                };

                setSelectedTests((prevSelectedTests: SelectedTest[]) => {
                    const testExists = prevSelectedTests.some(t => t.testid === newTest.testid);
                    if (!testExists) {
                        return [...prevSelectedTests, newTest];
                    }
                    return prevSelectedTests.map(t => t.testid === newTest.testid ? newTest : t);
                });
            }
        }
    };

    // Handle adding concession details to selected tests (legacy method)
    const handleConcessionDetails = () => {
        if (!currentTest || concessionValueInput === "" || isNaN(parseFloat(concessionValueInput))) {
            return;
        }

        if (currentTest.price === 0) {
            setIsTestSelected(false);
            setConcessionValueInput("");
            setCurrentTest(null);
            setPricingType("discount");
            return;
        }

        const concessionValue = parseFloat(concessionValueInput);
        if (concessionValue < 0) {
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
            testid: currentTest.id,
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
        setShowModal(false);
    };

    return (
        <div>
            <div className="mb-4">
                <p className="text-sm">
                    {isNHIS
                        ? "For NHIS strategies, enter the tariff amount received from the Health Insurance Authority for each test. This amount represents the actual payment received for each test."
                        : "This option allows you to apply custom pricing to specific tests. You can either use the concession method or directly enter the final price for each test."
                    }
                </p>
            </div>

            {/* View Configured Tests Button */}
            {selectedTests && selectedTests.length > 0 && (
                <div className="mb-3 text-center">
                    <button
                        className="btn btn-info"
                        onClick={() => setShowConfiguredModal(true)}
                    >
                        View Configured Tests ({selectedTests.length})
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading tests...</span>
                    </div>
                    <p className="mt-2">Loading available tests...</p>
                </div>
            ) : (
                <>
                    {/* Direct Price Entry Section */}
                    <div className="mb-4">
                        <h6 className="mb-3">Set Individual Test Prices</h6>
                        <div className="table-responsive">
                            <table className={`table table-striped ${styles.table}`}>
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Original Price</th>
                                        <th>{isNHIS ? 'NHIS Tariff Amount' : 'Final Price'}</th>
                                        {!isNHIS && <th>Concession Mode</th>}
                                        {!isNHIS && <th>Concession Value</th>}
                                        {!isNHIS && <th>Pricing Type</th>}
                                        {isNHIS && <th>Difference</th>}
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTests.map(test => {
                                        const selectedTest = selectedTests.find(t => t.testid === test.id);
                                        return (
                                            <tr key={test.id}>
                                                <td>{test.name}</td>
                                                <td>{test.price}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        placeholder={isNHIS ? "Enter NHIS tariff" : "Enter final price"}
                                                        min="0"
                                                        step="0.01"
                                                        value={test.price === 0 ? '0' : (inputValues[test.id] || (selectedTest ? (isNHIS ? selectedTest.nhisTariff || '' : selectedTest.actualPrice) : ''))}
                                                        disabled={test.price === 0}
                                                        onChange={(e) => setInputValues(prev => ({ ...prev, [test.id]: e.target.value }))}
                                                        onBlur={(e) => {
                                                            if (test.price === 0) {
                                                                handleDirectPriceEntry(test.id.toString(), '0');
                                                            } else {
                                                                const value = inputValues[test.id];
                                                                if (value && value !== '') {
                                                                    handleDirectPriceEntry(test.id.toString(), value);
                                                                    setInputValues(prev => ({ ...prev, [test.id]: '' }));
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                {!isNHIS && <td>{selectedTest ? selectedTest.concessionMode : '-'}</td>}
                                                {!isNHIS && <td>{selectedTest ? `${selectedTest.concessionValue}${selectedTest.concessionMode === 'percentage' ? '%' : ''}` : '-'}</td>}
                                                {!isNHIS && <td>{selectedTest ? selectedTest.pricingType : '-'}</td>}
                                                {isNHIS && <td className={selectedTest ? (test.price - (selectedTest.nhisTariff || selectedTest.actualPrice) > 0 ? 'text-danger' : 'text-success') : ''}>
                                                    {selectedTest ? `${test.price - (selectedTest.nhisTariff || selectedTest.actualPrice) > 0 ? '-' : ''}${(Math.abs(test.price - (selectedTest.nhisTariff || selectedTest.actualPrice))).toFixed(2)}` : '-'}
                                                </td>}
                                                <td>
                                                    {selectedTest ? (
                                                        <span className="badge bg-success">Configured</span>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleSelectedTest(test.id.toString())}
                                                        >
                                                            Configure
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Advanced Configuration Modal (for non-NHIS) */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Advanced Configuration for: {currentTest?.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Concession Mode</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={selectionMode}
                                        onChange={(e) => setSelectionMode(e.target.value as "absolute" | "percentage")}
                                    >
                                        <option value="absolute">Absolute Amount</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Pricing Method</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={pricingType}
                                        onChange={(e) => setPricingType(e.target.value as "surcharge" | "discount")}
                                    >
                                        <option value="discount">Discount</option>
                                        <option value="surcharge">Surcharge</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Concession Amount {selectionMode === "percentage" ? "(%)" : "(GHS)"}
                                </label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={concessionValueInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                            setConcessionValueInput("");
                                        } else if (selectionMode === "percentage" && parseFloat(value) > 100) {
                                            setConcessionValueInput("100");
                                        } else if (parseFloat(value) < 0) {
                                            setConcessionValueInput("0");
                                        } else {
                                            setConcessionValueInput(value);
                                        }
                                    }}
                                    placeholder={`Enter ${selectionMode === "percentage" ? "percentage" : "amount"}`}
                                    min="0"
                                    max={selectionMode === "percentage" ? "100" : undefined}
                                    step={selectionMode === "percentage" ? "0.1" : "0.01"}
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleConcessionDetails}>
                                Apply Configuration
                            </button>
                        </Modal.Footer>
                    </Modal>

                    {/* Configured Tests Modal */}
                    <Modal show={showConfiguredModal} onHide={() => setShowConfiguredModal(false)} size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Configured Tests ({selectedTests.length})</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="table-responsive">
                                <table className={`table table-striped ${styles.table}`}>
                                    <thead>
                                        <tr>
                                            <th>Test Name</th>
                                            <th>Original Price</th>
                                            {isNHIS ? (
                                                <>
                                                    <th>NHIS Tariff</th>
                                                    <th>Difference</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th>Concession Mode</th>
                                                    <th>Concession Value</th>
                                                    <th>Pricing Type</th>
                                                    <th>Final Price</th>
                                                </>
                                            )}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTests.map(test => (
                                            <tr key={test.testid}>
                                                <td>{test.testName}</td>
                                                <td>{test.originalPrice}</td>
                                                {isNHIS ? (
                                                    <>
                                                        <td>{test.nhisTariff || test.actualPrice}</td>
                                                        <td className={test.originalPrice - (test.nhisTariff || test.actualPrice) > 0 ? 'text-danger' : 'text-success'}>
                                                            {test.originalPrice - (test.nhisTariff || test.actualPrice) > 0 ? '-' : ''}
                                                            {Math.abs(test.originalPrice - (test.nhisTariff || test.actualPrice)).toFixed(2)}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{test.concessionMode}</td>
                                                        <td>{test.concessionValue}{test.concessionMode === 'percentage' ? '%' : ''}</td>
                                                        <td>{test.pricingType}</td>
                                                        <td>{test.actualPrice}</td>
                                                    </>
                                                )}
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => setSelectedTests(selectedTests.filter(t => t.testid !== test.testid))}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button className="btn btn-secondary" onClick={() => setShowConfiguredModal(false)}>
                                Close
                            </button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default ClinicianIndividualBillingConcession;