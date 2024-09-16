import MainSettingsLayoutView from "../../components/settingsComponents/MainSettingsLayoutView";
import { useState } from "react";

export default function AdditionalServicesPage() {
    const [service, setService] = useState({
        name: "",
        price: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setService({
            ...service,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (service.name && parseFloat(service.price) >= 0) {
            console.log("Form submitted:", service);
        } else {
            console.log("Please provide valid service name and price.");
        }
    };

    return (
        <MainSettingsLayoutView>
            <div className="mx-2 col-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid-reg">
                        <label>Service Name</label>
                        <input
                            className="custom-input"
                            name="name"
                            value={service.name}
                            onChange={handleInputChange}
                            placeholder="Service name"
                            required
                        />
                    </div>

                    <div className="grid-reg mt-2">
                        <label>Price</label>
                        <input
                            className="custom-input"
                            name="price"
                            type="number"
                            value={service.price}
                            onChange={handleInputChange}
                            placeholder="Price"
                            min="0"
                            step="0.01" // Ensure precise decimal handling
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary mt-3">
                        Add Service
                    </button>
                </form>
            </div>
        </MainSettingsLayoutView>
    );
}
