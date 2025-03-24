import ADD_NEW_SUPPLIER from '../../../../components/Supplier/addNewSupplier';
import { customFetch } from '../../../../Lib/fetcher';

export interface SupplierFormValues {
    name: string;
    address?: string;
    email: string;
    phonenumber: string;
    region?: string;
    contactperson?: string;
}


interface SupplyProps {
    searchParams:Promise< {
        csvid?: string;
        gen?: string;
    }>;
}

export default async function SUPPLY({ searchParams }: SupplyProps) {
    const { csvid, gen } = await searchParams;
    let supplierId: number | null = null;
    let supplierInformation: SupplierFormValues | null = null;

    if (csvid && gen) {
        const offset = parseInt(gen, 10);
        supplierId = parseInt(csvid.slice(offset), 10);
    }

    try {
        if (supplierId) {
            const data = await customFetch(
                `suppliers/getsupplier?supplierid=${supplierId}`
            );
            const result = data?.result;
            if (Array.isArray(result) && result.length > 0) {
                supplierInformation = result[0];
            }
        }
    } catch (err) {
        console.error("Error fetching supplier data:", err);
    }

    return (
        <div>
            <ADD_NEW_SUPPLIER
                supplierid={supplierId}
                isEditing={Boolean(supplierId)}
                supplierInformation={supplierInformation}
            />
        </div>
    );
}
