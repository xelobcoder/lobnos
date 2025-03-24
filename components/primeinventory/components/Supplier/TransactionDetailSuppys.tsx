"use client"
import { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridReact } from "ag-grid-react";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ProductTransactionDetail } from "../../app/purchasemanagement/transactions/[transactionsid]/page";
import { myTheme } from "./AgGridTheme";
interface TransactionDetailsProps {
    data: any[];
    transactionid: number
}

export default function TransactionDetailSuppys({ data, transactionid }: TransactionDetailsProps) {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedRowData, setSelectedRowData] = useState<ProductTransactionDetail | null>(null);
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = (rowData: any) => {
        setSelectedRowData(rowData);
        setShowModal(true);
    };

    const columnDefs: ColDef<ProductTransactionDetail>[] = [
        {
            headerName: "Transaction ID",
            field: "orderTransactionid",
            pinned: 'left'
        },
        {
            headerName: "Stock",
            field: "name",
            pinned: 'left'
        },
        {
            headerName: "Supplier Name",
            field: "suppliername",
        },
        {
            headerName: "Purchase Unit",
            field: "purchaseunit",
        },
        {
            headerName: "Date",
            field: "date",
            cellRenderer: (params: any) => new Date(params.value).toLocaleString(),
        },
        {
            headerName: "Quantity",
            field: "quantity",
        },
        {
            headerName: "Status",
            field: "received",
            cellRenderer: (params: any) => (
                <button
                    className={`btn btn-sm ${params.value === "TRUE" ? "btn-success" : "btn-warning"
                        }`}
                >
                    {params.value === "TRUE" ? "Received" : "Pending"}
                </button>
            ),
        },
        {
            headerName: "Total Amount",
            field: "totalamount",
        },
        {
            headerName: "Details",
            field: "details",
            cellRenderer: (params: any) => (
                <Button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleModalShow(params.data)}
                >
                    View More
                </Button>
            ),
        },
    ];



    const gridOptions: GridOptions = {
        pagination: false,
        paginationPageSize: data.length,
        defaultColDef: {
            width: 150,
        },
    };



    return (
        <div style={{ height: "auto", width: "100%" }}>
            <h6>Transaction Details</h6>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={data}
                gridOptions={gridOptions}
                theme={myTheme}
                domLayout="autoHeight"
            />

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton className=" bg-secondary-subtle">
                    <Modal.Title>Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRowData && (
                        <div>
                            <div><strong>Quantity Received:</strong> {selectedRowData.quantityReceived}</div>
                            <div><strong>Batch Number:</strong> {selectedRowData.batchnumber}</div>
                            <div><strong>Balance:</strong> {selectedRowData.balance}</div>
                            <div><strong>Expiry:</strong> {selectedRowData.expirydate ? new Date(selectedRowData.expirydate).toLocaleString() : ''}</div>
                            <div><strong>Received Date:</strong> {selectedRowData.receiveddate ? new Date(selectedRowData.receiveddate).toLocaleString() : ''}</div>
                            <div><strong>Status:</strong> {selectedRowData.status}</div>
                            <div><strong>Price:</strong> {selectedRowData.price}</div>
                            <div><strong>Product Used:</strong> {selectedRowData.productused}</div>
                            <div><strong>Pricing:</strong> {selectedRowData.pricing}</div>
                            <div><strong>Brand:</strong> {selectedRowData.brand}</div>
                            <div><strong>Expired Disposed:</strong> {selectedRowData.expiredDisposed}</div>
                            <div><strong>Disposal Date:</strong> {selectedRowData.disposaldate ? new Date(selectedRowData.disposaldate).toLocaleString() : ''}</div>
                            <div><strong>Requested By:</strong> {selectedRowData.requestedby}</div>
                            <div><strong>Received By:</strong> {selectedRowData.receivedby}</div>
                            <div><strong>Transaction Date:</strong> {selectedRowData.transactiondate ? new Date(selectedRowData.transactiondate).toLocaleString() : ''}</div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
