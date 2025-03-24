"use client"
import { useState, useEffect } from 'react';
import Loader from '../accessories/Loader';
import { customFetch, customPost } from '../../Lib/fetcher';
import { toast, ToastContainer } from 'react-toastify';


interface ExpireStock {
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

interface FetchResponse {
    result: ExpireStock[];
    status: string;
    statusCode: number;
    total: number;
}

interface PaginatedTableProps {
    fetchUrl: string;
}

interface ExpireStock {
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


export default function GeneralExpiredStocksTable({ fetchUrl }: PaginatedTableProps) {
    const [data, setData] = useState<ExpireStock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const response: FetchResponse = await customFetch(`${fetchUrl}?page=${page}&count=${pageSize}`)
            const { result, status, statusCode, total } = response;

            if (status === 'success' && statusCode === 200) {
                setData(result);
                setTotalRecords(total);
            } else {
                setData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            setData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const handleDispose = async (data: ExpireStock) => {
        const { productordersid, brand, brandid, stockid, Batchnumber } = data;

        try {
            const response = await customPost('consume/expirestock', 'POST', {
                productordersid,
                brand,
                brandid,
                stockid,
                batchnumber: Batchnumber,
            })

            const { status, statusCode, message } = response;

            if (status === 'success' && statusCode === 200) {
                toast.success(message, { autoClose: 500 });
            } else {
                toast.error(message, { autoClose: 3000 });
            }
        } catch (error) {
            toast.error("An error occurred while disposing of the stock.", { autoClose: 3000 });
        }
    };

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= Math.ceil(totalRecords / pageSize)) {
            setCurrentPage(page);
        }
    };

    const renderTable = () => {
        if (loading) return <Loader />;
        if (data.length === 0) return <p className=' heightedBorder p-3 bg-secondary-subtle d-flex justify-content-center'> No data found.</p>;

        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Batch Number</th>
                        <th>Received Date</th>
                        <th>Expiry Date</th>
                        <th>Supplied By</th>
                        <th>Purchase Unit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(stock => (
                        <tr key={stock.productordersid}>
                            <td>{stock.name}</td>
                            <td>{stock.brand}</td>
                            <td>{stock.Batchnumber}</td>
                            <td className="text-success">{new Date(stock.receiveddate).toLocaleDateString()}</td>
                            <td className="text-danger">{stock.expirydate.split('T')[0]}</td>
                            <td>{stock.suppliername}</td>
                            <td>{stock.purchaseunit}</td>
                            <td>
                                <button
                                    title="Dispose stock"
                                    onClick={() => {handleDispose(stock)}}
                                    className="btn br-0 btn-outline-danger px-1 btn-sm"
                                >
                                    Dispose
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (totalPages <= 1) return null;

        const pageNumbers = Array.from(
            { length: Math.min(10, totalPages) },
            (_, i) => i + (currentPage > 5 ? currentPage - 5 : 1)
        ).filter(page => page <= totalPages); 
        
        return (
            <nav>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-disabled={currentPage === 1}>
                            Previous
                        </button>
                    </li>
                    {pageNumbers.map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page)}>
                                {page}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div>
            <ToastContainer />
            {renderTable()}
            {renderPagination()}
        </div>
    );
}
