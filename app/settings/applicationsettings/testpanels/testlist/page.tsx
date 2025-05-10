"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../components/accessories/Loader";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import TestActions from "../../../../../components/settingsComponents/TestActions";
import * as React from 'react';

interface TestPanel {
    id: number;
    name: string;
    price: number;
    qty_required: number;
    unit: string;
    shorttext?: string;
}

interface Column {
    Header: string;
    accessor: string | ((row: TestPanel) => any);
    Cell?: ({ row, value }: { row: { original: TestPanel }, value: any }) => React.JSX.Element;
}

export default function TestListDisplay() {
    const [data, setData] = useState<TestPanel[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        customFetch('testpanel/list/bulk')
            .then((response) => {
                setData(response?.data || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setData([]);
            });
    }, []);

    const deleteCustomTest = async (item: TestPanel): Promise<void> => {
        const { id } = item;
        if (!id) return;
        const confirmation = confirm(`Are you sure you want to delete this test? This will delete all information associated with the test.`);
        if (confirmation) {
            const response = await customPost(`testpanel/list?testid=${id}`, 'DELETE', {});
            if (response.status === "success") {
                setLoading(true);
                setData((prev) => prev.filter((a) => a.id !== id));
                setLoading(false);
            }
        }
    };

    const columns: Column[] = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row, value }: { row: { original: TestPanel }, value: string }) => (
                <span>{value} {row.original.shorttext ? `(${row.original.shorttext})` : ""}</span>
            )
        },
        {
            Header: 'Price',
            accessor: 'price',
        },
        {
            Header: 'Sample Qty',
            accessor: 'qty_required',
            Cell: ({ row, value }: { row: { original: TestPanel }, value: number }) => (
                <div>{value} {row.original.unit}</div>
            )
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }: { row: { original: TestPanel } }) => {
                const { id } = row.original;
                return <TestActions id={id} row={row} deleteCustomTest={deleteCustomTest} />;
            }
        }
    ];

    if (isLoading) return <Loader />;
    return (
        <section>
            <div className="d-flex justify-content-end mx-2">
                <button 
                    onClick={() => router.push("/settings/applicationsettings/testpanels/testlist/createcustomtest")} 
                    className="btn btn-dark btn-sm text-capitalize"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z"></path>
                    </svg> new test
                </button>
            </div>
            <div>
                <PrimeTable
                    serverSideFiltering={true}
                    filtering={false} 
                    handleSeverSideProcessing={null}
                    column={columns} 
                    data={data} 
                />
            </div>
        </section>
    );
}
