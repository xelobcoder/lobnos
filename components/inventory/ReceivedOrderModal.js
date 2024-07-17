import { Add, Delete } from "@mui/icons-material"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { customPost } from "../Auth/customFetch";
import Inventory from "../Auth/inventory"
import RackCard from '../accessories/CardRacks';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import AuthContext from "../Auth/useAuthentification";

export default function ReceivedOrderTable({ clearData, data, handleChange, totalprice, setupdata, setTotal }) {
  // states for managing how is pricing should be calculated either using absolute or unit price
  const [pricing, setPricing] = useState("unit")
  const [taxIncurred, setTaxIncurred] = useState({ method: "absolute", amount: 0 })
  const [ready, setReady] = useState(true);
  const inventory = useMemo(() => new Inventory(pricing, taxIncurred.method, toast), [taxIncurred.method, pricing]);
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const employeeid = auth?.employeeid;


  const addToStock = async function () {
    // ensure data is valid
    // send a request to the server to add the order to the stock
    let empty = false
      let i = 0;
      for (i; i < data.length; i++) {
        const { quantityReceived, price, brandid, batchnumber, expirydate, receiveddate } = data[i];

        if (expirydate.length <= 0 || receiveddate.length <= 0 || batchnumber.length <= 0) {
          toast.error('batchnumber ,receiving and expiry date cannot be empty',{autoClose: 500})
          empty = true;
          break;
        }

        if (parseFloat(price) <= 0 || parseInt(quantityReceived) <= 0 ) {
          toast.error('price and quantity received should be more than 0', { autoClose: 500 });
          empty = true;
          break;
        }

        if (parseInt(brandid) <= 0 || brandid == '') {
          toast.error('brand not set');
          empty = true;
          break;
        }

        if (parseInt(taxIncurred) < 0 || typeof taxIncurred.amount != 'number') {
          empty = true;
          toast.error('Select a tax calculation method and enter a valid amount of 0 or more');
          break;
        }
    }
    if (empty) return;

      // remodify data to include  status
      let tt = [...data]
      tt.map((item) => {
        item["status"] = item.balance == 0 ? "received" : "incomplete"
        item["received"] = item.quantityReceived > 0 ? "TRUE" : "FALSE"
        item["brandid"] = parseInt(item?.brandid)
        delete item?.stockbrands;
      })

      try {
        const data = await customPost("purchases", "POST", { data: tt, tax: taxIncurred, totalprice, employeeid })
        const { statusCode, status, message } = data
        if (statusCode === 200 && status === "success") {
          toast.success(message, { autoClose: 1000 });
          clearData();
        } else {
          toast.error(message, { autoClose: 3000 });
        }
      } catch (err) {
        toast.error(err)
      }
  }

  /* this will fire any time the product pricing method changes and ensure 
   pricing and tax calculation method are setup before any items are received
  */
  const reCalcualtePricing = useCallback(() => {
    const { method } = taxIncurred;
    if (pricing.length === 0 || method.length === 0) {
      toast.warning('select a valid pricing and tax calculation method');
      setReady(false); return;
    };
    setReady(true);
  },[pricing,taxIncurred])
  
  useEffect(() => {
    reCalcualtePricing();
  }, [reCalcualtePricing])
  
  const reEvaluateTotal = useCallback(() => {
    const { amount, method } = taxIncurred;
    if (parseInt(amount) > 0 && method.length > 0) {
      inventory.totalwithTaxAdded({ setdata: setTotal, amount: parseFloat(amount), datasource: data, setTax: setTaxIncurred });
    }
  }, [data, taxIncurred, inventory, setTotal]);

  /* 
  this is to ensure the total value comprising of the sum of individual products total
  and tax incurred are recalculated anytime changes are made
  */
  useEffect(() => {
    reEvaluateTotal();
  }, [reEvaluateTotal])





  const navigateAddBrand = (item) => {
    const { name, stockid } = item;
    router.push(`/inventory/stocks/brands?stockname=${name}&&stockid=${stockid}`)
  }

  return (
    <div className="mx-2 my-2 ui">
      {/* <ToastContainer/> */}
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gridGap: "30%" }}>
        <div className="form-row">
          <select
            className="custom-select"
            required
            value={pricing}
            onChange={(ev) => {
              setPricing(ev.target.value)
            }}>
            <option value=''>select product pricing method</option>
            <option value="absolute">absolute</option>
            <option value="unit">unit price</option>
          </select>
        </div>
        <div className="form-row">
          <select
            className="custom-select"
            required
            value={taxIncurred.method}
            onChange={(ev) => {
              setTaxIncurred({ method: ev.target.value, amount: 0 })
            }}>
            <option value=''>select tax calculation method</option>
            <option value="absolute">absolute</option>
            <option value="percentage">percentage (%)</option>
          </select>
        </div>
      </div>
      <table className="ttable table">
        <thead>
          <tr>
            <th className="fw-bold">name</th>
            <th className="fw-bold">unit</th>
            <th className="fw-bold">purchase qty</th>
            <th className="fw-bold">balance qty</th>
            <th className="fw-bold">received qty</th>
            <th className="fw-bold">price</th>
            <th className="fw-bold">receiving date</th>
            <th className="fw-bold">expiry date</th>
            <th className="fw-bold">brand</th>
            <th className="fw-bold">lot</th>
            <th className="fw-bold">total</th>
            <th className="fw-bold">status</th>
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
                <tr key={index + 1} >
                  <td>{item.name}</td>
                  <td>{item.purchaseunit}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <input type="number" className="custom-input" value={item.balance} disabled />
                  </td>
                  <td>
                    <input type="number"
                    disabled={ready === true ? false : true}
                      value={item.quantityReceived} className="custom-input"
                      onChange={(e) => {
                        handleChange(e, "quantityReceived", index)
                        inventory.calculatePlaceOrderReceivedBalance(data, index, setupdata)
                      }}
                    />
                  </td>
                  <td>
                    <input type="number" className="custom-input" step={0.5}
                      disabled={item.quantityReceived == 0 }
                      onChange={(e) => {
                        handleChange(e, "price", index)
                        inventory.calculateOrderTotal(setupdata, data, index);
                        setTotal(inventory.placeOrderSum(data));
                      }}
                      value={parseFloat(item.price)}
                    />
                  </td>
                  <td>
                    <input type="date" onChange={(e) => handleChange(e, "receiveddate", index)} value={item.receiveddate}
                      className="custom-input"
                      disabled={ready === true ? false : true}
                    />
                  </td>
                  <td>
                    <input
                      disabled={ready === true ? false : true}
                      type="date" value={item.expirydate} onChange={(e) => handleChange(e, "expirydate", index)}
                      className="custom-input"
                    />
                  </td>
                  <td>
                    <select
                      disabled={ready === true ? false : true}
                      type="text" value={item.brandid} onChange={(e) => handleChange(e, "brandid", index)} className="custom-input">
                      <option value="">select brand</option>
                      {item.stockbrands.length > 0 &&
                        item.stockbrands.map((a, i) => {
                          return (
                            <option value={a.brandid || 0} key={i + 1}>
                              {a.brand}
                            </option>
                          )
                        })}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text" disabled={ready === true ? false : true}
                      value={item.batchnumber}
                      onChange={(e) => handleChange(e, "batchnumber", index)}
                      className="custom-input"
                    />
                  </td>

                  <td>{item.totalamount}</td>
                  <td>
                    <div>
                      {item.stockbrands.length == 0 && <button onClick={(ev) => { navigateAddBrand(item) }} className="btn btn-secondary btn-sm mb-1">
                        <Add /> brand
                      </button>}
                    <button
                      className={
                        `btn-sm ${item.balance == 0 && item.quantityReceived > 0
                            ? "btn btn-primary btn-sm"
                            : "btn btn-warning btn-sm"}`
                      }
                      type="button"
                    >
                      {(item.balance == 0 && item.quantityReceived > 0) ? "complete" : "incomplete"}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      <div className="my-3 mx-3">
        <div className="form-row col-3">
          <label>Cost incurred from tax</label>
          <input
            onBlur={(ev) => {
              setTaxIncurred({ ...taxIncurred, amount: parseFloat(ev.target.value) })
              inventory.totalwithTaxAdded({ setdata: setTotal, amount: parseFloat(ev.target.value), datasource: data,setTax: setTaxIncurred})
            }}
            className="form-control "
            type="number"
          />
        </div>
      </div>
      <div className="col-3 mx-2">
        <RackCard
          header={<h5>Total Amount Incurred</h5>}
          body={<h1 className="d-flex justify-content-center">{totalprice}</h1>} />
      </div>
      <div className="d-flex justify-content-end mb-2">
        <button
          className="btn btn-primary btn-sm mx-2"
          sx={{ marginLeft: "20px" }}
          variant="contained"
          color="success"
          onClick={addToStock}>
          Add to stock
        </button>
        <button className="btn btn-danger btn-sm mx-2">Cancel</button>
      </div>
    </div>
  )
}
