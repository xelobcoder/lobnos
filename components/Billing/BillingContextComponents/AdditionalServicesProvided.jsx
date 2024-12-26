import { useContext, useState, useEffect } from 'react';
import { Delete } from "@mui/icons-material";
import ServicesSearchComponent from "./BillingSourceComponents/ServicesSearchComponentJsx";
import { currencyFormatter } from '../../Auth/customFetch';
import { BillingContext } from './BillingContext';

export default function ServicesProvidedToPatientBilling() {
    const { billingdata, updateBilling, recalculateTotalBill } = useContext(BillingContext);
    const [selectedServices, setSelectedServices] = useState([]);

    const updateServicesProvided = (services) => {
        const totalCost = services.reduce((sum, service) => sum + service.servicePrice, 0);
        const data = {
            ...billingdata,
            servicesProvided: services,
            totalCostOfServices: totalCost,
        };
        recalculateTotalBill(data);
    };


    const serviceListSelectionChangeHandler = (newService) => {
        setSelectedServices((prevServices) => {
            const isExisting = prevServices.some((service) => service.keyid === newService.keyid);
            if (!isExisting) {
                const updatedServices = [...prevServices, newService];
                updateServicesProvided(updatedServices);
                return updatedServices;
            }
            return prevServices;
        });
    };

    const removeService = (serviceId) => {
        setSelectedServices((prevServices) => {
            const updatedServices = prevServices.filter((service) => service.keyid !== serviceId);
            updateServicesProvided(updatedServices);
            return updatedServices;
        });
    };

    const totalServices = selectedServices.length;
    const totalAmount = selectedServices.reduce((sum, service) => sum + service.servicePrice, 0);

    return (
        <div className="mt-2">
            <hr />
            <div className="card-title">Services Information</div>
            <div>
                <table className="table ttable billing-cart-table mt-3">
                    <thead>
                        <tr>
                            <th className="text-capitalize">Service Name</th>
                            <th className="text-capitalize">Price</th>
                            <th className="text-capitalize">Discount</th>
                            <th className="text-capitalize">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedServices.map((service, index) => (
                            <tr key={index}>
                                <td>{service.serviceName}</td>
                                <td>{currencyFormatter.format(service.servicePrice)}</td>
                                <td>{currencyFormatter.format(service.discount || 0)}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeService(service.keyid)}
                                    >
                                        <Delete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <ServicesSearchComponent updatefunction={serviceListSelectionChangeHandler} />
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3}>Total Services: {totalServices}</td>
                            <td>Total Amount: {currencyFormatter.format(totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
