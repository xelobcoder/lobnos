"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import { Form, InputGroup, Row } from "react-bootstrap";
import { ICellRendererParams, ColDef } from "ag-grid-community";
import { customFetch } from "../../Lib/fetcher";
import ShowTableCount from "../accessories/ShowCountTable";
import UsePaginationHook from "../accessories/usePaginationHook";
import TransactionItemsModal from "../inventoryTables/TransactionItemsModal";
import { myTheme } from "../Supplier/AgGridTheme";
import Loader from "../accessories/Loader";

export interface Order {
    productordersid: number;
    name: string;
    suppliername: string;
    purchaseunit: string;
    date: string;
    quantity: number;
    orderTransactionid: number;
    username: string;
    status: string | null;
    received: string;
    orderCount: number;
}

export default function PurchasesTransactionSummary({ summary }: { summary: Order[] }) {
    const [ordersPlacedList, setOrdersPlacedList] = useState<Order[]>(summary);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [startdate, setStartdate] = useState<string | null>(null);
    const [enddate, setEnddate] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("pending");
    const [tempSearchQuery, setTempSearchQuery] = useState<string>("");
    const [pagination, setPagination] = useState({ count: 10, page: 1 });
    const router = useRouter();

    const handleModalOpen = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const viewReceivedOrders = (order: Order) => {
        if (["pending", "incomplete"].includes(statusFilter)) {
            router.push(`/purchasemanagement/purchases/receive/${order.orderTransactionid}?isUpdate=false&&status=pending&&includebrands=true`);
        } else {
            router.push(`/purchasemanagement/purchases/receive/${order.orderTransactionid}?isUpdate=true&&withTransactionAccounting=true&&includebrands=true`);
        }
    };

    const handleFiltering = async (count: number, page: number) => {
        setLoading(true);
        try {
            const data = await customFetch(
                `orders/transactions-summary?status=${statusFilter}&&page=${page}&&count=${count}&&startdate=${startdate}&&enddate=${enddate}&&search=${tempSearchQuery}`
            );
            setOrdersPlacedList(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrdersPlacedList([]);
        } finally {
            setLoading(false);
        }
    }

    


    const handleViewTransactionDetails = (data: Order) => {
        if (data.orderTransactionid) {
            router.push(`/purchasemanagement/purchases/receive/${data.orderTransactionid}?isUpdate=false&&isAdmin=validate&&status=completed&&includebrands=true&&withTransactionAccounting=true`)
        }
    }

    const RenderActionsButtons = (props: ICellRendererParams) => (
        <div className="d-flex">
            <button
                disabled={statusFilter !== 'pending'}
                className="btn btn-info btn-sm "
                onClick={() => handleModalOpen(props.data)}
            >
                View More
            </button>
            <button
                className="btn btn-primary btn-sm mx-2 "
                onClick={() => viewReceivedOrders(props.data)}
            >
                Receive Order
            </button>
            <button disabled={statusFilter != 'complete'} onClick={(ev) => handleViewTransactionDetails(props.data)} className="btn btn-dark btn-sm">
                View Transaction Details
            </button>
        </div>
    );

    const columns: ColDef<Order>[] = [
        { headerName: "Order Transaction ID", field: "orderTransactionid", pinned: "left" },
        { headerName: "Requested By", field: "username", pinned: "left" },
        {
            headerName: "Order Date",
            field: "date",
            valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
        },
        { headerName: 'Requested To', field: 'name' },
        {
            headerName: "Status",
            field: "status",
            cellRenderer: (params: any) => (
                <div>
                    {params.value == null ? (
                        <button className="btn btn-warning btn-sm">Pending</button>
                    ) : (
                        params.value
                    )}
                </div>
            ),
        },
        { headerName: "Stocks Count", field: "orderCount", width: 50 },
        { headerName: "Actions", cellRenderer: RenderActionsButtons, width: 400 },
    ];

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStatus = event.target.value;
        setStatusFilter(selectedStatus);
    };

    const handleSearchClick = () => {
        const { count, page } = pagination;
        handleFiltering(count, page);
    };

    const handlePagination = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
        handleFiltering(pagination.count, page);
    };



    if (loading) return <Loader />

    return (
        <>
            <Row className="mb-4 align-items-center">
                {/* Filter Row */}
                <div className="d-flex flex-wrap gap-3 justify-content-between">
                    <div className="d-flex gap-3 flex-wrap col-12">
                        {/* Status Filter */}
                        <div className="form-group col-lg-2 col-md-3 col-sm-4">
                            <label className="form-label fw-bold text-secondary">Status</label>
                            <select
                                className="form-select form-select-lg rounded border-secondary"
                                value={statusFilter}
                                onChange={handleFilterChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="incomplete">Incomplete</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="form-group col-lg-4 col-md-4 col-sm-5">
                            <label className="form-label fw-bold text-secondary">Date Range</label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="date"
                                    value={startdate || ""}
                                    onChange={(e) => setStartdate(e.target.value)}
                                    className="form-control-lg rounded border-secondary"
                                />
                                <Form.Control
                                    type="date"
                                    value={enddate || ""}
                                    onChange={(e) => setEnddate(e.target.value)}
                                    className="form-control-lg rounded border-secondary"
                                />
                            </div>
                        </div>

                        {/* Search Field */}
                        <div className="form-group col-lg-4 col-md-4 col-sm-6">
                            <label className="form-label fw-bold text-secondary">Search</label>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Search supplier or requester"
                                    value={tempSearchQuery}
                                    onChange={(e) => setTempSearchQuery(e.target.value)}
                                    className="form-control-lg rounded border-secondary"
                                />
                                <button
                                    className="btn btn-lg btn-primary px-4"
                                    onClick={handleSearchClick}
                                >
                                    Search
                                </button>
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </Row>

            <div className="ag-theme-quartz" style={{ height: "500px", width: "100%" }}>
                <h4 className="bg-secondary-subtle p-2 text-capitalize">{statusFilter} Order Transaction Summary</h4>
                <hr />
                <div style={{ height: 'auto' }}>
                    <AgGridReact
                        columnDefs={columns}
                        rowData={ordersPlacedList}
                        loading={loading}
                        rowSelection="multiple"
                        domLayout="autoHeight"
                        theme={myTheme}
                    />
                </div>

                {/* ShowTableCount added back here */}
                <div className="d-flex justify-content-between">
                    <div className="col-3">
                        <ShowTableCount queryParams={pagination} setQueryParams={setPagination} />
                    </div>
                    <div>
                        <UsePaginationHook
                            currentPage={pagination.page}
                            totalPages={5}
                            onPageChange={handlePagination}
                        />
                    </div>
                </div>
            </div>

            {showModal && selectedOrder && (
                <TransactionItemsModal
                    showModal={showModal}
                    handleClose={handleModalClose}
                    order={selectedOrder}
                />
            )}
        </>
    );
}
