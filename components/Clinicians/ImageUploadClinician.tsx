import React, { useState, useRef, useEffect, useCallback } from "react";
import { Form, Button, Alert, Image, Stack } from "react-bootstrap";
import {
    RiUploadCloud2Line,
    RiDeleteBinLine,
    RiRefreshLine,
    RiCheckLine,
    RiErrorWarningLine,
} from "@remixicon/react";

interface ImageUploadProps {
    onSubmit?: (file: File) => void;
    onClear?: () => void;
    initialImageUrl?: string | null;
    label?: string;
    toast?: { success: (message: string) => void; error: (message: string) => void };
    idSuffix?: string;
}

export default function ImageUploadClinician({
    onSubmit,
    onClear,
    initialImageUrl = null,
    label = "Clinician Profile Image",
    toast,
    idSuffix = ""
}: ImageUploadProps) {
    const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isBlobPreview, setIsBlobPreview] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const revokePreviousBlobUrl = useCallback(() => {
        if (isBlobPreview && selectedImagePreview) {
            URL.revokeObjectURL(selectedImagePreview);
            setIsBlobPreview(false);
        }
    }, [isBlobPreview, selectedImagePreview]);

    useEffect(() => {
        if (initialImageUrl) {
            revokePreviousBlobUrl();
            setSelectedImagePreview(initialImageUrl);
            setFile(null);
            setIsBlobPreview(false);
        } else {
            if (!file) {
                revokePreviousBlobUrl();
                setSelectedImagePreview(null);
            }
        }
    }, [initialImageUrl, revokePreviousBlobUrl, file]);


    const validateFile = (uploadedFile: File): boolean => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        setError(null);

        if (!allowedTypes.includes(uploadedFile.type.toLowerCase())) {
            const errorMsg = `Invalid file type. Please upload JPG, PNG, GIF, or WEBP.`;
            setError(errorMsg);
            if (toast) toast.error(errorMsg);
            return false;
        }

        if (uploadedFile.size > maxSizeInBytes) {
            const errorMsg = `File is too large. Maximum size is ${maxSizeInMB}MB.`;
            setError(errorMsg);
            if (toast) toast.error(errorMsg);
            return false;
        }
        return true;
    };

    const processFile = (uploadedFile: File) => {
        if (validateFile(uploadedFile)) {
            revokePreviousBlobUrl();
            const imageURL = URL.createObjectURL(uploadedFile);
            setSelectedImagePreview(imageURL);
            setFile(uploadedFile);
            setIsBlobPreview(true);
            setError(null);
        } else {
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            processFile(uploadedFile);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
        event.dataTransfer.clearData();
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragging) setDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
    };

    const handleRemoveImage = () => {
        revokePreviousBlobUrl();
        setSelectedImagePreview(initialImageUrl || null);
        setIsBlobPreview(!!initialImageUrl && !initialImageUrl.startsWith("blob:"));
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onClear) onClear();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (file && onSubmit) {
            onSubmit(file);
        } else if (!file && onSubmit) {
            const errorMsg = "Please select a new image to upload.";
            setError(errorMsg);
            if (toast) toast.error(errorMsg);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Form onSubmit={handleSubmit} className="image-upload-form">
            <div className="mb-2" style={{ fontWeight: 500, fontSize: '0.95rem', color: '#333' }}>{label}</div>
            {!selectedImagePreview && (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload image dropzone"
                    style={{
                        border: '2px dashed #ced4da',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                        minHeight: '120px',
                        maxWidth: '180px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={triggerFileInput}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") triggerFileInput(); }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="mb-2"
                >
                    <RiUploadCloud2Line size={32} className="mb-1 text-muted" />
                    <p className="mb-1" style={{ fontSize: '0.9rem' }}>Drag & drop or click</p>
                    <small className="text-muted">JPG, PNG, GIF, WEBP (Max 5MB)</small>
                </div>
            )}
            {selectedImagePreview && (
                <div style={{
                    width: '100%',
                    maxWidth: '120px',
                    margin: '0 auto 0.5rem auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}>
                    <Image src={selectedImagePreview} alt="Selected preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid #dee2e6', backgroundColor: '#fff' }} />
                    <Stack direction="horizontal" gap={1} style={{ marginTop: '0.5rem' }} className="justify-content-center">
                        <Button variant="outline-primary" size="sm" onClick={triggerFileInput} aria-label="Change image">
                            <RiRefreshLine size={14} className="me-1" /> Change
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={handleRemoveImage} aria-label="Remove image">
                            <RiDeleteBinLine size={14} className="me-1" /> Remove
                        </Button>
                    </Stack>
                </div>
            )}
            <input
                type="file"
                id={`fileInput-${idSuffix}`}
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
                aria-hidden="true"
            />
            {error && (
                <Alert variant="danger" className="d-flex align-items-center mt-2 py-1 fade show" role="alert" style={{ fontSize: '0.9rem' }}>
                    <RiErrorWarningLine size={16} className="me-2 flex-shrink-0" />
                    <span className="flex-grow-1">{error}</span>
                    <Button variant="close" size="sm" onClick={() => setError(null)} aria-label="Close error message"></Button>
                </Alert>
            )}
            {onSubmit && (
                <div className="d-grid mt-3">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!file}
                        className="d-flex align-items-center justify-content-center"
                        style={{ fontSize: '0.95rem', padding: '0.35rem 0.75rem' }}
                    >
                        <RiCheckLine size={16} className="me-1" />
                        {file ? "Upload Image" : "Select Image"}
                    </Button>
                </div>
            )}
        </Form>
    );
}