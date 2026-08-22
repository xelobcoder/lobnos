"use client";

import { useState, useEffect } from "react";
import { customFetch, customPost } from "../../Auth/customFetch";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import moment from "moment";
import { Modal, Button } from "react-bootstrap";
import ApplicableTestComponent from "./ApplicableTest";
import ApplicableOrganization from './ApplicableOrganization';
import ApplicableClinicians from "./ApplicableClinicians";
import EditPackageModal from './EditPackageModal';
import { toast } from "react-toastify";
import Loader from "../../accessories/Loader";

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
    const [showOrgModal, setShowOrgModal] = useState<boolean>(false);
    const [showClinicianModal, setShowClinicianModal] = useState<boolean>(false);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
    const [packageToDeleteId, setPackageToDeleteId] = useState<number | null>(null);

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

    const handlePackageEditing = (packageItem: Package) => {
        setEditingPackage(packageItem);
        setShowEditModal(true);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleShowTestModal = (packageId: number) => {
        setSelectedPackageId(packageId);
        setShowTestModal(true);
    };

    const handleOpenOrgModal = (packageId: number) => {
        setSelectedPackageId(packageId);
        setShowOrgModal(true);
    };

    const handleShowClinicianModal = (packageId: number) => {
        setSelectedPackageId(packageId);
        setShowClinicianModal(true);
    };

    const handleCloseTestModal = () => {
        setShowTestModal(false);
    };

    const handleCloseOrgModal = () => {
        setShowOrgModal(false);
    };

    const handleCloseClinicianModal = () => {
        setShowClinicianModal(false);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingPackage(null);
        fetchPackages(); // Refresh the list after closing the modal
    };

    const handleShowDeleteConfirmModal = (packageId: number) => {
        setPackageToDeleteId(packageId);
        setShowDeleteConfirmModal(true);
    };

    const handleCloseDeleteConfirmModal = () => {
        setPackageToDeleteId(null);
        setShowDeleteConfirmModal(false);
    };

    const handleDeletePackage = async () => {
        if (packageToDeleteId === null) return;

        try {
            const endpoint = `packages/${packageToDeleteId}`;
            const response: { status: boolean, message: string } = await customPost(endpoint, 'DELETE', {});
            const { status, message } = response;
            if (status) {
                toast.success("Package deleted successfully!");
                setPackages((prev) => prev.filter((pkg) => pkg.id !== packageToDeleteId));
                handleCloseDeleteConfirmModal();
            } else {
                toast.error(message || "Failed to delete package. Please try again.");
                console.error("Delete response:", response);
            }
        } catch (error) {
            console.error("Failed to delete package:", error);
            toast.error("Failed to delete package. Please try again.");
        }
    };


    const handleServerSideProcessing = async (pagination) => {
        const { page, count } = pagination;
        try {
            const response = await customFetch(`packages?page=${page}&count=${count}`);
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
            console.error("Failed to fetch packages:", error);
            toast.error("Failed to load packages. Please try again later.");
        }
    }

    const columns = [
        { Header: "Package Name", accessor: "package_name", Cell: ({ value }: { value: string }) => <span className="fw-medium">{value}</span> },
        {
            Header: "Created", accessor: "created_at",
            Cell: ({ value }: { value: string }) => <span className="text-muted">{value}</span>
        },
        {
            Header: "Updated", accessor: "updated_at",
            Cell: ({ value }: { value: string }) => <span className="text-muted">{value}</span>
        },
        { Header: "Created By", accessor: "created_by", Cell: ({ value }: { value: string }) => <span className="text-muted">{value}</span> },
        {
            Header: "Actions",
            Cell: ({ row }: any) => (
                <div className="d-flex flex-wrap gap-1">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handlePackageEditing(row.original)}
                    >
                        Edit Name
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleShowDeleteConfirmModal(row.original.id)}
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleShowTestModal(row.original.id)}
                    >
                        Add Test
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleShowClinicianModal(row.original.id)}
                    >
                        Add Clinician
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleOpenOrgModal(row.original.id)}
                    >
                        Add Organization
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>

            {loading && (
                <div className="text-center my-5 d-flex justify-content-center">
                    <Loader />
                </div>
            )}
            {error && <div className="alert alert-danger text-center py-2">{error}</div>}

            <div className="d-flex justify-content-end">
                <button className="btn btn-link text-sm" onClick={fetchPackages} disabled={loading}>
                    Reload
                </button>
            </div>

            {/* Render the table only when not loading and no error */}
            {!loading && !error && (
                <PrimeTable
                    column={columns}
                    data={packages}
                    serverSideFiltering={true}
                    filtering={false}
                    handleSeverSideProcessing={handleServerSideProcessing}
                />
            )}

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
                    <ApplicableOrganization packageid={selectedPackageId || 0} />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-sm" variant="secondary" onClick={handleCloseOrgModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showClinicianModal} size="xl" onHide={handleCloseClinicianModal} backdrop="static">
                <Modal.Header className="bg-secondary-subtle" closeButton>
                    <h5>Add Applicable Clinicians</h5>
                </Modal.Header>
                <Modal.Body>
                    <ApplicableClinicians packageid={selectedPackageId || 0} />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn btn-sm" variant="secondary" onClick={handleCloseClinicianModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {editingPackage && (
                <EditPackageModal
                    show={showEditModal}
                    handleClose={handleCloseEditModal}
                    packageData={editingPackage}
                />
            )}

            {/* Add Delete Confirmation Modal */}
            <Modal show={showDeleteConfirmModal} onHide={handleCloseDeleteConfirmModal} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this package?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteConfirmModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeletePackage}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PackagesTable;