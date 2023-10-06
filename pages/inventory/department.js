import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@mui/material";
import TableDisplay from "../../components/accessories/TableDisplay";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import DepartmentStockLevel from "../../components/inventory/departmentStockLevel";
import TopMessage from "../../components/accessories/TopMessage";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import InventoryLayout from "../../components/inventory/InventoryLayout";

const REQUISITIONS_URL = "departments/requisitions";

const DepartmentRequisition = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [eventKey, setEventKey] = useState("1");
  const [departmentStocksLevel, setDepartmentStocksLevel] = useState([]);
  const [message, setMessage] = useState({ message: "", type: "", display: false });


  useEffect(() => {
    fetchDepartmentStocksLevel();
  }, [selectedDept]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchDepartmentStocksLevel = async () => {
    const data = await customFetch(`departments/stocks?id=${selectedDept}`);
    if (data?.status === "success") {
      console.log(data.result);
      setDepartmentStocksLevel(data.result);
    }
  };

  const fetchInitialData = async () => {
    try {
      const departmentsData = await customFetch("departments");
      const stocksData = await customFetch("stock");
      const departments = departmentsData?.data || [];
      const stocks = stocksData?.result?.map((item) => ({ ...item, quantityrequired: 0 })) || [];
      setDepartments(departments);
      setStocks(stocks);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRequiredQty = (e, stockid) => {
    const qty = e.target.value;
    const updatedStocks = stocks.map((stock) =>
      stock.stockid === stockid ? { ...stock, quantityrequired: parseInt(qty) } : stock
    );
    setStocks(updatedStocks);
  };

  const handleOrders = async (e, id) => {
    const filteredStock = stocks.find((stock) => stock.stockid === id);
    const transformedData = {
      stockid: filteredStock.stockid,
      departmentid: parseInt(selectedDept),
      quantity: parseInt(filteredStock.quantityrequired),
      comsumptionunit: filteredStock.consumptionunit,
      requisitionid: Date.now(),
    };

    const emptyValues = Object.values(transformedData).filter(
      (value) => value === ""
    );
    if (emptyValues.length > 0 || transformedData.quantity === 0) {
      setMessage({
        message: "Please fill in the required quantity.",
        type: "error",
        display: true,
      });
      return;
    }

    try {
      const sendDataAsync = await customPost(
        `${REQUISITIONS_URL}`,
        "POST",
        transformedData
      );
      const { status, statusCode, message } = sendDataAsync;
      if (
        status === "success" &&
        statusCode === 200 &&
        message === "Department requisition added successfully"
      ) {
        alert(message);
        const updatedStocks = stocks.filter((stock) => stock.stockid !== id);
        setStocks(updatedStocks);
      } else {
        alert(message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteStock = async (e, id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stock?");
    if (confirmDelete) {
      try {
        const deleteStockAsync = await customPost(`departments/stocks?id=${id}`, "DELETE", {});
        const { status, message } = deleteStockAsync;
        if (status === "success") {
          const updatedStocks = stocks.filter((stock) => stock.stockid !== id);
          setMessage({ message, type: "success", display: true });
          setDepartmentStocksLevel(updatedStocks);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const messageTimer = () => {
    setTimeout(() => {
      setMessage({ message: "", type: "", display: false });
    }, 3000);
  };

  const handleEventKeyChange = (key) => {
    setEventKey(key);
  };

  const DepartmentRequisitionForm = () => (
    <>
      <h4 className="font-bold">Department Requisition</h4>
      <select className="custom-input" onChange={(e) => setSelectedDept(e.target.value)} value={selectedDept}>
        <option>select a department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.department}
          </option>
        ))}
      </select>
    </>
  );

  const PlaceOrderButton = () => (
    <button className="custom-button" onClick={() => handleEventKeyChange("1")}>
      place order
    </button>
  );

  const columns = [
    { Header: "stockid", accessor: "stockid" },
    { Header: "name", accessor: "name" },
    { Header: "category", accessor: "category" },
    { Header: "consumption unit", accessor: "consumptionunit" },
    { Header: "store qty", accessor: "quantity" },
    {
      Header: "qty required",
      accessor: "quantityrequired",
      Cell: ({ row }) => {
        const { original } = row;
        return (
          <input
            type="number"
            value={original?.quantityrequired}
            onChange={(e) => handleRequiredQty(e, original.stockid)}
            className="custom-input"
          />
        );
      },
    },
    {
      Header: "action",
      accessor: "",
      Cell: ({ row }) => {
        const { original } = row;
        return (
          <Button onClick={(e) => handleOrders(e, original.stockid)} size="small" variant="contained">
            Order
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <InventoryLayout>
        <div style={{ backgroundColor: "#00224f17", height: "100vh" }}>
          {message.display && <TopMessage message={message.message} type={message.type} messageTimer={messageTimer} />}
          <div
            className="p-2 lims-text-color"
            style={{
              display: "grid",
              gridTemplateColumns: "40% 35% auto",
              gridGap: "10px",
            }}
          >
            {eventKey === "1" && <DepartmentRequisitionForm />}
            <div>
              <button className="custom-button" onClick={() => handleEventKeyChange("2")}>
                stocks level
              </button>
              <button
                className="custom-button"
                onClick={() => {
                  if (selectedDept === "") {
                    setMessage({ message: "Please select a department", type: "error", display: true });
                  } else {
                    router.push(`/inventory/requisition?dept=${selectedDept}`);
                  }
                }}
              >
                requested
              </button>
              {eventKey !== "1" && <PlaceOrderButton />}
            </div>
          </div>
          {eventKey === "1" && (
            <div>
              {selectedDept.length > 0 ? (
                <TableDisplay column={columns} data={stocks} filtering={true} />
              ) : (
                <SECOND_NO_DATA message={"No department selected"} />
              )}
            </div>
          )}
          {eventKey === "2" && <DepartmentStockLevel datasource={departmentStocksLevel} deleteStock={deleteStock} />}
        </div>
      </InventoryLayout>
    </>
  );
};

export default DepartmentRequisition;
