import React from "react";
import TableDisplay from "../../components/accessories/TableDisplay";
import Header from "../../components/header";
import InventoryHeaders from "../../components/Headers/inventoryHeaders";
import PLACE_ORDER from "../../components/inventory/placeorder";
import { useTable } from "react-table";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import DepartmentStockLevel from "../../components/inventory/departmentStockLevel";
import { useRouter } from "next/router";
import TopMessage from '../../components/accessories/TopMessage';
import { customFetch } from "../../components/Auth/customFetch";

export default function DepartmentRequisition({ departments = [], stocks = [] }) {
  const [department, setDepartments] = React.useState(departments || []);
  const [stock, setStocks] = React.useState(stocks || []);
  const [selectedDept, setSelectedDept] = React.useState("");
  // with a click, makes depart select box, stock table toggle
  const [eventKey, setEventKey] = React.useState("1");
  const [departmentStocksLevel, setDepartmentStocksLevel] = React.useState([]);
  // message display state
  const [message, setMessage] = React.useState({ message: '', type: '', display: false });
  // router
  const router = useRouter();


  const STOCKS_URL = 'http://localhost:5000/api/v1/departments/stocks';
  const REQUISITIONS_URL = 'http://localhost:5000/api/v1/departments/requisitions';




  // fill the departmentStocksLevl once the selectedDept changes
  React.useMemo(() => {
    const getdata = async () => {
      const data = await customFetch(`departments/stocks?id=${selectedDept}`)
      console.log(data.data);
      data?.status == 'success' && setDepartmentStocksLevel(data.result);
    }
    getdata();
  }, [selectedDept])

  const handleSearch = (e) => {
    const { value } = e.target;
    const filtered = stocks.filter((stock) => {
      return (
        stock.name.toLowerCase().includes(value.toLowerCase()) ||
        stock.category.toLowerCase().includes(value.toLowerCase())
      )
    });
    if (value.length > 0) {
      setStocks(filtered);
    } else {
      setStocks(stocks);
    }
  };

  const handleRequiredQty = (e, stockid) => {
    const qty = e.target.value;
    // filter the stock using the stockid
    const filtered = stock.filter((stock) => {
      return stock.stockid === stockid;
    });

    const index = stock.indexOf(filtered[0]);

    // update the quantity required
    stock[index].quantityrequired = qty;

    // update the state
    setStocks([...stock]);
  };

  const handleOrders = (e, id) => {
    // filter the stock using the stockid
    const filtered = stock.filter((stock) => {
      return stock.stockid === id;
    });

    // transform the data
    const transformedData = {
      stockid: filtered[0].stockid,
      departmentid: parseInt(selectedDept),
      quantity: parseInt(filtered[0].quantityrequired),
      comsumptionunit: filtered[0].consumptionunit,
      requisitionid: Date.now(),
    };

    // do trasnformedData have empty values
    let emtypValues = Object.values(transformedData).filter((value) => {
      return value === "";
    });

    if (emtypValues.length > 0 || transformedData.quantity === 0) {
      alert("Please fill in required quantity");
      return;
    } else {
      // send the data to the server'
      const sendDataAsync = fetch(
        `${REQUISITIONS_URL}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
          },
          body: JSON.stringify(transformedData),
        }
      );

      sendDataAsync
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (
            data.status === "success" &&
            data.message === "Department requisition added successfully"
          ) {
            alert(data.message);
            // remove the item from the stock
            const index = stock.indexOf(filtered[0]);
            stock.splice(index, 1);
            setStocks(prevStocks => [...prevStocks])
          }

          if (
            data.status === "success" &&
            data.message === "Stock has already been requisitioned"
          ) {
            alert(data.message);
          }

          if (data.status === "error") {
            alert(data.message);
          }
        })
        .catch((err) => {
          alert(err?.message);
        });
    }
  };

  const deleteStock = async function (e, id) {
    // delete the stock from the database
    const confirm = window.confirm("Are you sure you want to delete this stock");

    if (confirm) {
      const deleteStockAsync = await fetch(`${process.env.BASEURL}/departments/stocks?id=${id}`,
        {
          method: "DELETE",
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
          }
        }
      );

      let data = await deleteStockAsync.json();
      if (data.status === "success") {
        // delete the stock from the state
        const filtered = stock.filter((stock) => {
          return stock?.stockid !== id;
        });

        setMessage({ message: data.message, type: 'success', display: true })

        setDepartmentStocksLevel([...filtered])
      }
    }
    return

  };

  const messageTimer = () => {
    setTimeout(() => {
      setMessage({ message: '', type: '', display: false })
    }, 3000)
  }

  return (
    <>
      {message.display && <TopMessage message={message.message} type={message.type} messageTimer={messageTimer} />}
      <div
        className="p-2 lims-text-color"
        style={{
          display: "grid",
          gridTemplateColumns: "40% 35% auto",
          gridGap: "10px",
        }}
      >
        {/* <header className='mt-1'> */}
        {eventKey == 1 && (
          <>
            <h4 className="font-bold">Department Requisition</h4>
            <select
              className="custom-input"
              onChange={(e) => setSelectedDept(e.target.value)}
              value={selectedDept}
            >
              <option>select a department</option>
              {department.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department}
                </option>
              ))}
            </select>
          </>
        )}
        <div>
          <button className="custom-button" onClick={(e) => setEventKey(2)}>
            stocks level
          </button>
          <button className="custom-button"
            onClick={(e) => {
              if (selectedDept === '') {
                alert('Please select a department')
                return
              }
              else {
                router.push(`/inventory/requisition?dept=${selectedDept}`)
              }
            }}
          >requested</button>
          {eventKey != 1 && (
            <button className="custom-button" onClick={(e) => setEventKey(1)}>
              place order
            </button>
          )}
        </div>
      </div>
      {eventKey == 1 && (
        <div>
          {selectedDept.length > 0 ? (
            <>
              <div className="d-flex justify-content-left mt-4">
                <div className="col-6">
                  <input
                    type="text"
                    onChange={(e) => handleSearch(e)}
                    className="custom-input"
                    placeholder="search"
                  />
                </div>
              </div>
              <div>
                <table id="custom-table" className="p-2">
                  <thead>
                    <tr>
                      <th>Stock ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Purchase Unit</th>
                      <th>Consumption Unit</th>
                      <th>Quantity Required</th>
                      <th>Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((stock) => (
                      <tr key={stock.stockid}>
                        <td>{stock.stockid}</td>
                        <td>{stock.name}</td>
                        <td>{stock.category}</td>
                        <td>{stock.purchaseunit}</td>
                        <td>{stock.consumptionunit}</td>
                        <td>
                          <input
                            type="number"
                            value={stock.quantityrequired}
                            onChange={(e) =>
                              handleRequiredQty(e, stock.stockid)
                            }
                            className="custom-input"
                          />
                        </td>
                        <td>
                          <button
                            onClick={(e) => handleOrders(e, stock.stockid)}
                            className="btn btn-warning"
                          >
                            Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <SECOND_NO_DATA message={"No department selected"} />
          )}
        </div>
      )}

      {eventKey == 2 && (
        <>
          <DepartmentStockLevel datasource={departmentStocksLevel} deleteStock={deleteStock} />
        </>
      )}
    </>
  );
}

DepartmentRequisition.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders />
        </div>
        <div className="main" id="page-main-view">
          {page}
        </div>
      </div>
    </>
  );
};

// usring server side rendering

export async function getServerSideProps(context) {
  // using promise all to fetch all the data at once
  const departments = await customFetch('departments')
  const stocks = await customFetch('stock');
  const data = await Promise.all([departments, stocks]);

  try {
    return {
      props: {
        departments: data[0].data,
        stocks: data[1].result.map((stock) => {
          return {
            ...stock,
            quantityrequired: 0,
          };
        }),
      },
    };
  }
  catch (err) {
    return {
      props: {
        departments: [],
        stocks: []
      }
    }
  }
}
