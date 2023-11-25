import { Delete } from "@mui/icons-material";
import React, { useState } from "react";
import { customPost } from "../Auth/customFetch";
import { Button } from "@mui/material";
import Inventory from "../Auth/inventory";

export default function ReceivedOrderModal({ clearData, data, handleChange, totalprice, setupdata, setTotal, changePricing }) {
  // states for managing how is pricing should be calculated either using absolute or unit price
  const [pricing, setPricing] = useState('unit');
  const [taxIncurred, setTaxIncurred] = useState({ method: 'absolute', amount: 0 });
  const inventory = new Inventory(pricing, taxIncurred.method);
  const addToStock = async function () {
    // ensure data is valid
    // send a request to the server to add the order to the stock
    const checkForEmptyFields = function () {
      let empty = false;
      data.map((item) => {
        const { quantityReceived, price, brand, batchnumber, expirydate, receiveddate } = item;

        const requiredx = [quantityReceived, price, brand, batchnumber, expirydate, receiveddate];

        if (requiredx.includes(0) || requiredx.includes(' ') || requiredx.includes(null)) {
          empty = true;
        }
      });
      return empty;
    };





    if (checkForEmptyFields()) {
      alert("please fill all fields");
      return;
    } else {
      // remodify data to include  status
      let tt = [...data];
      tt.map((item) => {
        item["status"] = item.balance == 0 ? "received" : "incomplete";
        item["received"] = item.quantityReceived > 0 ? "TRUE" : "FALSE";
      });

      try {
        const data = await customPost('purchases', 'POST', { data: tt, tax: taxIncurred, totalprice })
        const { statusCode, status, message } = data;
        if (statusCode === 200 && status === 'success') {
          alert(message);
          clearData();
        } else {
          if (data["status"] === "error") {
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };



  return (
    <div className="mx-3 my-3 card">
      <div className="card-header" >
        <div className="d-flex" style={{ display: 'grid', gridTemplateColumns: '50% auto' }}>
          <div className="form-row d-flex">
              <label>change pricing</label>
            <select className="custom-select" onChange={(ev) => {
                setPricing(ev.target.value);
            }} >
                <option>select pricing</option>
                <option value='absolute'>absolute</option>
                <option value='unit'>unit price</option>
              </select>
            </div>
          <div className="form-row d-flex">
              <label>tax calculated in</label>
            <select className="custom-select" onChange={(ev) => {
                setTaxIncurred(ev.target.value);
              }} style={{ width: '200px', height: '25px' }}>
                <option>select pricing</option>
                <option value='absolute'>absolute</option>
                <option value='percentage'>percentage (%)</option>
              </select>
            </div>
          </div>
      </div>
      <div className="card-body">
        <table className="billing-cart-table">
          <thead>
                  <tr>
                    <th>name</th>
                    <th>unit</th>
                    <th>purchase qty</th>
                    <th>balance qty</th>
                    <th>received qty</th>
                    <th>price</th>
                    <th>received date</th>
                    <th>expiry date</th>
              <th>brand</th>
                    <th>lot</th>
                    <th>total</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ width: "100%" }}>
                        <Delete color="primary" fontSize="large"></Delete>
                        <h4>No data found</h4>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.purchaseunit}</td>
                          <td>{item.quantity}</td>
                          <td>
                            <input
                              type="number"
                              className="custom-input"
                              value={item.balance}
                              disabled
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={item.quantityReceived}
                              className="custom-input"
                              onChange={(e) => {
                                handleChange(e, "quantityReceived", index);
                                inventory.calculatePlaceOrderReceivedBalance(data, index, setupdata)
                              }
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="custom-input"
                              step={0.5}
                              disabled={item.quantityReceived == 0 || item.quantityReceived == 'null'}
                              onChange={(e) => {
                                handleChange(e, "price", index); inventory.calculateOrderTotal(setupdata, data, index);
                                inventory.placeOrderSum(setTotal, data)
                              }}
                              value={parseFloat(item.price)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              onChange={(e) =>
                                handleChange(e, "receiveddate", index)
                              }
                              value={item.receiveddate}
                              className="custom-input"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={item.expirydate}
                              onChange={(e) =>
                                handleChange(e, "expirydate", index)
                              }
                              className="custom-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.brand}
                              onChange={(e) =>
                                handleChange(e, "brand", index)
                              }
                              className="custom-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.batchnumber}
                              onChange={(e) =>
                                handleChange(e, "batchnumber", index)
                              }
                              className="custom-input"
                            />
                          </td>

                          <td>{item.totalamount}</td>
                          <td>
                            <button
                              className={
                                `btn-sm ${item.balance == 0
                                  ? "btn btn-primary"
                                  : "btn btn-warning"}`
                              }
                              type="button"
                            >
                              {item.balance == 0 ? "complete" : "incomplete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
        </table>
      </div>
      <div className="my-3 mx-3">
          <div className="form-row">
            <label>Cost incurred from tax <span style={{ fontSize: '13px' }} className="text-danger">(absolute figures required)</span></label>
            <input
              onBlur={(ev) => {
                setTaxIncurred({ ...taxIncurred, amount: parseFloat(ev.target.value) });
                inventory.totalwithTaxAdded({ setdata: setTotal, total: totalprice, amount: parseFloat(ev.target.value), datasource: data }
                )
              }} style={{ width: '200px' }} className="form-control" type="number" />
          </div>
        </div>
      <div className="my-2 mx-3">
          <h5>Total Amount Payable: </h5>
          <h5>GHC {totalprice}</h5>
        </div>
      <div className="d-flex justify-content-end mb-2">
        <button className="btn btn-primary btn-sm mx-2"  >
            Close
        </button>
        <button className="btn btn-primary btn-sm mx-2" sx={{ marginLeft: '20px' }} variant="contained" color="success" onClick={addToStock}>
            Add to stock
        </button>
        </div>
    </div>
  );
}
