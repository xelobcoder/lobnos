"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { customPost } from "../../Auth/customFetch";


interface EditPackageModalProps {
    show: boolean;
    handleClose: () => void;
    packageData: {
        id: number;
        package_name: string;
    } | null;
}

const EditPackageModal: React.FC<EditPackageModalProps> = ({
    show,
    handleClose,
    packageData,
}) => {
    const [packageName, setPackageName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (packageData) {
            setPackageName(packageData.package_name);
        } else {
            setPackageName("");
        }
    }, [packageData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!packageData) return;

        setIsSubmitting(true);

        try {
            const requestResponse: { status: boolean } = await customPost(`packages/${packageData.id}`, 'PUT', { package_name: packageName });
            if (requestResponse.status) {
                toast.success("Package updated successfully!");
                handleClose();
            } else {
                toast.error("Failed to update package. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to update package. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Edit Package</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="editPackageName">
                        <Form.Label>Package Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditPackageModal;
