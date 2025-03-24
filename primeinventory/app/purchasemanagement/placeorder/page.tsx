"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { customFetch, customPost } from "../../../Lib/fetcher";
import PlaceStockOrder from "../../../components/Supplier/PlaceStockOrder";
import { useApplication } from "../../../components/application/ApplicationContextProvider";

export interface StockItemPlaceOrder {
    stockid: number;
    name: string;
    quantity: number;
    suppliername: string;
    supplierid?: number
    purchaseunit: string;
}



interface CartItem extends StockItemPlaceOrder {
    quantity: number;
    supplier: string;
}

export default function PlaceNewOrderIndexPage() {
    const [editing, setEditing] = useState<CartItem | null>(null);
    const [source, setDatasource] = useState<StockItemPlaceOrder[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const { employeeid } = useApplication();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Promise.all([customFetch("stock"), customFetch("suppliers")]);
                const [stocks, suppliers] = response;
                if (stocks.status === "success" && suppliers.status === "success") {
                    setDatasource(stocks?.result);
                    setSuppliers(suppliers?.result);
                } else {
                    setDatasource([]);
                    setSuppliers([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const cartHandler = async (e: React.FormEvent, clicked: CartItem) => {
        e.preventDefault();
        setEditing(null);

        const isAlreadyInCart = cart.some((item) => item.stockid === clicked.stockid);
        const isNotEmpty = clicked.quantity !== 0 && clicked.supplier !== "";

        if (isAlreadyInCart) {
            toast.error("Item already in cart");
            return;
        }

        if (!isNotEmpty) {
            toast.error("Please fill all fields");
            return;
        }

        if (clicked.quantity < 1) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        setCart((prevCart) => [...prevCart, clicked]);
    };


    const removeCartHandler = (e: React.FormEvent, stockid: number) => {
        e.preventDefault();
        const newCart = cart.filter((item) => item.stockid !== stockid);
        setCart(newCart);
    };

    const placeOrderHandler = (e: React.FormEvent) => {
        e.preventDefault();
        const cartdata = { stock: cart };
        const sendData = async () => {
            let data = await customPost("orders", "POST", { ...cartdata, employeeid });
            if (data.status === "success" && data.statusCode === 200 && data.clear === 0) {
                toast.success(data.message, { autoClose: 500 });
                setCart([]);
            } else {
                toast.error(data.message, { autoClose: 3000, position: "top-center" });
            }
        };
        sendData();
    };

    const handleEditField = (row: CartItem) => {
        setEditing(row);
        setCart((prevCart) => prevCart.filter((item) => item.stockid !== row.stockid));
    };

    return (
        <div>
            <ToastContainer theme="colored" className="text-sm" position="top-center" />
            <div className="p-1 ">
                <PlaceStockOrder
                    cart={cart}
                    supplierid={null}
                    source={source}
                    cartHandler={cartHandler}
                    editdata={editing}
                    suppliers={suppliers}
                />

                {cart.length > 0 && (
                    <div >
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Supplier</th>
                                    <th>Purchase Unit</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => (
                                    <tr key={item.stockid}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.suppliername}</td>
                                        <td>{item.purchaseunit}</td>
                                        <td>
                                            <button
                                                onClick={() => handleEditField(item)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => removeCartHandler(e, item.stockid)}
                                                className="btn btn-danger btn-sm mx-1"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={placeOrderHandler} className="btn btn-primary btn-sm mt-2">
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
