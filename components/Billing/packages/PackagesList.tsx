"use client";

import { useState, useEffect } from "react";
import { customFetch } from "../../Auth/customFetch";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import moment from "moment";
import Dropdown from "react-bootstrap/Dropdown";
import { Modal, Button } from "react-bootstrap";
import ApplicableTestComponent from "./ApplicableTest";
import ApplicableOrganization from './ApplicableOrganization';

interface Package {
    id: number;
    package_name: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    username: string;
}

const PackagesTable: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTestModal, setShowTestModal] = useState<boolean>(false);
    const [showOrgModal, setShowOrgModal] = useState<boolean>(false); // Separate state for the organization modal
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

    // Fetch packages from the API
    const fetchPackages = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await customFetch(`packages?page=1&count=10`);
            if (Array.isArray(response)) {
                const formattedPackages = response.map((pkg) => ({
                    ...pkg,
                    created_at: moment(pkg.created_at).format("LLLL"),
                    updated_at: moment(pkg.updated_at).format("LLLL"),
                    created_by: pkg.username,
                }));
                setPackages(formattedPackages);
            }
        } catch (error) {
            setError("Failed to load packages. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // Open the test modal
    const handleShowTestModal = (packageId: number) => {
        setSelectedPackageId(packageId);
        setShowTestModal(true);
    };

    // Open the organization modal
    const handleOpenOrgModal = (packageId: number) => {
        setSelectedPackageId(packageId);
        setShowOrgModal(true);
    };

    // Close the test modal
    const handleCloseTestModal = () => {
        setShowTestModal(false);
    };

    // Close the organization modal
    const handleCloseOrgModal = () => {
        setShowOrgModal(false);
    };

    // Handle adding a test (placeholder logic)
    const handleAddTest = () => {
        if (selectedPackageId) {
            console.log("Adding test to package", selectedPackageId);
            setShowTestModal(false);
        }
    };

    // Table columns configuration
    const columns = [
        { Header: "ID", accessor: "id" },
        { Header: "Package Name", accessor: "package_name" },
        { Header: "Created At", accessor: "created_at" },
        { Header: "Updated At", accessor: "updated_at" },
        { Header: "Username", accessor: "username" },
        {
            Header: "Actions",
            Cell: ({ row }: any) => (
                <Dropdown className="pls-color">
                    <Dropdown.Toggle variant="light" id="dropdown-actions" size="sm">
                        Actions
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ fontSize: '14px' }}>
                        <Dropdown.Item onClick={() => console.log("Edit Package Name", row.original.id)}>
                            Edit Package Name
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => console.log("Delete Package", row.original.id)}>
                            Delete Package
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleShowTestModal(row.original.id)}>
                            Add Package Test
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleOpenOrgModal(row.original.id)}>
                            Add Applicable Organization
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ];

    return (
        <div>
            {loading && <div className="text-center py-4">Loading packages...</div>}
            {error && <div className="alert alert-danger text-center py-2">{error}</div>}

            <div className="d-flex justify-content-end">
                <button className="btn btn-link text-sm" onClick={fetchPackages} disabled={loading}>
                    Reload
                </button>
            </div>

 
            <PrimeTable
                column={columns}
                data={packages}
                serverSideFiltering={false}
                filtering={false}
                handleSeverSideProcessing={null}
            />

            <Modal show={showTestModal} size="xl" onHide={handleCloseTestModal} backdrop="static">
                <Modal.Header className="bg-secondary-subtle" closeButton>
                    <h5>Add Test to Package</h5>
                </Modal.Header>
                <Modal.Body>
                    <ApplicableTestComponent packageid={selectedPackageId || 0} />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-sm" variant="secondary" onClick={handleCloseTestModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showOrgModal} size="xl" onHide={handleCloseOrgModal} backdrop="static">
                <Modal.Header className="bg-secondary-subtle" closeButton>
                    <h5>Add Applicable Organizations</h5>
                </Modal.Header>
                <Modal.Body>
                <ApplicableOrganization  packageid={selectedPackageId || 0} />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-sm" variant="secondary" onClick={handleCloseOrgModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PackagesTable;