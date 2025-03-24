import React, { useState } from "react";
import { Toast, ToastContainer } from 'react-bootstrap';
import ErrorIcon from '@mui/icons-material/Error';

const StockQuantityAdder = ({ selectedStock, onAddStock }) => {
    const [quantity, setQuantity] = useState("");
    const [showToast, setShowToast] = useState(false);

    const handleQuantityChange = event => {
        setQuantity(event.target.value);
    };

    const handleAddStock = () => {
        if (quantity && selectedStock) {
            onAddStock(selectedStock, quantity, () => setShowToast(true));
            setQuantity("");
        }
    };

    return (
        <div>
            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide className="bg-danger-subtle">
                    <Toast.Header>
                        <ErrorIcon className="me-2" />
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Stock item is already in the table.</Toast.Body>
                </Toast>
            </ToastContainer>
            {selectedStock && (
                <div className="row gx-3 gy-2 align-items-center">
                    <div className="col-12 col-md-7">
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="form-control"
                            placeholder="Enter quantity"
                        />
                    </div>
                    <div className="col-12 col-md-5 d-flex justify-content-md-start btn-sm pls-color justify-content-end">
                        <button
                            onClick={handleAddStock}
                            className="btn btn-primary btn-sm text-sm  w-sm-100 w-md-auto"
                        >
                            Add Quantity
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockQuantityAdder;
