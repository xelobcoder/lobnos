import { Delete } from "@mui/icons-material";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { customPost } from "../Auth/customFetch";
export default function ReceivedOrderModal({
  receivedmodal,
  closeSignal,
  datasource,
}) {
  const [show, setShow] = useState(receivedmodal);
  const [data, setData] = useState(datasource);
  const [[received, setReceived]] = useState([]);
  const [totalprice, setTotalPrice] = useState(0);

  const handleClose = () => {
    setShow(false);
    closeSignal();
  };
  const handleShow = () => setShow(true);

  const handleChange = async function (e, name, index) {
    let value = e.target.value;
    let temp = [...data];
    temp[index][name] = value;
    if (name === "receivedquantity") {
      if (value > temp[index]["quantity"]) {
        temp[index]["receivedquantity"] = temp[index]["quantity"];
      }
      rerenderBalance(index);
    }

    if (name == "price") {
      rerendertotal(index);
    }
    setData(temp);
    rerenderBalance(index);
    calculateGrossAmount();
  };

  const rerenderBalance = async function (index) {
    let temp = [...data];
    temp[index]["balance"] =
      temp[index]["quantity"] - temp[index]["receivedquantity"];
    setData(temp);
  };

  const rerendertotal = async function (index) {
    let temp = [...data];
    temp[index]["totalamount"] =
      temp[index]["receivedquantity"] * temp[index]["price"];
    setData(temp);
  };

  const calculateGrossAmount = async function () {
    let total = 0;
    data.map((item) => {
      total += item["totalamount"];
    });
    setTotalPrice(total);
  };

  const addToStock = async function () {
    // ensure data is valid
    // send a request to the server to add the order to the stock
    const checkForEmptyFields = async function () {
      let empty = false;
      data.map((item) => {
        if (item["receivedquantity"] === 0 || item["price"] === 0) {
          empty = true;
        }
      });
      return empty;
    };

    if (await checkForEmptyFields()) {
      alert("please fill all fields");
      return;
    } else {
      // remodify data to include  status
      let tt = [...data];
      tt.map((item) => {
        item["status"] = item.balance == 0 ? "received" : "incomplete";
        item["received"] = item.receivedquantity > 0 ? "TRUE" : "FALSE";
      });

      try {
        //  send a request to the server to add the order to the stock
        const data = await customPost('purchases','POST',tt)
  
        if (data["status"] === "success") {
          alert("order received successfully");
          handleClose();
          window.location.reload();
        } else {
          if (data["status"] === "error") {
            // alert (data.err.sqlMessage);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div>
      <Modal fullscreen={true} show={show} onHide={handleClose}>
        <Modal.Header closeButton id="modal-header-color" className="mt-5">
          <Modal.Title className="received-modal-purchases">
            <h5>
              <header>supplier name</header>
              <span>{data[0]["suppliername"]}</span>
            </h5>
            <h5>
              <header>supplier id</header>
              <span>{data[0]["supplierid"]}</span>
            </h5>
            <h5>
              <header>order date</header>
              <span>{data[0]["date"].slice(0, 10)}</span>
            </h5>
            <h5>
              <header>cart</header>
              <span>{data.length}</span>
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="order-receivable-table">
            <form>
              <table>
                <thead>
                  <tr>
                    <th>inven. name</th>
                    <th>unit</th>
                    <th>purchase quantity</th>
                    <th>balance quantity</th>
                    <th>received quantity</th>
                    <th>price</th>
                    <th>received date</th>
                    <th>expiry date</th>
                    <th>batch number</th>
                    <th>total amount</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ width: "100%" }}>
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
                              value={item.receivedquantity}
                              className="custom-input"
                              onChange={(e) =>
                                handleChange(e, "receivedquantity", index)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="custom-input"
                              onChange={(e) => handleChange(e, "price", index)}
                              value={item.price}
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
                                item.balance == 0
                                  ? "btn btn-primary"
                                  : "btn btn-warning"
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
            </form>
          </div>

          <div id="gross-amount-modal">
            <h5>gross received item price: </h5>
            <h5>GHC {totalprice}</h5>
          </div>

          <div id="gross-amount-modal" className="mt-5">
            <div>
              <h5 style={{ fontSize: "15px" }}>upload invoice here </h5>
              <input className="form-control" type="file" accept=".pdf" />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" onClick={addToStock}>
            Add to stock
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
