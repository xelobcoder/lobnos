import {  useCallback, useEffect, useState } from "react";
import SidebarFrontPage from "../../components/frontpagesidebar";
import Sampling from "../../components/readyComponents/Sampling";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import ISLOADING from "../../components/isLoading";
import { ToastContainer, toast } from "react-toastify";
import {  customFetch, getSpecificOrder, handleChangeWithState } from "../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";

export default function ProcessingOrder() {
  const [data, setData] = useState({});
  const id = useSearchParams().get('orderid');
  const [loading, setLoading] = useState(true);
  const [paymentmode, setPaymentMode] = useState([]);
  const order = useCallback(async function (id) { getSpecificOrder(id, setData, setLoading) }, []);
  
  const getPaymentMode = async function () {
    const getdata = await customFetch("paymentmodes");
    const { status, data, statusCode } = getdata;
    (status === "success" && statusCode == 200 && data) && setPaymentMode(data);
  }
  
  useEffect(() => {
    if (id) {
      order(id);
      getPaymentMode();
    };
  }, [order, id]);
  
  const recalculateTotalBill =  () => {
    const { totaltestcost, totalTax, discount } = data;
    const total = totaltestcost + totalTax;
    const discountValue = parseFloat(discount);
    const payable = total - discountValue;
    if (discountValue > total) {
      setData({ ...data, discount: 0,total,payableAmount: total });
      return;
    }
    setData({ ...data, total, payableAmount: payable,balance: 0,paid: 0});
  }


  const handlePaidAmount = async (ev) => {
    const { paid,payableAmount } = data;
    const paidValue = parseFloat(paid);
    if (paidValue === 0) return;
    if (paidValue > payableAmount) {
      setData({...data, paid: '0'})
      toast.warning('Please paid amount must be less or equal to payable amount', { autoClose: 3000 });
      return;
    }
    const balance = payableAmount - paidValue;
    setData({ ...data, balance });
  }


  const handleOrder = async (ev) => {
    console.log(ev.target, data);
  }


  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <ToastContainer/>
      <div className="mx-2">
      {loading && <ISLOADING />}
      {!loading && (
          <>
            <div className="mx-2">
                <div className="repeat-5">
                  <Sampling data={{ title: 'Total test cost', value: data.totaltestcost }} />
                  <Sampling data={{ title: 'Total Tax Value', value: data.totalTax }} />
                  <Sampling data={{ title: 'Total Cost', value: data.total }} />
                  <Sampling data={{ title: 'Discount', value: data.discount || 0 }} />
                  <Sampling data ={{title: 'payable amount', value:  data.payableAmount}} />
                </div>
              <div className="grid-2">
                <section >
                  <h4 >Requested clinical test</h4>
                    <div className="list-group">
                    {
                        (Object.keys(data).length > 0 && 'data' in data) && data?.data.map((item, index) => {
                            return (
                              <div key={index} className="d-flex list-group-item justify-content-between">
                                <span className="mb-1">{item.name}</span>
                                <span className="mb-1">{item.price}</span>
                              </div>
                          )
                      })
                    }
                  </div>
                </section>
                <section>
                  <h4>Update information</h4>
                <div className="bg-white br-5 py-2 px-2 mx-2">
                  <div>
                    <label>clinician name</label>
                    <input className="custom-input" disabled type="text" value={data.cliniciandata.name} />
                  </div>
                <div className="form-group my-3">
                  <label>discount</label>
                  <input className="custom-input"
                    value={data.discount}
                    onChange={(ev) => { handleChangeWithState(ev,"discount",setData,data)}}
                    onBlur={(ev) => { recalculateTotalBill(ev); }}
                    type="number" />
                </div>
                <div className="form-group my-3">
                  <label>Amount paid
                    <span className="label-helper">
                    {" "}  (Debt:{ data.balance || 0})
                    </span>
                  </label>
                  <input className="custom-input" value={data.paid}  type="number"  onChange={(ev) => {setData({...data, paid: ev.target.value})}} onBlur={(ev) => {handlePaidAmount(ev)}}/>
                </div>
                <div className="form-group my-3">
                  <label>Payment Mode</label>
                  <select className="custom-select">
                    <option> select an  option here </option>
                    {
                     ( paymentmode.length >  0) && (
                        paymentmode.map((item, index) => { return <option key={item.KeyID}>{item.PaymentMode}</option> }))
                    }
                 </select>
                </div>
                <div>
                    <button className="btn btn-primary btn-sm" onClick={(ev) => {handleOrder(ev)}}>
                      processing order
                    </button>
                </div> 
                </div>
                </section>
              </div>
              <div className="grid-2 my-2">
              <section className="mx-2">
                <h4>Taxes Applied</h4>
                {
                  (Object.keys(data).length > 0 && 'tax' in data && data.tax.length > 0) ? 
                    (
                      <>
                        <div className="list-group">
                        {data.tax.map((item, index) => {
                          return ( 
                            <div key={index} className="list-group-item  d-flex justify-content-between">
                              <span>{item.name}</span>
                              <span>{ item.value} %</span>
                            </div>
                          )
                      })}
                      </div>
                      </>
                    ) : (<div>
                      No Taxes
                  </div>)  
                  }
                </section>
              </div>
         </div>
        </>
      )}
     </div>
    </SettingsLayout>
  )
}