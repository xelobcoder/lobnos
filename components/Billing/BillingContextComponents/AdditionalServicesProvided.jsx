import { useContext, useState, useEffect } from 'react';
import { ViewCarouselTwoTone } from "@mui/icons-material";
import ServicesSearchComponent from "./BillingSourceComponents/ServicesSearchComponentJsx";
import { currencyFormatter } from '../../Auth/customFetch';
import { BillingContext } from './BillingContext';

export default function ServicesProvidedToPatientBilling({ billingid, patientid }) {
    const { billingdata, updateBilling } = useContext(BillingContext);
    const [selectedServices, setSelectedServices] = useState(new Map());

    const updateServicesProvided = (services) => {
        const totalCost = services.reduce((sum, service) => sum + service.servicePrice, 0);
        updateBilling({
            ...billingdata,
            servicesProvided: services,
            totalCostOfServices: totalCost,
        });
    };

    useEffect(() => {
        const initialServices = new Map(billingdata.servicesProvided.map(service => [service.keyid, service]));
        setSelectedServices(initialServices);
    }, [billingdata.servicesProvided])


    const serviceListSelectionChangeHandler = (newService) => {
        setSelectedServices(prevServices => {
            const updatedServices = new Map(prevServices);
            if (!updatedServices.has(newService.keyid)) {
                updatedServices.set(newService.keyid, newService);
                updateServicesProvided(Array.from(updatedServices.values()));
            }
            return updatedServices;
        });
    };

    const removeService = (serviceId) => {
        setSelectedServices(prevServices => {
            const updatedServices = new Map(prevServices);
            updatedServices.delete(serviceId);
            updateServicesProvided(Array.from(updatedServices.values()));
            return updatedServices;
        });
    };

    const totalServices = selectedServices.size;
    const totalAmount = Array.from(selectedServices.values()).reduce((sum, service) => sum + service.servicePrice, 0);

    return (
        <div className="mt-2">
            <div className="card">
                <div className="card-header d-flex justify-content-between">
                    <div className="card-title">
                        <h4>Services Information</h4>
                    </div>
                    <div>
                        <button className="btn btn-primary br-0">
                            <ViewCarouselTwoTone /> view
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <ServicesSearchComponent updatefunction={serviceListSelectionChangeHandler} />
                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th className='text-capitalize'>Service Name</th>
                                <th className='text-capitalize'>Price</th>
                                <th className='text-capitalize'>discount</th>
                                <th className='text-capitalize'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(selectedServices.values()).map((service, index) => (
                                <tr key={index}>
                                    <td>{service.serviceName}</td>
                                    <td>{currencyFormatter.format(service.servicePrice)}</td>
                                    <td>
                                       {currencyFormatter.format(service.discount || 0)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeService(service.keyid)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer d-flex justify-content-between">
                    <div>Total Services: {totalServices}</div>
                    <div>Total Amount: {currencyFormatter.format(totalAmount)}</div>
                </div>
            </div>
        </div>
    );
}
