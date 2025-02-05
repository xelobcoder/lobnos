"use client";
import { Delete } from "@mui/icons-material";
import React, { useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import OrganizationFiltering from "../../../components/accessories/SectorFileringComponents/OrganizationFiltering";
import PackagesIndividualBillingConcession from "../../../components/Billing/packages/PackagesIndividualBillingConcession";

interface SelectedTest {
    testName: string;
    originalPrice: number;
    testid: number;
    concessionValue: number;
    discountedValue: number;
    actualPrice: number;
    concessionMode: "absolute" | "percentage";
    isoutsourced: boolean;
}

interface Organization {
    id: number;
    name: string;
    location: string;
    type: string;
}

export default function ClinicianBillingModeView({ clinicianid, strategy }: { clinicianid: number, strategy: string }) {
    const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
    const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [packageName, setPackageName] = useState<string>("");

    const handleOrganizationSelection = (organization: Organization) => {
        setSelectedOrganizations((prevSelected) => {
            if (prevSelected.some((org) => org.id === organization.id)) {
                return prevSelected;
            }
            return [...prevSelected, organization];
        });
    };

    const handleBillingStrategyFormSubmission = async () => {
        try {
            setSubmitting(true);

            if (!packageName) {
                toast.warn("Please enter a package name.");
                return;
            }

            const billingData = {
                packageName,
                applicableTest: selectedTests,
                applicableOrganization: selectedOrganizations,
                packagesid: clinicianid,
                category: strategy,
            };
            console.log(billingData);
            // Replace with your API call
            // Example API call:
            // const response = await customPost(`billing-strategies/billing/strategies`, 'POST', billingData);
            // if (response.status) {
            //     toast.success(response.message);
            // } else {
            //     toast.error(response.message);
            // }
        } catch (err) {
            console.log(err);
            toast.error("An error occurred while submitting the form.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveSelectedTests = () => {
        setSelectedTests((prevSelectedTests) =>
            prevSelectedTests.filter((test) => !selectedTestIds.includes(test.testid))
        );
        setSelectedTestIds([]);
    };

    const handleTestSelectionToggle = (testid: number) => {
        setSelectedTestIds((prevSelectedIds) =>
            prevSelectedIds.includes(testid)
                ? prevSelectedIds.filter((id) => id !== testid)
                : [...prevSelectedIds, testid]
        );
    };

    return (
        <div className="container">
            <ToastContainer position="top-center" className="text-sm" theme="colored" />
            <div>
                <div className="list-group pointer">
                    <div className="list-group-item">
                        <div className="form-row">
                            <label>Package Name</label>
                            <br />
                            <input
                                type="text"
                                className="custom-input col-6"
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                placeholder="Enter package name"
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
                        <span className="d-flex align-items-center">
                            <Form.Switch
                                id="applyIndividualConcession"
                                label="Apply concessions to individual tests"
                            />
                        </span>
                    </div>

                    <PackagesIndividualBillingConcession
                        setSelectedTests={setSelectedTests}
                    />

                    <div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
                        <span className="d-flex align-items-center">
                            <Form.Switch
                                id="applyToAllOrganizations"
                                label="Apply to selected organizations"
                            />
                        </span>
                    </div>

                    <div className="list-group-item">
                        <OrganizationFiltering showbulk={false} onSelect={handleOrganizationSelection} />
                    </div>

                    {selectedOrganizations.length > 0 && (
                        <div className="list-group-item">
                            <h6 className="bg-light p-2">Selected Organizations</h6>
                            <table className="table table-bordered ttable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrganizations.map((organization) => (
                                        <tr key={organization.id}>
                                            <td>{organization.name}</td>
                                            <td>{organization.location}</td>
                                            <td>{organization.type}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        setSelectedOrganizations((prevSelected) =>
                                                            prevSelected.filter((org) => org.id !== organization.id)
                                                        )
                                                    }
                                                >
                                                    <Delete fontSize="small" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {selectedTests.length > 0 && (
                        <div className="list-group-item my-1">
                            <div className="d-flex justify-content-between">
                                <span className="bg-light">Selected Tests</span>
                                <button className="btn btn-danger btn-sm mx-5" onClick={handleRemoveSelectedTests}>
                                    <Delete fontSize="small" />
                                </button>
                            </div>
                            <table className="table ttable mt-1">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    setSelectedTestIds(
                                                        e.target.checked
                                                            ? selectedTests.map((test) => test.testid)
                                                            : []
                                                    );
                                                }}
                                                checked={selectedTestIds.length === selectedTests.length}
                                            />
                                        </th>
                                        <th>Test Name</th>
                                        <th>Original Price</th>
                                        <th>Concession Mode</th>
                                        <th>Discounted Amount</th>
                                        <th>Actual Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTests.map((test) => (
                                        <tr key={test.testid}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTestIds.includes(test.testid)}
                                                    onChange={() => handleTestSelectionToggle(test.testid)}
                                                />
                                            </td>
                                            <td>{test.testName}</td>
                                            <td>{test.originalPrice.toFixed(2)}</td>
                                            <td>{test.concessionMode}</td>
                                            <td>{test.discountedValue}</td>
                                            <td>{test.actualPrice.toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => {
                                                        setSelectedTests(
                                                            selectedTests.filter((t) => t.testid !== test.testid)
                                                        );
                                                    }}
                                                >
                                                    <Delete fontSize="small" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="form-row mt-3">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleBillingStrategyFormSubmission}
                        disabled={submitting}
                    >
                        {submitting ? <Spinner size="sm" /> : 'Save Billing Information'}
                    </button>
                </div>
            </div>
        </div>
    );
}