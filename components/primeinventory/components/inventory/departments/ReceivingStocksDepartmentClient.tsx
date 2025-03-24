"use client";

import React, { useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import { customPost } from "../../../Lib/fetcher";
import { useApplication } from "../../application/ApplicationContextProvider";
interface StockItem {
    id: number;
    date: string;
    name: string;
    comsumptionunit: string;
    quantity_requested: number;
    quantity_approved: number | null;
    quantityReceived: number;
    brand: string;
    batchnumber: string;
    status: string;
}


interface InventoryClass {
    handleReceiveField: (
        e: React.ChangeEvent<HTMLInputElement>,
        id: number,
        stocks: StockItem[]
    ) => void;
    handleReceivedButton: (
        e: React.MouseEvent<HTMLButtonElement>,
        id: number,
        departmentId: number,
        setBtnDisabled: React.Dispatch<React.SetStateAction<number | null>>
    ) => void;
}

interface Props {
    stocks: StockItem[];
    departmentId: number;
}

const ReceivingStocksDepartmentClient: React.FC<Props> = ({
    stocks,
    departmentId,
}) => {
    const [btndisabled, setBtnDisabled] = useState<number | null>(null);
    const [stocksData, setStocksData] = useState<StockItem[]>(stocks);
    const employeeid = useApplication().employeeid

    const handleReceiveField = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: number
    ) => {
        const { value } = e.target;
        setStocksData((prevStocks) =>
            prevStocks.map((item: StockItem) =>
                item.id === id
                    ? {
                        ...item,
                        quantityReceived: parseInt(value, 10),
                    }
                    : item
            )
        );
    };

    const handleReceivedButton = async (
        e: React.MouseEvent<HTMLButtonElement>,
        id: number
    ) => {
        const filtered = stocksData.find((item) => item.id === id);

        if (!filtered) return;

        const requested = filtered.quantity_requested;
        const approved = filtered.quantity_approved || 0;
        const supplied = filtered.quantityReceived;

        if (supplied !== approved) {
            alert(
                "Enter exactly the approved quantity. If there's a mismatch, please report it."
            );
            return;
        }

        const transformedData = {
            id,
            quantityReceived: supplied,
            departmentReceived: 1,
            status: "received",
            stockid: filtered.id,
            departmentid: departmentId,
            consumptionunit: filtered.comsumptionunit,
            employeeid,
        };

        setBtnDisabled(id);

        try {
            const data = await customPost("departments/requisitions", "PUT", transformedData);
            if (data.status === "success") {
                alert(data.message);
                setStocksData((prevStocks) =>
                    prevStocks.filter((item) => item.id !== id)
                );
            } else {
                alert(data.message);
                setBtnDisabled(null);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            setBtnDisabled(null);
        }
    };

    const columns = [
        {
            Header: "Date Requested",
            accessor: "date",
            Cell: ({ row }: { row: { original: StockItem } }) => (
                <div>{new Date(row.original.date).toLocaleDateString()}</div>
            ),
        },
        { Header: "Name", accessor: "name" },
        { Header: "Unit", accessor: "comsumptionunit" },
        { Header: "Qty Requested", accessor: "quantity_requested" },
        { Header: "Brand", accessor: "brand" },
        { Header: "Lot Number", accessor: "batchnumber" },
        {
            Header: "Status",
            accessor: "status",
            Cell: () => (
                <div>
                    <ProgressBar
                        variant="success"
                        title="Almost done. 90% through"
                        now={90}
                    />
                </div>
            ),
        },
        {
            Header: "Qty Approved",
            accessor: "quantity_approved",
            Cell: ({ row }: { row: { original: StockItem } }) => (
                <>{row.original.quantity_approved ?? <div className="-lims-text-color">Not yet</div>}</>
            ),
        },
        {
            Header: "Supplied Qty",
            accessor: "quantityReceived",
            Cell: ({ row }: { row: { original: StockItem } }) => (
                <>
                    {row.original.status === "approved" && (
                        <input
                            type="number"
                            className="custom-input"
                            value={row.original.quantityReceived || ""}
                            onChange={(e) => handleReceiveField(e, row.original.id)}
                            placeholder="Enter quantity supplied"
                        />
                    )}
                </>
            ),
        },
        {
            Header: "Action",
            accessor: "action",
            Cell: ({ row }: { row: { original: StockItem } }) => (
                <>
                    {row.original.status === "received" ? null : row.original.quantity_approved == null ? (
                        <Button variant="danger" size="sm">
                            Delete
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            size="sm"
                            disabled={btndisabled === row.original.id}
                            onClick={(e) => handleReceivedButton(e, row.original.id)}
                        >
                            Received
                        </Button>
                    )}
                </>
            ),
        },
    ];


    if (stocksData.length === 0) return <div className="p-3 heightedBorder bg-secondary-subtle">No Stocks to be received</div>

    return (
        <div>
            <table className="table ttable pls-color">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.Header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {stocksData.map((stock) => (
                        <tr key={stock.id}>
                            {columns.map((col, index) => (
                                <td key={index}>
                                    {col.Cell ? col.Cell({ row: { original: stock } }) : stock[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReceivingStocksDepartmentClient;
