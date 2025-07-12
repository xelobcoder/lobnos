import { useContext } from 'react';
import { currencyFormatter } from '../../Auth/customFetch';
import { MultiBillingContext } from './MultiBillingContext';
import { RiDeleteBackFill } from '@remixicon/react';
import MultiServicesSearchComponent from '../BillingContextComponents/BillingSourceComponents/MultiServicesSearchComponent';

export default function MultiServicesProvidedToPatientBilling() {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, recalculateTotalBill } = context;
    const { previousRecords, servicesProvided } = billingdata;

    const updateServicesProvided = (services: any[]) => {
        // No frontend-side calculations; just update the list and let backend handle totals/discounts
        const data = {
            ...billingdata,
            servicesProvided: services
        };
        recalculateTotalBill(data);
    };

    const serviceListSelectionChangeHandler = (newService: any) => {
        if (Array.isArray(previousRecords) &&  previousRecords.length > 0) {
            const hasPreviouslyBeenBilled = previousRecords.some(
                (item: any) => item.categoryTrackId === 5 && item.trackId === newService.keyid
            );
            if (hasPreviouslyBeenBilled) return;
        }

        const isExisting = servicesProvided.some((service: any) => service.keyid === newService.keyid);
        if (!isExisting) {
            const updatedServices = [...servicesProvided, newService];
            updateServicesProvided(updatedServices);
        }
    };

    const removeService = (serviceId: any) => {
        const updatedServices = servicesProvided.filter((service: any) => service.keyid !== serviceId);
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
                        {servicesProvided.map((service: any, index: number) => (
                            <tr key={index}>
                                <td>{service.serviceName}</td>
                                <td>{currencyFormatter.format(service.discountedValue ?? service.servicePrice)}</td>
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
                        <MultiServicesSearchComponent updatefunction={serviceListSelectionChangeHandler} />
                    </tbody>
                    <tfoot>
                        <tr>
                            <td >Total Services: {totalServices}</td>
                            {/* Totals are now backend-driven; display placeholders or remove if not needed */}
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
