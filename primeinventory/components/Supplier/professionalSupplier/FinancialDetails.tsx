'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface FinancialDetail {
    financialID: number;
    supplierID: number;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    iban: string;
    paymentTerms: string;
    paymentMethods: string;
    taxIdentificationNumber: string;
    vatNumber: string;
    creditLimit: number;
}

const FinancialDetails: React.FC = () => {
    const [financialDetails, setFinancialDetails] = useState<FinancialDetail[]>([]);
    const [formData, setFormData] = useState<Omit<FinancialDetail, 'financialID'>>({
        supplierID: 0,
        bankName: '',
        accountNumber: '',
        swiftCode: '',
        iban: '',
        paymentTerms: '',
        paymentMethods: '',
        taxIdentificationNumber: '',
        vatNumber: '',
        creditLimit: 0,
    });

    const fetchFinancialDetails = async () => {
        try {
            const response = await fetch('/api/financial-details');
            if (response.ok) {
                const data = await response.json();
                setFinancialDetails(data);
            } else {
                console.error('Failed to fetch financial details.');
            }
        } catch (error) {
            console.error('Error fetching financial details:', error);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'creditLimit' || name === 'supplierID' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/financial-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                fetchFinancialDetails(); // Refresh data
                setFormData({
                    supplierID: 0,
                    bankName: '',
                    accountNumber: '',
                    swiftCode: '',
                    iban: '',
                    paymentTerms: '',
                    paymentMethods: '',
                    taxIdentificationNumber: '',
                    vatNumber: '',
                    creditLimit: 0,
                });
            } else {
                console.error('Failed to add financial detail.');
            }
        } catch (error) {
            console.error('Error adding financial detail:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/financial-details/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchFinancialDetails(); // Refresh data
            } else {
                console.error('Failed to delete financial detail.');
            }
        } catch (error) {
            console.error('Error deleting financial detail:', error);
        }
    };

    useEffect(() => {
        fetchFinancialDetails();
    }, []);

    return (
        <div>
            <h2>Financial Details</h2>
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
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Bank Name"
                    required
                />
                <input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Account Number"
                />
                <input
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    placeholder="SWIFT Code"
                />
                <input
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    placeholder="IBAN"
                />
                <input
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    placeholder="Payment Terms"
                />
                <input
                    name="paymentMethods"
                    value={formData.paymentMethods}
                    onChange={handleInputChange}
                    placeholder="Payment Methods"
                />
                <input
                    name="taxIdentificationNumber"
                    value={formData.taxIdentificationNumber}
                    onChange={handleInputChange}
                    placeholder="Tax Identification Number"
                />
                <input
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                    placeholder="VAT Number"
                />
                <input
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    placeholder="Credit Limit"
                    type="number"
                />
                <button type="submit">Add Financial Detail</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Supplier ID</th>
                        <th>Bank Name</th>
                        <th>Account</th>
                        <th>SWIFT</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {financialDetails.map((f) => (
                        <tr key={f.financialID}>
                            <td>{f.supplierID}</td>
                            <td>{f.bankName}</td>
                            <td>{f.accountNumber}</td>
                            <td>{f.swiftCode}</td>
                            <td>
                                <button onClick={() => handleDelete(f.financialID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FinancialDetails;
