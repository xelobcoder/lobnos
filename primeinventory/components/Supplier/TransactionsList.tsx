"use client"
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { Button, ButtonGroup, Col, Row } from "react-bootstrap";
import "../../node_modules/react-datepicker/dist/react-datepicker.css";
import UsePaginationHook from "../accessories/usePaginationHook";
import DatePickerRange from "../accessories/DatePickerRange";
import { myTheme } from "./AgGridTheme";
import Loader from "../accessories/Loader";
import Link from "next/link";
import { customFetch } from "../../Lib/fetcher";
interface Transaction {
    requestedby: string;
    receivedby: string;
    orderTransactionid: string;
    orderdate: string;
}

interface Filter {
    page: number;
    count: number;
}

interface DateRange {
    from: string;
    end: string;
}

const filterDefault: Filter = { page: 1, count: 20 };

export default function SuppliersTansactionList({ data }: { data: Transaction[] }) {
    const [date, setDate] = useState<DateRange>({ from: "", end: "" });
    const [filter, setFilter] = useState<Filter>(filterDefault);
    const [productData, setProductData] = useState<Transaction[]>(data);
    const [loading, setLoading] = useState<boolean>(false);

    const endpointDefault = `orders/transactions`;

    const clearFilterTransactions = (): void => {
        setFilter(filterDefault);
        setDate({ from: "", end: "" });
    };

    const getRange = (values: [string | null, string | null]): void => {
        if (Array.isArray(values) && values.length === 2 && values[0] && values[1]) {
            setDate({ from: new Date(values[0]).toString(), end: new Date(values[1]).toString() });
        }
    };


    const updatePageData = async (pageValue: number) => {
        try {
            setLoading(true);
            const response = await customFetch(endpointDefault + `?count=${filter.count}&&page=${pageValue}`);
            if (Array.isArray(response)) {
                setProductData(response);
            }
        } catch (error) {
            setProductData([])
        } finally {
            setLoading(false);
        }
    }

    const columns: ColDef[] = [
        {
            headerName: "Requested By",
            field: "requestedby",
        },
        {
            headerName: "Received By",
            field: "receivedby",
        },
        {
            headerName: "Order Transaction ID",
            field: "orderTransactionid",
        },
        {
            headerName: "Order Date",
            field: "orderdate",
            cellRenderer: (params: any) => params.value ? new Date(params.value).toLocaleString() : "",
        },
        {
            headerName: "Details",
            field: "action",
            cellRenderer: (params: any) => (
                <Link href={`/purchasemanagement/transactions/${params.data.orderTransactionid}`}>View Transaction Details</Link>
            ),
        },
    ];

    const filterTransactions = (): void => {
        if (date.end && date.from) {
            const endpoint = `orders/transactions?page=${filter.page}&count=${filter.count}&from=${date.from}&end=${date.end}&paginate=true`;
        }
    };

    const onPaginationChange = (page: number) => {
        setFilter(prevFilter => {
            if (prevFilter.page !== page) {
                return { ...prevFilter, page };
            }
            return prevFilter;
        });
        updatePageData(page)
    };

    if (loading) return <Loader />;

    return (
        <div>
            <Row className="mx-1">
                <Col className="d-flex col-2">
                    <DatePickerRange
                        placeholder="Select date here"
                        getRange={getRange}
                        start={date.from}
                        end={date.end}
                    />
                </Col>
                <Col>
                    <ButtonGroup>
                        <Button onClick={filterTransactions} variant="secondary">
                            Filter Transactions
                        </Button>
                        <Button onClick={clearFilterTransactions} variant="danger">
                            Clear Filter
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
            <Row className="d-flex justify-content-between mx-1 col-12">
                <Col>
                    <h6>Transactions</h6>
                </Col>
            </Row>
            <Row className="mx-1">
                <div style={{ height: 'auto', width: "100%" }}>
                    <AgGridReact
                        columnDefs={columns}
                        rowData={productData}
                        theme={myTheme}
                        paginationPageSize={filter.count}
                        domLayout="autoHeight"
                    />
                </div>
                <div>
                    <UsePaginationHook
                        totalPages={10}
                        currentPage={filter.page}
                        onPageChange={onPaginationChange}
                    />
                </div>
            </Row>
        </div>
    );
}
