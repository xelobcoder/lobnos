import React, { useState, useEffect } from "react";
import TestFiltering, { TestDetails } from "../../accessories/SectorFileringComponents/TestFiltering";
import { customPost, customFetch, currencyFormatter } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";

interface SelectedTest {
    testName: string;
    originalPrice: number;
    concessionValue: number | null;
    discountedValue: number | null;
    actualPrice: number | null;
    testid: number;
    concessionMode: "absolute" | "percentage" | "none";
}

interface PackageTest {
    id: number;
    package_id: number;
    test_id: number;
    concession_mode: "absolute" | "percentage" | "none";
    concession_value: number | null;
    name: string;

    price: number
}

interface ApplicableTestComponentProps {
    packageid: number;
}

const ApplicableTestComponent: React.FC<ApplicableTestComponentProps> = ({ packageid }) => {
    const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage" | "none">("none");
    const [concessionValueInput, setConcessionValueInput] = useState<string>("");
    const [currentTest, setCurrentTest] = useState<TestDetails | null>(null);
    const [isTestSelected, setIsTestSelected] = useState(false);
    const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (packageid) {
            fetchPackageTests();
        }
    }, [packageid]);

    const fetchPackageTests = async () => {
        setLoading(true);
        try {
            const response = await customFetch(`package-tests/${packageid}`);
            if (response && Array.isArray(response)) {
                const formattedTests = response.map((test: PackageTest) => {
                    const concessionValue = test.concession_value || 0;
                    let discountedValue = 0;
                    let actualPrice = test.price;

                    if (test.concession_mode !== "none" && concessionValue > 0) {
                        discountedValue = test.price - concessionValue;
                        actualPrice = test.price;
                    }

                    return {
                        testName: test.name,
                        originalPrice: test.price,
                        concessionValue,
                        discountedValue,
                        actualPrice,
                        testid: test.test_id,
                        concessionMode: test.concession_mode,
                    };
                });
                setSelectedTests(formattedTests);
            } else {
                toast.error("Failed to load package tests.");
            }
        } catch (error) {
            console.error("Error fetching package tests:", error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };



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

        const newTest: SelectedTest = {
            testName: currentTest.name,
            originalPrice: currentTest.price,
            concessionValue,
            discountedValue,
            actualPrice,
            testid: currentTest.id,
            concessionMode: selectionMode,
        };

        setSelectedTests((prevTests) => [...prevTests, newTest]);

        setIsTestSelected(false);
        setConcessionValueInput("");
        setCurrentTest(null);
    };

    const handleSubmissionFormData = async () => {
        try {
            if (selectedTests.length === 0 || !packageid) {
                toast.warn("Please select at least one test.");
                return;
            }

            setSubmitting(true);

            const formattedTests = selectedTests.map((item) => ({
                test_id: item.testid,
                concession_mode: item.concessionMode,
                concession_value: item.concessionValue,
                package_id: packageid,
            }));

            const response = await customPost(`package-tests`, "POST", formattedTests);

            if (response && response.status === "success") {
                toast.success(response.message);
                setSelectedTests([]);
            } else {
                toast.error(response?.message || "Failed to add tests to package.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while submitting the data.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="list-group-item">
            <ToastContainer position="top-center" className="text-sm" theme="colored" />

            <div>
                <p className="text-sm">
                    This option allows you to apply custom concession amounts to specific tests or retain the original price.
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
                                    setConcessionValueInput("");
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

            {selectedTests.length > 0 && (
                <div className="mt-4">
                    <h4>Selected Tests</h4>
                    <table className="table pls-color" style={{ width: "100%", overflowX: "auto" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Test Name</th>
                                <th>Original Price (Cedis)</th>
                                <th>Concession Value</th>
                                <th>Concession Mode</th>
                                <th>Discounted Price (Cedis)</th>
                                <th>Actual Price (Cedis)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTests.map((test, index) => (
                                <tr key={test.testid}>
                                    <td>{index + 1}</td>
                                    <td>{test.testName}</td>
                                    <td>{test.originalPrice.toFixed(2)}</td>
                                    <td>{currencyFormatter.format(test.concessionValue || 0) || null}</td>
                                    <td className="text-capitalize">{test.concessionMode}</td>
                                    <td>{currencyFormatter.format(test.discountedValue || 0)}</td>
                                    <td>{test.actualPrice?.toFixed(2) ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div>
                <button
                    onClick={handleSubmissionFormData}
                    className="btn btn-primary btn-sm my-2"
                    disabled={submitting || selectedTests.length === 0}
                >
                    {submitting ? "Submitting..." : "Add Test To Package"}
                </button>
            </div>
        </div>
    );
};

export default ApplicableTestComponent;