import React, { useEffect, useState } from "react";
import Select from "react-select";
import { customFetch } from "../../Auth/customFetch";
import TableDisplay from "../../accessories/TableDisplay";
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import ErrorIcon from '@mui/icons-material/Error';

export default function InventoryStockFiltering({ selectedWarehouse = 'all', count = 50, page = 1 }) {
    const [stockOptions, setStockOptions] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [isLoading, setLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showToast, setShowToast] = useState(false);

    const fetchStockData = async (searchTerm = "") => {
        setLoading(true);
        try {
            const data = await customFetch(`stock?warehouseid=${selectedWarehouse}&count=${count}&page=${page}&search=${searchTerm}`);
            setStockOptions(data.result.map(item => ({
                value: item.stockid,
                label: item.name,
                ...item
            })));
        } catch (err) {
            console.error("Error fetching stock data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchStockData(searchTerm);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, selectedWarehouse, count, page]);

    const handleStockChange = selected => {
        setSelectedStock(selected);
        setQuantity("");
    };

    const handleQuantityChange = event => {
        setQuantity(event.target.value);
    };

    const handleAddStock = () => {
        if (quantity && selectedStock) {
            const existingStock = tableData.find(stock => stock.value === selectedStock.value);
            if (!existingStock) {
                const newStock = {
                    ...selectedStock,
                    quantity: parseInt(quantity, 10),
                };
                setTableData(prev => [...prev, newStock]);
                setQuantity("");
                setSelectedStock(null);
            } else {
                setShowToast(true);
            }
        }
    };

    const handleEditStock = (index) => {
        const stockToEdit = tableData[index];
        setSelectedStock(stockToEdit);
        setQuantity(stockToEdit.quantity);
        setTableData(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteStock = (index) => {
        setTableData(prev => prev.filter((_, i) => i !== index));
    };

    const columns = React.useMemo(
        () => [
            { Header: "Stock Name", accessor: "label" },
            { Header: "Unit", accessor: "consumptionunit" },
            { Header: "Deduction Quantity", accessor: "quantity" },
            {
                Header: "Actions",
                accessor: "actions",
                Cell: ({ row: { index } }) => (
                    <>
                        <Button variant="primary" size="sm" onClick={() => handleEditStock(index)}>Edit</Button>{' '}
                        <Button variant="danger" size="sm" onClick={() => handleDeleteStock(index)}>Delete</Button>
                    </>
                )
            }
        ],
        []
    );

    return (
        <div className="my-3">
            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide className="bg-danger-subtle">
                    <Toast.Header>
                        <ErrorIcon className="me-2" />
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Stock item is already in the table.</Toast.Body>
                </Toast>
            </ToastContainer>
            <div className="row align-items-center">
                <div className="col-md-6">
                    <label htmlFor="stock-select" className="form-label">Select Stock Item</label>
                    <Select
                        id="stock-select"
                        options={stockOptions}
                        onInputChange={setSearchTerm}
                        className="pls-color"
                        onChange={handleStockChange}
                        placeholder="Search and select a stock item..."
                        isMulti={false}
                        isClearable
                        isLoading={isLoading}
                    />
                </div>
                <div className="col-md-4">
                    {selectedStock && (
                        <div>
                            <label htmlFor="quantity" className="form-label">Add Quantity</label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="form-control"
                                placeholder="Enter quantity"
                            />
                        </div>
                    )}
                </div>
                <div className="col-md-2">
                    {selectedStock && (
                        <button onClick={handleAddStock} className="btn btn-primary mt-4">
                            Add Quantity
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <TableDisplay styling={'ttable table'} showpage={false} column={columns} data={tableData} />
            </div>
        </div>
    );
}
