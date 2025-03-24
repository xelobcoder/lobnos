import React, { useState, ChangeEvent, FormEvent } from 'react';

interface PerformanceMetricFormData {
    SupplierID: number;
    DeliveryPerformance: number;
    DefectRate: number;
    Responsiveness: number;
    PastOrderCount: number;
}

const PerformanceMetricsForm: React.FC = () => {
    const [formData, setFormData] = useState<PerformanceMetricFormData>({
        SupplierID: 0,
        DeliveryPerformance: 0.0,
        DefectRate: 0.0,
        Responsiveness: 0.0,
        PastOrderCount: 0,
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'SupplierID' || name === 'PastOrderCount' ? parseInt(value) : parseFloat(value),
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/performance-metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({
                    SupplierID: 0,
                    DeliveryPerformance: 0.0,
                    DefectRate: 0.0,
                    Responsiveness: 0.0,
                    PastOrderCount: 0,
                });
                alert('Performance metric added successfully!');
            }
        } catch (error) {
            console.error('Error adding performance metric:', error);
        }
    };

    return (
        <div>
            <h2>Add Performance Metric</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="SupplierID"
                    value={formData.SupplierID || ''}
                    onChange={handleInputChange}
                    placeholder="Supplier ID"
                    required
                />
                <input
                    name="DeliveryPerformance"
                    value={formData.DeliveryPerformance || ''}
                    onChange={handleInputChange}
                    placeholder="Delivery Performance"
                    required
                />
                <input
                    name="DefectRate"
                    value={formData.DefectRate || ''}
                    onChange={handleInputChange}
                    placeholder="Defect Rate"
                    required
                />
                <input
                    name="Responsiveness"
                    value={formData.Responsiveness || ''}
                    onChange={handleInputChange}
                    placeholder="Responsiveness"
                    required
                />
                <input
                    name="PastOrderCount"
                    value={formData.PastOrderCount || ''}
                    onChange={handleInputChange}
                    placeholder="Past Order Count"
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default PerformanceMetricsForm;
