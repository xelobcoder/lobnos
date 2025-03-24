'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ProductService {
    productID: number;
    supplierID: number;
    productName: string;
    productCode: string;
    unitCost: number;
    volumeDiscount: string;
    MOQ: number;
    leadTime: number;
}

const ProductsServices: React.FC = () => {
    const [formData, setFormData] = useState<Omit<ProductService, 'productID'>>({
        supplierID: 0,
        productName: '',
        productCode: '',
        unitCost: 0,
        volumeDiscount: '',
        MOQ: 1,
        leadTime: 0,
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'unitCost' || name === 'MOQ' || name === 'leadTime' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/products-services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setFormData({
                    supplierID: 0,
                    productName: '',
                    productCode: '',
                    unitCost: 0,
                    volumeDiscount: '',
                    MOQ: 1,
                    leadTime: 0,
                });
            } else {
                console.error('Failed to add product/service.');
            }
        } catch (error) {
            console.error('Error adding product/service:', error);
        }
    };

    return (
        <div>
            <h2>Product/Service Details</h2>
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
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Product Name"
                    required
                />
                <input
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    placeholder="Product Code"
                />
                <input
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    placeholder="Unit Cost"
                    type="number"
                />
                <input
                    name="volumeDiscount"
                    value={formData.volumeDiscount}
                    onChange={handleInputChange}
                    placeholder="Volume Discount"
                />
                <input
                    name="MOQ"
                    value={formData.MOQ}
                    onChange={handleInputChange}
                    placeholder="MOQ"
                    type="number"
                />
                <input
                    name="leadTime"
                    value={formData.leadTime}
                    onChange={handleInputChange}
                    placeholder="Lead Time (Days)"
                    type="number"
                />
                <button type="submit">Add Product/Service</button>
            </form>
        </div>
    );
};

export default ProductsServices;
