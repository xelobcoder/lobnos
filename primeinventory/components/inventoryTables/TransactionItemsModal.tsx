import { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import { ICellRendererParams, ColDef } from "ag-grid-community";
import { customFetch, customPost } from "../../Lib/fetcher";
import { myTheme } from "../Supplier/AgGridTheme";
import Loader from "../accessories/Loader";

interface Order {
    productordersid: number;
    name: string;
    suppliername: string;
    purchaseunit: string;
    date: string;
    quantity: number;
    orderTransactionid: number;
}

interface TransactionItemsModalProps {
    showModal: boolean;
    handleClose: () => void;
    order: Order;
}

export default function TransactionItemsModal({
    showModal,
    handleClose,
    order,
}: TransactionItemsModalProps) {
    const [ordersPlacedList, setOrdersPlacedList] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrderItems = async () => {
            setLoading(true);
            if (order) {
                try {
                    const response = await customFetch(
                        `orders?orderTransactionid=${order.orderTransactionid}&&includebrands=true&&status=pending&&isUpdate=false`
                    );
                    const { result } = response || {};
                    if (result) {
                      
                        setOrdersPlacedList(result || []);
                    } else {
                        setOrdersPlacedList([]);
                    }
                } catch (err) {
                    console.error("Error fetching order items:", err);
                    setOrdersPlacedList([]);
                }
            }
            setLoading(false);
        };

        fetchOrderItems();
    }, [order]);

    const cancelOrder = async (stockId: number) => {
        setLoading(true);
        try {
            const response = await customPost("orders", "DELETE", { productordersid: stockId });
            const { status, err } = response;
            if (status === "success") {
                setOrdersPlacedList((prevList) =>
                    prevList.filter((item) => item.productordersid !== stockId)
                );
            } else if (err || status === "error") {
                alert(err?.message || "Failed to cancel the order");
            }
        } catch (error) {
            console.error("Error canceling order:", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBulkOrders = async () => {
        const selectedIds = selectedRows.map((row) => row.productordersid);
        if (selectedIds.length === 0) return;
        setLoading(true);
        try {
            const response = await customPost("orders", "DELETE", { productordersid: selectedIds });
            const { status, err } = response;
            if (status === "success") {
                setOrdersPlacedList((prevList) =>
                    prevList.filter((item) => !selectedIds.includes(item.productordersid))
                );
                setSelectedRows([]);
            } else if (err || status === "error") {
                alert(err?.message || "Failed to cancel the selected orders");
            }
        } catch (error) {
            console.error("Error canceling bulk orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColDef<Order>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50,
        },
        {
            headerName: "Product Name",
            field: "name",
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
            headerName: "Order Date",
            field: "date",
            valueFormatter: (params: any) => params.value.slice(0, 10),
        },
        {
            headerName: "Quantity Ordered",
            field: "quantity",
        },
        {
            headerName: "Actions",
            cellRenderer: (params: ICellRendererParams) => (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelOrder(params.data.productordersid)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            ),
            width: 120,
        },
    ];

    const onSelectionChanged = (event: any) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map((node: any) => node.data));
    };



    const Rendering = ({ isLoading }) => {
        if (isLoading) return <Loader />
        return (<div>
            <h4 className="bg-secondary-subtle p-2 text-sm pls-color" style={{ borderRadius: '10px' }}> Ordered Inventory Items</h4>
            <button className="btn btn-danger btn-sm">bulk cancel</button>
            <AgGridReact
                columnDefs={columns}
                rowData={ordersPlacedList}
                rowSelection="multiple"
                theme={myTheme}
                onSelectionChanged={onSelectionChanged}
                domLayout="autoHeight"
            />
        </div>)
    }

    return (
        <Modal show={showModal} onHide={handleClose} size="lg">
            <Modal.Header className="bg-secondary-subtle" closeButton>
                <Modal.Title>Purchases for Order {order.orderTransactionid}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Rendering isLoading={loading} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
