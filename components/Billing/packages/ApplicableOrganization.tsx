"use client";
import React, { useState, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import OrganizationFiltering from "../../accessories/SectorFileringComponents/OrganizationFiltering";
import { customPost, customFetch } from "../../Auth/customFetch";

interface Organization {
    id: number;
    name: string;
    location: string;
    street: string;
    mobile: number;
    address: string;
    email: string;
    region: string;
    gpsmapping: string | null;
    website: string;
    type: string;
}

export default function ApplicableOrganization({ packageid }: { packageid: number }) {
    const [applyToAllOrganizations, setApplyToAllOrganizations] = useState(true);
    const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (packageid) {
            fetchOrganizationPackages();
        }
    }, [packageid]);

    const fetchOrganizationPackages = async () => {
        setLoading(true);
        try {
            const response = await customFetch(`organization-packages/${packageid}`);
            if (response && Array.isArray(response)) {
                setSelectedOrganizations(response);
            } else {
                toast.error("Failed to load organization packages.");
            }
        } catch (error) {
            console.error("Error fetching organization packages:", error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizationSelection = (organization: Organization) => {
        setSelectedOrganizations((prevSelected) => {
            if (prevSelected.some((org) => org.id === organization.id)) {
                return prevSelected;
            }
            return [...prevSelected, organization];
        });
    };

    const handleBillingStrategyFormSubmission = async () => {
        if (selectedOrganizations.length === 0) {
            toast.warn("Please select at least one organization.");
            return;
        }

        setSubmitting(true);

        const payload = selectedOrganizations.map((org) => ({
            organization_id: org.id,
            package_id: packageid,
        }));

        try {
            const response = await customPost("organization-packages", "POST", payload);

            if (response) {
                console.log(response);
                toast.success("Organizations linked to package successfully!");
            } else {
                toast.error("Failed to link organizations to package.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while submitting the data.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAllOrganizations = async () => {
        if (!packageid) {
            toast.warn("No package ID provided.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await customPost(`organization-packages/${packageid}`, "DELETE", {});

            if (response) {
                console.log(response);
                toast.success("All organizations unlinked from package successfully!");
                setSelectedOrganizations([]);
            } else {
                toast.error("Failed to unlink organizations from package.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while deleting the data.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <ToastContainer position="top-center" className="text-sm" theme="colored" />

            <div className="d-flex list-group-item fw-bold bg-secondary-subtle p-3 my-2 br-5 align-items-center">
                <span className="d-flex align-items-center">
                    <Form.Switch
                        id="applyToAllOrganizations"
                        label="Apply to all organizations"
                        checked={applyToAllOrganizations}
                        onChange={(e) => setApplyToAllOrganizations(e.target.checked)}
                    />
                </span>
            </div>

            {!applyToAllOrganizations && (
                <div className="list-group-item">
                    <OrganizationFiltering showbulk={false} onSelect={handleOrganizationSelection} />
                </div>
            )}

            {selectedOrganizations.length > 0 && (
                <div className="list-group-item">
                    <h6 className="bg-light p-2">Selected Organizations</h6>
                    <table className="table pls-color text-sm">
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
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                            >
                                                <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2v12zm4-16h6v2H9V4zM8 8h9v12H7V8h1z" />
                                                <path d="M9 10h2v8H9zm4 0h2v8h-2z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="form-row mt-3">
                <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={handleBillingStrategyFormSubmission}
                    disabled={submitting || loading}
                >
                    {submitting && <Spinner size="sm" animation="border" role="status" />}
                    {submitting ? "Submitting..." : "Save Billing Information"}
                </button>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteAllOrganizations}
                    disabled={submitting || loading || selectedOrganizations.length === 0}
                >
                    {submitting && <Spinner size="sm" animation="border" role="status" />}
                    {submitting ? "Deleting..." : "Delete All Organizations"}
                </button>
            </div>
        </div>
    );
}