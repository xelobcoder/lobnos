'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

interface ComplianceCertification {
    complianceID: number;
    supplierID: number;
    documentType: string;
    documentNumber: string;
    certificationName: string;
    expiryDate: string;
}

const ComplianceCertifications: React.FC = () => {
    const [formData, setFormData] = useState<Omit<ComplianceCertification, 'complianceID'>>({
        supplierID: 0,
        documentType: '',
        documentNumber: '',
        certificationName: '',
        expiryDate: '',
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'expiryDate' ? value : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/compliance-certifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({
                    supplierID: 0,
                    documentType: '',
                    documentNumber: '',
                    certificationName: '',
                    expiryDate: '',
                });
            } else {
                console.error('Failed to add compliance certification.');
            }
        } catch (error) {
            console.error('Error adding compliance certification:', error);
        }
    };

    return (
        <div>
            <h2>Compliance Certifications</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="supplierID"
                    value={formData.supplierID}
                    onChange={handleInputChange}
                    placeholder="Supplier ID"
                    required
                    type="number"
                />
                <input
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    placeholder="Document Type"
                />
                <input
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    placeholder="Document Number"
                />
                <input
                    name="certificationName"
                    value={formData.certificationName}
                    onChange={handleInputChange}
                    placeholder="Certification Name"
                />
                <input
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="Expiry Date (YYYY-MM-DD)"
                    type="date"
                />
                <button type="submit">Add Compliance Certification</button>
            </form>
        </div>
    );
};

export default ComplianceCertifications;
