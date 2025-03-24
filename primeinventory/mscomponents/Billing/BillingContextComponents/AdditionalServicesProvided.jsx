import { useContext, useState, useEffect } from 'react';
import { Delete, ViewCarouselTwoTone } from "@mui/icons-material";
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
            <hr />
            <div className="card-title">
                Services Information
            </div>
            <div>
                <table className="table ttable billing-cart-table mt-3">
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
                                       <Delete/>
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
