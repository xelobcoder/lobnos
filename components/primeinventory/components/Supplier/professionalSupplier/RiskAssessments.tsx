import React, { useState, ChangeEvent, FormEvent } from 'react';

interface RiskAssessmentFormData {
    SupplierID: number;
    RiskLevel: 'Low' | 'Medium' | 'High';
    BackupContacts: string;
    GeographicalRisks: string;
}

const RiskAssessmentForm: React.FC = () => {
    const [formData, setFormData] = useState<RiskAssessmentFormData>({
        SupplierID: 0,
        RiskLevel: 'Low',
        BackupContacts: '',
        GeographicalRisks: '',
    });

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'SupplierID' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/risk-assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({
                    SupplierID: 0,
                    RiskLevel: 'Low',
                    BackupContacts: '',
                    GeographicalRisks: '',
                });
                alert('Risk assessment added successfully!');
            }
        } catch (error) {
            console.error('Error adding risk assessment:', error);
        }
    };

    return (
        <div>
            <h2>Add Risk Assessment</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="SupplierID"
                    value={formData.SupplierID || ''}
                    onChange={handleInputChange}
                    placeholder="Supplier ID"
                    required
                />
                <select name="RiskLevel" value={formData.RiskLevel} onChange={handleInputChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <textarea
                    name="BackupContacts"
                    value={formData.BackupContacts || ''}
                    onChange={handleInputChange}
                    placeholder="Backup Contacts"
                />
                <textarea
                    name="GeographicalRisks"
                    value={formData.GeographicalRisks || ''}
                    onChange={handleInputChange}
                    placeholder="Geographical Risks"
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default RiskAssessmentForm;
