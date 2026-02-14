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
        const data = {
            ...billingdata,
            servicesProvided: services
        };
        recalculateTotalBill(data);
    };

    const serviceListSelectionChangeHandler = (newService: any) => {
        if (Array.isArray(previousRecords) && previousRecords.length > 0) {
            const hasPreviouslyBeenBilled = previousRecords.some(
                (item: any) => item.categoryTrackId === 5 && item.trackId === newService.keyid
            );
            if (hasPreviouslyBeenBilled) return;
        }

        const isExisting = servicesProvided.some((service: any) => service.keyid === newService.keyid);
        if (!isExisting) {
            if (newService.discount === undefined || newService.discount === null) {
                newService.discount = 0;
            } else {
                newService.discount = parseFloat(newService.discount);
            }
            const updatedServices = [...servicesProvided, newService];
            updateServicesProvided(updatedServices);
        }
    };

    const removeService = (serviceId: any) => {
        if (servicesProvided.length === 0) return;
        if (servicesProvided.length === 1) {
            updateServicesProvided([]);
            return;
        }
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
                            <th className='text-capitalize'>Type</th>
                            <th className="text-capitalize">Discount</th>
                            <th className="text-capitalize">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(servicesProvided) && servicesProvided.length > 0 && servicesProvided.map((service: any, index: number) => (
                            <tr key={index}>
                                <td>{service.serviceName}</td>
                                <td>{currencyFormatter.format(service.discountedValue ?? service.servicePrice)}</td>
                                    <td>
                               { service.userAdjustmentType ? service.userAdjustmentType : 'Normal Pricing'}
                                </td>
                                <td>{currencyFormatter.format(service.userAdjustedValue || 0)}</td>
                            
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeService(service.keyid)}
                                    >
                                        <RiDeleteBackFill />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        <MultiServicesSearchComponent updatefunction={serviceListSelectionChangeHandler} />
                    </tbody>
                    <tfoot>
                        <tr>
                            <td >Total Services: {totalServices}</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
