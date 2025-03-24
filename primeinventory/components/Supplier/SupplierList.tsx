"use client";
import { useRouter } from 'next/navigation';
import { Button, Col, Dropdown, Row, Spinner } from 'react-bootstrap';
import TableDisplay from '../accessories/TableDisplay';
import { customFetch, customPost, generateRandomTextAndNumbers } from '../../Lib/fetcher';
import { toast } from 'react-toastify';
import { useState } from 'react';
import UsePaginationHook from '../accessories/usePaginationHook';
import SimpleTableDisplay from '../accessories/SimpleTableDisplay';


interface Supplier {
    supplierid: number;
    date: string;
    name: string;
    phonenumber: string;
    email: string;
    contactperson: string;
    region: string;
    address: string;
}

interface SUPPLIERS_LISTProps {
    rawdata: Supplier[];
}

interface PaginationPropertyType { count: number, page: number }

export default function SUPPLIERS_LIST({ rawdata }: SUPPLIERS_LISTProps) {
    const [pagination, setPagination] = useState<PaginationPropertyType>({ count: 10, page: 1 });

    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const deleteHandler = async (id: number, supplierid: number) => {
        let confirmation = confirm(`Do you really want to delete supplier?`);
        if (!confirmation) return;

        try {
            setLoading(true);
            const response = await customPost(`suppliers?supplierid=${supplierid}`, 'DELETE', {});
            const { status, message } = response;
            if (status === "success") {
                toast.success(message, { autoClose: 500 });
                const updatedData = rawdata.filter((item: Supplier) => item.supplierid !== supplierid);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const updateHandler = async (supplierid: number) => {
        if (!supplierid || typeof supplierid !== "number") return;
        const generateFunnyId = generateRandomTextAndNumbers(20);
        router.push(`/purchasemanagement/suppliers/newsuppliers?csvid=${generateFunnyId}${supplierid}&&gen=20`);
    };

    const columns = [
        {
            Header: "Registration Date",
            accessor: "date",
            Cell: ({ value }: { value: string }) => {
                return value ? new Date(value).toLocaleDateString() : '';
            },
        },
        { Header: "Name", accessor: "name", Cell: ({ value }) => <div className='text-capitalize'>{value}</div> },
        {
            Header: "Phone Number",
            accessor: "phonenumber",
            Cell: ({ row }: { row: { original: { phonenumber: string } } }) => {
                const mobile = row.original.phonenumber;
                return <span>{'0' + mobile}</span>;
            },
        },
        { Header: "Email", accessor: "email", },
        { Header: "Contact Person", accessor: "contactperson", },
        { Header: "Region", accessor: "region", },
       {
    Header: "Action",
    accessor: "",
    Cell: ({ row }: { row: { original: { supplierid: number } } }) => {
        const supplierid = row.original.supplierid;
        return (
            <Dropdown>
                <Dropdown.Toggle variant="secondary" size="sm">
                    Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => updateHandler(supplierid)}>
                        Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => router.push(`/supplier/preview?supplierid=${supplierid}`)}>
                        Details
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => router.push(`/purchasemanagement/placeorder/${supplierid}`)}>
                        Order New Stocks
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => deleteHandler(0, supplierid)}>
                        Delete
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    },
}

    ];


    const handlePagination = async (pageCount: number, currentPage: number): Promise<{ result: any[] | null, error?: null | string }> => {
        try {
            const response = await customFetch(`suppliers?count=${pageCount}&&page=${currentPage}`);
            const { result } = response;
            if (result && Array.isArray(result)) {
                return { result, error: null }
            }
            return { result: [], error: null }
        } catch
        (err) {
            return { result: null, error: err?.message || "something wrong occured loading data" }
        }
    }

    return (
        <>
            <Row className="mx-1">
                <Col className="col-12 d-flex justify-content-end">
                    {loading && <Spinner animation="border" />}
                </Col>
            </Row>
            <TableDisplay
                handleSeverSideProcessing={handlePagination}
                filtering={true}
                serverSideFiltering={true}
                column={columns} data={rawdata || []} />
        </>
    );
}
