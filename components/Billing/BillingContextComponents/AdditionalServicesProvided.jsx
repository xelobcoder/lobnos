import { useContext } from 'react';
import ServicesSearchComponent from "./BillingSourceComponents/ServicesSearchComponentJsx";
import { currencyFormatter } from '../../Auth/customFetch';
import { BillingContext } from './BillingContext';
import { RiDeleteBackFill } from '@remixicon/react';

export default function ServicesProvidedToPatientBilling() {
    const { billingdata, recalculateTotalBill } = useContext(BillingContext);
    const { previousRecords, hasNightAdjustment, nightAdjustmentMode, nightAdjustmentValue, servicesProvided, totalCostOfServices, totalServiceDiscount } = billingdata;

    const applyNightAdjustmentToService = (service) => {
        let adjustedValue = service.discountedValue ?? service.servicePrice;

        if (!service.originalValue) {
            service.originalValue = service.servicePrice;
        }

        if (hasNightAdjustment && nightAdjustmentMode && nightAdjustmentValue) {
            if (nightAdjustmentMode === "absolute") {
                adjustedValue += nightAdjustmentValue;
            } else if (nightAdjustmentMode === "percentage") {
                adjustedValue += (nightAdjustmentValue / 100) * service.originalValue;
            }
        }

        return {
            ...service,
            discountedValue: adjustedValue,
            originalValue: service.servicePrice,
            hasNightAdjustment,
            nightAdjustmentMode,
            nightAdjustmentValue
        };
    };

    const updateServicesProvided = (services) => {
        const updatedServices = services.map(service => applyNightAdjustmentToService(service));
        const totalCost = updatedServices.reduce((sum, service) => sum + service.discountedValue, 0);
        let totalServiceDiscount = updatedServices.reduce((sum, service) => sum + (parseFloat(service.discount || 0) || 0), 0);
        totalServiceDiscount = parseFloat(totalServiceDiscount).toFixed(2)


        const data = {
            ...billingdata,
            servicesProvided: updatedServices,
            totalCostOfServices: totalCost,
            totalServiceDiscount
        };
        recalculateTotalBill(data);
    };

    const serviceListSelectionChangeHandler = (newService) => {
        if (previousRecords.length > 0) {
            const hasPreviouslyBeenBilled = previousRecords.some(
                (item) => item.categoryTrackId === 5 && item.trackId === newService.keyid
            );
            if (hasPreviouslyBeenBilled) return;
        }

        const isExisting = servicesProvided.some((service) => service.keyid === newService.keyid);
        if (!isExisting) {
            const updatedServices = [...servicesProvided, newService];
            updateServicesProvided(updatedServices);
        }
    };

    const removeService = (serviceId) => {
        const updatedServices = servicesProvided.filter((service) => service.keyid !== serviceId);
        updateServicesProvided(updatedServices);
    };

    const totalServices = servicesProvided.length;

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
                        {Array.isArray(servicesProvided) && servicesProvided.length > 0 && servicesProvided.map((service, index) => (
                            <tr key={index}>
                                <td>{service.serviceName}</td>
                                <td>{currencyFormatter.format(service.discountedValue)}</td>
                                <td>{currencyFormatter.format(service.discount || 0)}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeService(service.keyid)}
                                    >
                                        <RiDeleteBackFill/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <ServicesSearchComponent updatefunction={serviceListSelectionChangeHandler} />
                    </tbody>
                    <tfoot>
                        <tr>
                            <td >Total Services: {totalServices}</td>
                            <td >Total  Cost: {currencyFormatter.format(totalCostOfServices)}</td>
                            <td>Total Discount: {currencyFormatter.format(totalServiceDiscount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
