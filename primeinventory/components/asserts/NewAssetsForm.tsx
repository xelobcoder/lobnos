import { useState, ChangeEvent, FormEvent } from "react";

interface InventoryAssetFormData {
    assetId: string;
    name: string;
    description: string;
    serialNumber: string;
    manufacturer: string;
    purchaseDate: string;
    warrantyEndDate: string;
    location: string;
    assignedTo: string;
    cost: string;
    depreciationRate: string;
}

const InventoryAssetsForm = () => {
    const [formData, setFormData] = useState<InventoryAssetFormData>({
        assetId: '',
        name: '',
        description: '',
        serialNumber: '',
        manufacturer: '',
        purchaseDate: '',
        warrantyEndDate: '',
        location: '',
        assignedTo: '',
        cost: '',
        depreciationRate: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/inventoryAssets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Asset created successfully!');
            } else {
                alert('Error creating asset.');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('Error creating asset.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Inventory Asset</h2>
            <input
                type="text"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                placeholder="Asset ID"
                required
            />
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Asset Name"
                required
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
            />
            <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Serial Number"
                required
            />
            <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Manufacturer"
            />
            <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                placeholder="Purchase Date"
            />
            <input
                type="date"
                name="warrantyEndDate"
                value={formData.warrantyEndDate}
                onChange={handleChange}
                placeholder="Warranty End Date"
            />
            <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
            />
            <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder="Assigned To"
            />
            <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Cost"
            />
            <input
                type="number"
                name="depreciationRate"
                value={formData.depreciationRate}
                onChange={handleChange}
                placeholder="Depreciation Rate"
            />
            <button type="submit">Create Asset</button>
        </form>
    );
};

export default InventoryAssetsForm;
