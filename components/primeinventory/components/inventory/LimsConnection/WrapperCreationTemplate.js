import { useState, useEffect } from "react";
import Select from "react-select";
import { customFetch } from "../../../components/Auth/customFetch";
import { UseLimsConnectionCreationContext } from "./InventoryLimsContext";

export default function WrapperCreationTemplate() {
    const { templates, setTemplates, toast } = UseLimsConnectionCreationContext();
    const [selectedTest, setSelectedTest] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await customFetch("testpanel/list/bulk");
                if (response?.status === "success") {
                    setTemplates(prev => ({ ...prev, testpanels: response.data }));
                }
            } catch (error) {
                console.error("Error loading test panels:", error);
                toast.error("Failed to load test panels.");
            }
        };
        fetchData();
    }, [setTemplates, toast]);

    const testOptions = Array.isArray(templates.testpanels) && templates.testpanels.map(test => ({
        value: test.prim_key,
        label: test.name
    }));

    const handleTestChange = (selectedOption) => {
        const selected = templates.testpanels.find(test => test.prim_key === selectedOption.value);
        setSelectedTest(selected);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleTemplateCreation = () => {
        if (selectedTest && quantity > 0) {
            console.log(`Creating template for ${selectedTest.name} with quantity ${quantity}`)
        } else {
            toast.error("Please select a test and enter a valid quantity.");
        }
    };

    return (
        <div>
            <h5>Create Template For Automatic Deduction of Stocks</h5>

            <div style={{ minHeight: '40vh' }}>
                <label>Select Test:</label>
                <Select
                    options={testOptions}
                    className="text-sm"
                    onChange={handleTestChange}
                    placeholder="Select a test..."
                />
            </div>

            <div>
                <label>Quantity:</label>
                <input
                    type="number"
                    className="custom-input"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                />
            </div>

            {selectedTest && (
                <div className="template-preview">
                    <h6>Template for: {selectedTest.name}</h6>
                    <p>Category: {selectedTest.category}</p>
                    <p>Sample Container: {selectedTest.sample_container}</p>
                    <p>Unit: {selectedTest.unit}</p>
                    <p>Required Quantity: {selectedTest.qty_required}</p>
                    <p>Price: ${selectedTest.price}</p>
                    <button onClick={handleTemplateCreation}>Create Template</button>
                </div>
            )}
        </div>
    );
}
