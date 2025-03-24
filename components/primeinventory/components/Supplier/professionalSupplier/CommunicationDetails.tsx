'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

interface CommunicationDetail {
    communicationID: number;
    supplierID: number;
    accountManager: string;
    supportContact: string;
    preferredCommunication: string;
    supplierPortalLogin: string;
}

const CommunicationDetails: React.FC = () => {
    const [formData, setFormData] = useState<Omit<CommunicationDetail, 'communicationID'>>({
        supplierID: 0,
        accountManager: '',
        supportContact: '',
        preferredCommunication: '',
        supplierPortalLogin: '',
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/communication-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({
                    supplierID: 0,
                    accountManager: '',
                    supportContact: '',
                    preferredCommunication: '',
                    supplierPortalLogin: '',
                });
            } else {
                console.error('Failed to add communication detail.');
            }
        } catch (error) {
            console.error('Error adding communication detail:', error);
        }
    };

    return (
        <div>
            <h2>Communication Details</h2>
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
                    name="accountManager"
                    value={formData.accountManager}
                    onChange={handleInputChange}
                    placeholder="Account Manager"
                />
                <input
                    name="supportContact"
                    value={formData.supportContact}
                    onChange={handleInputChange}
                    placeholder="Support Contact"
                />
                <input
                    name="preferredCommunication"
                    value={formData.preferredCommunication}
                    onChange={handleInputChange}
                    placeholder="Preferred Communication"
                />
                <input
                    name="supplierPortalLogin"
                    value={formData.supplierPortalLogin}
                    onChange={handleInputChange}
                    placeholder="Supplier Portal Login"
                />
                <button type="submit">Add Communication Detail</button>
            </form>
        </div>
    );
};

export default CommunicationDetails;
