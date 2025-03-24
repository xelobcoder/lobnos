"use client"
import { useReducer, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    filterStocks,
    getWareHouseList,
    handleAssignWare,
    updatePagination,
} from "../../components/inventory/Util";
import ADD_STOCK_INVENTORY from "../../components/inventory/addstock";
import Loader from "../../components/accessories/Loader";
import TableDisplay from "../../components/accessories/TableDisplay";
import { Button, ButtonGroup } from "react-bootstrap";
import { customFetch, customPost } from "../../Lib/fetcher";
import AddStockCategory from "../../components/inventory/stocks/AddStocksCategory";
import { EditingStockItem, StockEditingState, WareHouseType } from "../../components/interfaces/departmentInterface";



interface Query {
    count: number;
    page: number;
}



interface PaginationProps {
    page: number;
    load: React.Dispatch<React.SetStateAction<boolean>>;
    updateFunction: React.Dispatch<React.SetStateAction<Query>>;
}

export default function InventoryPage() {
    const [editing, setEditing] = useState<StockEditingState>({ edit: false, stockId: null, data: null });
    const [stocks, setStocks] = useState<EditingStockItem[]>([]);
    const [query, dispatchQuery] = useReducer(updatePagination, { count: 10, page: 1 });
    const [loading, setLoading] = useState<boolean>(true);
    const [warehouseList, setWarehouseList] = useState<WareHouseType[]>([]);
    const [isPaginating, setIsPaginating] = useState<boolean>(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        loadStocks();
    }, [selectedWarehouse, isPaginating, query]);

    useEffect(() => {
        getWareHouseList(setWarehouseList);
    }, []);

    const loadStocks = async () => {
        setLoading(true);
        const { count, page } = isPaginating ? query : { count: 10, page: 1 };
        try {
            const data = await customFetch(
                `stock?warehouseid=${selectedWarehouse}&count=${count}&page=${page}`
            );
            if (data.statusCode === 200 && data.status === "success") {
                setStocks(data.result);
            }
        } catch (error) {
            console.error("Failed to load stocks:", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing({ edit: false, stockId: null, data: null });
    };

    const closeCategoryModal = () => setShowCategoryModal(false);

    const openAddStockModal = () => setShowModal(true);

    const handleDelete = async (id: number) => {
        if (!id) return;
        try {
            const data = await customPost("stock", "DELETE", { stockid: id });
            if (data.status === "success" && data.statusCode === 200) {
                setStocks((prevStocks) => prevStocks.filter((item) => item.stockid !== id));
            }
        } catch (error) {
            console.error("Failed to delete stock:", error);
        }
    };

    const handleEditStock = (id: number, data: EditingStockItem) => {
        if (!id) return;
        setEditing({ edit: true, stockId: id, data });
        setShowModal(true);
    };


    const columns = [
        { Header: "Name", accessor: "name" },
        { Header: "Category", accessor: "categoryname" },
        { Header: "Purchase Unit", accessor: "purchaseunit" },
        { Header: "Consumption Unit", accessor: "consumptionunit" },
        { Header: "Qty Available", accessor: "quantity" },
        {
            Header: "Alert Level",
            accessor: "alertlevel",
            Cell: ({ row, value }: { row: any; value: number }) => {
                const className =
                    value < row.original.quantity
                        ? "text-danger border-bottom border-2 border-danger"
                        : value === row.original.quantity
                            ? "text-warning border-bottom border-2 border-warning"
                            : "";
                return <span className={className}>{value}</span>;
            },
        },
        {
            Header: "Action",
            Cell: ({ row }: { row: any }) => {
                const { stockid } = row.original;
                return (
                    <ButtonGroup>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="br-0"
                            onClick={() => handleDelete(stockid)}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="br-0"
                            onClick={() => handleEditStock(stockid, row.original)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
                            className="br-0"
                            onClick={() => handleAssignWare(row.original, router)}
                        >
                            Add brands
                        </Button>
                    </ButtonGroup>
                );
            },
        },
    ];


    const handleSeverSideProcessing = async (count: number, page: number): Promise<{ result: any[] } | { error: string }> => {
        try {
            const data = await customFetch(
                `stock?warehouseid=${selectedWarehouse}&count=${count}&page=${page}`
            );
            return { result: data.result }
        } catch (err) {
            return { error: 'something wrong occured loading page data' }
        }
    }

    const renderContent = () => {
        if (loading) return <Loader />;
        return (
            <section>
                <TableDisplay
                    filtering={true}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleSeverSideProcessing } column={columns}
                    data={stocks}
                />
                {showModal && (
                    <ADD_STOCK_INVENTORY
                        warehouseList={warehouseList}
                        editing={editing}
                        show={showModal}
                        closeModal={closeModal}
                    />
                )}
                {showCategoryModal && (
                    <AddStockCategory show={showCategoryModal} onHide={closeCategoryModal} />
                )}
            </section>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between">
                <div className="d-flex col-4">
                    <input
                        onChange={(ev) =>
                            filterStocks(ev.target.value, selectedWarehouse, query, setStocks)
                        }
                        className="custom-input"
                        type="text"
                        placeholder="Filter stock here"
                    />
                </div>
                <div className="d-flex justify-content-end">
                    <select
                        className="custom-select col-3 mx-2"
                        onChange={(ev) => setSelectedWarehouse(ev.target.value)}
                    >
                        <option>Select a warehouse</option>
                        <option value="all">All warehouses</option>
                        {warehouseList.map((item, index) => (
                            <option value={item.id} key={index}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={() => setShowCategoryModal(true)} className="btn btn-primary btn-sm mx-2">
                        New stock category
                    </button>
                    <button onClick={openAddStockModal} className="btn btn-primary btn-sm">
                        New stock
                    </button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
}
