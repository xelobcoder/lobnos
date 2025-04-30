import React, { useCallback, useState } from 'react';
import { Image, Card, Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { RiUpload2Line, RiImageAddLine, RiCloseLine } from '@remixicon/react';

const OrganizationImageUploader = () => {
    const [imageUrl, setImageUrl] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = () => {
            setImageUrl(reader.result);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        onDrop,
        maxFiles: 1,
    });

    const removeImage = (e) => {
        e.stopPropagation();
        setImageUrl(null);
    };

    return (
        <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="p-0">
                <div 
                    {...getRootProps()} 
                    className={`dropzone d-flex flex-column align-items-center justify-content-center p-4 ${isDragActive ? 'bg-light' : ''}`}
                    style={{ 
                        border: isDragActive ? '2px dashed #0d6efd' : '2px dashed #dee2e6',
                        borderRadius: '8px',
                        minHeight: '200px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <input {...getInputProps()} />
                    
                    {!imageUrl ? (
                        <>
                            <div className="text-center mb-3">
                                <RiImageAddLine size={48} className="text-primary mb-2" />
                                <h5 className="mb-1">Upload Organization Logo</h5>
                                <p className="text-muted small mb-3">
                                    {isDragActive 
                                        ? "Drop the image here..." 
                                        : "Drag and drop an image here, or click to browse"}
                                </p>
                                <Button variant="outline-primary" size="sm" className="d-flex align-items-center mx-auto">
                                    <RiUpload2Line className="me-1" /> Select Image
                                </Button>
                            </div>
                            <div className="text-muted small">
                                <p className="mb-0">Supported formats: JPG, PNG, GIF</p>
                            </div>
                        </>
                    ) : (
                        <div className="position-relative w-100 text-center">
                            <Button 
                                variant="danger" 
                                size="sm" 
                                className="position-absolute top-0 end-0 rounded-circle p-1 d-flex align-items-center justify-content-center" 
                                style={{ width: '30px', height: '30px', zIndex: 10 }}
                                onClick={removeImage}
                            >
                                <RiCloseLine />
                            </Button>
                            <Image 
                                src={imageUrl} 
                                alt="Organization Logo" 
                                fluid 
                                className="mt-2" 
                                style={{ 
                                    maxHeight: '200px', 
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                }} 
                            />
                            <p className="text-muted small mt-2">Click or drag to change image</p>
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default OrganizationImageUploader;
