"use client"
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import TableDisplay from '../../../../../components/accessories/TableDisplay';
import { customFetch, customPost } from '../../../../../Lib/fetcher';
import Loader from '../../../../../components/accessories/Loader';

interface ExpireStockItem {
    productordersid: number;
    name: string;
    brand: string;
    brandid: number;
    stockid: number;
    Batchnumber: string;
    receiveddate: string;
    expirydate: string;
    suppliername: string;
    purchaseunit: string;
}

interface ApiResponse {
    status: string;
    statusCode: number;
    message?: string;
    result?: ExpireStockItem[];
}

export default function ExpireStocks() {
    const [expireStock, setExpireStock] = useState<ExpireStockItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const handleDispose = async (ev: React.MouseEvent<HTMLButtonElement>, data: ExpireStockItem) => {
        ev.preventDefault();
        const { productordersid, brand, brandid, stockid, Batchnumber } = data;

        try {
            const pushData: ApiResponse = await customPost(
                'consume/expirestock',
                'POST',
                { productordersid, brand, brandid, stockid, batchnumber: Batchnumber }
            );

            const { status, statusCode, message } = pushData;

            if (statusCode === 200 && status === 'success') {
                toast.success(message || 'Disposed successfully!', { autoClose: 500 });
                setExpireStock((prev) =>
                    prev.filter((item) => item.productordersid !== productordersid)
                );
            } else {
                toast.error(message || 'Failed to dispose!', { autoClose: 3000 });
            }
        } catch (error) {
            toast.error('An error occurred during disposal.', { autoClose: 3000 });
        }
    };

    // Define table columns
    const columns = [
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Brand',
            accessor: 'brand',
        },
        {
            Header: 'Batch Number',
            accessor: 'Batchnumber',
        },
        {
            Header: 'Received Date',
            accessor: 'receiveddate',
            Cell: ({ row }: { row: { original: ExpireStockItem } }) => (
                <div className="text-success">
                    {new Date(row.original.receiveddate).toLocaleDateString()}
                </div>
            ),
        },
        {
            Header: 'Expiry Date',
            accessor: 'expirydate',
            Cell: ({ row }: { row: { original: ExpireStockItem } }) => (
                <div className="text-danger">
                    {row.original.expirydate.split('T')[0]}
                </div>
            ),
        },
        {
            Header: 'Supplied By',
            accessor: 'suppliername',
        },
        {
            Header: 'Purchase Unit',
            accessor: 'purchaseunit',
        },
        {
            Header: 'Action',
            accessor: '',
            Cell: ({ row }: { row: { original: ExpireStockItem } }) => (
                <button
                    title="These are disposed of as wastage"
                    onClick={(ev) => handleDispose(ev, row.original)}
                    className="btn br-0 btn-outline-danger px-1 btn-sm"
                >
                    Dispose
                </button>
            ),
        },
    ];

    // Fetch data
    const getData = async () => {
        setLoading(true);
        try {
            const response: ApiResponse = await customFetch('stock/expirestocks');
            if (response.status === 'success' && response.statusCode === 200) {
                setExpireStock(response.result || []);
            } else {
                setExpireStock([]);
            }
        } catch {
            setExpireStock([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <ToastContainer />
            <TableDisplay
                handleSeverSideProcessing={null}
                filtering={true}
                data={expireStock}
                column={columns}
            />
        </div>
    );
}
