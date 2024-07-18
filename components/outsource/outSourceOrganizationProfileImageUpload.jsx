import React, { useCallback, useState } from 'react';
import { Image } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';

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

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop,
    });

    return (
        <div style={{ border: '2px dashed #007bff', padding: '100px', textAlign: 'center' }}  {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {
                imageUrl
                    ? <Image src={imageUrl} alt="Uploaded Image" fluid />
                    : <p>Drag and drop an image here, or click to select a file</p>
            }
        </div>
    );
};

export default OrganizationImageUploader;
