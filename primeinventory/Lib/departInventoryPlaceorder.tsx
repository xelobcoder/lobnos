"use server"
import { customPost } from './fetcher';
import { SelectedStockItem } from '../components/inventoryTables/DepartmentRequestPlaceOrderTable';

type DepartmentRequisitionProps = {
    stocks: SelectedStockItem[];
    departmentid: number;
};

export const departmentRequisition = async ({ stocks, departmentid }: DepartmentRequisitionProps) => {
    if (stocks.length === 0) {
        throw new Error('No stock items found.');
    }

    const transformedData = stocks.map((item: SelectedStockItem) => ({
        ...item,
        departmentid,
        employeeid: 3,
        quantity: item.requestedQty,
    }));

    const hasEmptyValuesOrInvalidQuantity = transformedData.some(item =>
        Object.values(item).includes('') || item.requestedQty === 0
    );

    if (hasEmptyValuesOrInvalidQuantity) {
        throw new Error('Please fill in the required quantity.');
    }

    try {
        const pushResponse = await customPost('departments/requisitions', 'POST', transformedData);
        const { status, statusCode, message } = pushResponse;

        if (status === 'success' && statusCode === 200) {
            return { success: true, message };
        } else {
            throw new Error(message || 'Failed to add requisition.');
        }
    } catch (err) {
        console.error(err);
        throw new Error('An error occurred while pushing the order.');
    }
};
