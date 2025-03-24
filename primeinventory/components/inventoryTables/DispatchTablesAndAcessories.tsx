"use client"
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DispatchStockAccordionList from '../inventory/stocks/stockRequest/_DispatchStockAccordionList';


interface DepartmentRequisition {
    id: number
}


export default function DispatchTablesAndAcessories({ requisitions, inv, departmentid }: { requisitions: any[], inv: {}, departmentid: number }) {
    const [data, setData] = useState<DepartmentRequisition[]>(requisitions);
    const [selectedDept, setSelectedDept] = useState<number | null>(null);
    const [invsettings, setInvsettings] = useState(inv);
    const [loading, setLoading] = useState<boolean>(false);

    const updateDept = (id: string) => setSelectedDept(parseInt(id));

    const removeItem = (id: number) => {
        setLoading(true);
        const nwData = data.filter((item) => item?.id !== id);
        setData(nwData);
        setLoading(false);
    }



    const passToast = async (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            toast.success(message, { autoClose: 500 });
            return;
        }
        toast.error(message, { autoClose: 2000 });
    }

    return (
        <React.Fragment>
            <ToastContainer position='top-center' className={'text-sm'} theme='colored' />
            <h4>Approved Department Requisitions</h4>
            <DispatchStockAccordionList
                departmentid={departmentid}
                removeItem={removeItem}
                passToast={passToast}
                invsettings={invsettings}
                data={data}
            />
        </React.Fragment>
    )
}
