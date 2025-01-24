"use client";
import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import CoveragePlanAdjustment from "./CoveragePlanAdjustment";
import ProviderFiltering from "../accessories/SectorFileringComponents/ProviderFiltering";
import { Delete } from "@mui/icons-material";
import { customPost } from "../Auth/customFetch";
import { PreviousInsurancePolicyRecord } from "./dev.type";
import { ToastContainer, toast } from "react-toastify";

interface SelectedCoverage {
    coverageName: string;
    originalPremium: number;
    coverageId: number;
    adjustmentAmount: number;
    discountedPremium: number;
    actualPremium: number;
    adjustmentMode: "absolute" | "percentage";
}

interface InsuranceProvider {
    id: number;
    name: string;
    location: string;
    street: string;
    contactNumber: number;
    address: string;
    email: string;
    region: string;
    website: string;
    type: string;
}

export default function InsurancePolicyAdjustmentView({ policyholderId, previousRecords }: { policyholderId: number, previousRecords: PreviousInsurancePolicyRecord | null }) {
    const [adjustmentMode, setAdjustmentMode] = useState<"absolute" | "percentage">("absolute");
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState<string>("0");
    const [selectedCoverages, setSelectedCoverages] = useState<SelectedCoverage[]>([]);
    const [isAllCoveragesAdjustmentVisible, setIsAllCoveragesAdjustmentVisible] = useState(true);
    const [applyToAllProviders, setApplyToAllProviders] = useState(true);
    const [selectedProviders, setSelectedProviders] = useState<InsuranceProvider[]>([]);
    const [selectedCoverageIds, setSelectedCoverageIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleProviderSelection = (provider) => {
        setSelectedProviders((prevSelected) => {
            if (prevSelected.some((prov) => prov.id === provider.id)) {
                return prevSelected;
            }
            return [...prevSelected, provider];
        });
    };

    const handlePolicyAdjustmentFormSubmission = async () => {
        try {
            setSubmitting(true);
            const policyData = {
                adjustmentMode: adjustmentMode,
                adjustmentAmount: parseFloat(adjustmentAmount),
                applicableCoverage: selectedCoverages,
                allAdjustmentApplied: isAllCoveragesAdjustmentVisible,
                applicableProvider: selectedProviders,
                policyholderId
            };

            const response = await customPost(`insurance/policies/adjustments`, 'POST', policyData);

            const { status, message, strategyId } = response;
            if (status === true || strategyId === -1 || strategyId > 0) {
                toast.success(message);
            } else {
                toast.error(message);
            }
            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
            console.log(err);
        }
    };

    const handleRemoveSelectedCoverages = () => {
        setSelectedCoverages((prevSelectedCoverages) =>
            prevSelectedCoverages.filter((coverage) => !selectedCoverageIds.includes(coverage.coverageId))
        );
        setSelectedCoverageIds([]);
    };

    const handleCoverageSelectionToggle = (coverageId: number) => {
        setSelectedCoverageIds((prevSelectedIds) =>
            prevSelectedIds.includes(coverageId)
                ? prevSelectedIds.filter((id) => id !== coverageId)
                : [...prevSelectedIds, coverageId]
        );
    };

    useEffect(() => {
        if (previousRecords) {
            const { adjustmentAmount, adjustmentMode, allAdjustmentApplied, applicableProvider, applicableCoverage, updatedon } = previousRecords;

            setIsAllCoveragesAdjustmentVisible(allAdjustmentApplied === 0 ? false : true);
            setAdjustmentAmount(adjustmentAmount || "0");
            setAdjustmentMode(adjustmentMode);

            if (Array.isArray(applicableProvider) && applicableProvider.length > 0) {
                setSelectedProviders(applicableProvider);
                setApplyToAllProviders(false);
            } else {
                setApplyToAllProviders(true);
            }

            if (Array.isArray(applicableCoverage) && applicableCoverage.length > 0) {
                setSelectedCoverages(applicableCoverage);
            }

            setLastUpdated(updatedon);
        }
    }, [previousRecords]);

    return (
        <div className="container">
            <ToastContainer position="top-center" className="text-sm" theme="colored" />
            <div className="d-flex justify-content-between">
                <h6 className="p-2 bg-secondary-subtle br-5">
                    Insurance Policy Adjustment
                </h6>
                {lastUpdated && <div className="text-decoration-underline p-0 br-5 d-flex justify-content-center align-center text-capitalize">
                    Last updated on: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString()}
                </div>}
            </div>
            <hr />
            <div>
                <div className="list-group pointer">
                    <div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
                        <span className="d-flex align-items-center">
                            <Form.Switch
                                id="applyAdjustment"
                                label="Apply an adjustment on all coverages"
                                onChange={(e) => setIsAllCoveragesAdjustmentVisible(true)}
                            />
                        </span>
                    </div>

                    {isAllCoveragesAdjustmentVisible && (
                        <div className="d-flex list-group-item">
                            <div>
                                <p className="text-sm">
                                    This will apply an adjustment, either a percentage or an absolute amount, to all the coverages available in the policy. For example, applying a 5% adjustment will change the premium of each coverage by 5%. This ensures uniform premium adjustments across all coverages.
                                </p>

                                <div className="form-row mt-3">
                                    <label htmlFor="adjustmentMode">Adjustment Mode</label>
                                    <br />
                                    <select
                                        id="adjustmentMode"
                                        className="custom-select col-3"
                                        value={adjustmentMode}
                                        onChange={(e) => setAdjustmentMode(e.target.value as "absolute" | "percentage")}
                                    >
                                        <option value="absolute">Absolute</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>

                                <div className="form-row mt-3">
                                    <label htmlFor="adjustmentAmount">Adjustment Amount</label>
                                    <br />
                                    <input
                                        id="adjustmentAmount"
                                        type="number"
                                        className="custom-input col-3"
                                        value={adjustmentAmount}
                                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        maxLength={6}
                                        minLength={1}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
                        <span className="d-flex align-items-center">
                            <Form.Switch
                                id="applyIndividualAdjustment"
                                label="Apply adjustments to individual coverages"
                                onChange={(e) => setIsAllCoveragesAdjustmentVisible(false)}
                            />
                        </span>
                    </div>

                    {!isAllCoveragesAdjustmentVisible && (
                        <CoveragePlanAdjustment setSelectedCoverages={setSelectedCoverages} />
                    )}

                    <div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
                        <span className="d-flex align-items-center">
                            <Form.Switch
                                id="applyToAllProviders"
                                label="Apply to all providers"
                                checked={applyToAllProviders}
                                onChange={(e) => setApplyToAllProviders(e.target.checked)}
                            />
                        </span>
                    </div>

                    {!applyToAllProviders && (
                        <div className="list-group-item">
                            <ProviderFiltering onSelect={handleProviderSelection} />
                        </div>
                    )}

                    {selectedProviders.length > 0 && (
                        <div className="list-group-item">
                            <h6 className="bg-light p-2">Selected Providers</h6>
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
                                    {Array.isArray(selectedProviders) &&
                                        selectedProviders.length > 0 &&
                                        selectedProviders.map((provider) => (
                                            <tr key={provider.id}>
                                                <td>{provider.name}</td>
                                                <td>{provider.location}</td>
                                                <td>{provider.type}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            setSelectedProviders((prevSelected) =>
                                                                prevSelected.filter((prov) => prov.id !== provider.id)
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

                    {selectedCoverages.length > 0 && (
                        <div className="list-group-item my-1">
                            <div className="d-flex justify-content-between">
                                <span className="bg-light">Selected Coverages</span>
                                <button className="btn btn-danger btn-sm mx-5" onClick={handleRemoveSelectedCoverages}>
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
                                                    setSelectedCoverageIds(
                                                        e.target.checked
                                                            ? selectedCoverages.map((coverage) => coverage.coverageId)
                                                            : []
                                                    );
                                                }}
                                                checked={selectedCoverageIds.length === selectedCoverages.length}
                                            />
                                        </th>
                                        <th>Coverage Name</th>
                                        <th>Original Premium</th>
                                        <th>Adjustment Mode</th>
                                        <th>Adjustment Amount</th>
                                        <th>Discounted Premium</th>
                                        <th>Actual Premium</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCoverages.map((coverage) => (
                                        <tr key={coverage.coverageId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCoverageIds.includes(coverage.coverageId)}
                                                    onChange={() => handleCoverageSelectionToggle(coverage.coverageId)}
                                                />
                                            </td>
                                            <td>{coverage.coverageName}</td>
                                            <td>{coverage.originalPremium.toFixed(2)}</td>
                                            <td>{coverage.adjustmentMode}</td>
                                            <td>{coverage.adjustmentAmount.toFixed(2)}</td>
                                            <td>{coverage.discountedPremium.toFixed(2)}</td>
                                            <td>{coverage.actualPremium.toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => {
                                                        setSelectedCoverages(
                                                            selectedCoverages.filter((c) => c.coverageId !== coverage.coverageId)
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
                        onClick={handlePolicyAdjustmentFormSubmission}
                    >
                        {submitting && <Spinner size="sm" />} {submitting ? 'Submitting' : 'Save Adjustment Information'}
                    </button>
                </div>
            </div>
        </div>
    );
}
