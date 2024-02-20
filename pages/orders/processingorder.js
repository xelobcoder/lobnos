import { useCallback, useEffect, useState } from "react";
import Sampling from "../../components/readyComponents/Sampling";
import ISLOADING from "../../components/isLoading";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {  customFetch, customPost, getSpecificOrder, handleChangeWithState } from "../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";

export default function ProcessingOrder() {
  const router = useRouter();
  const [data, setData] = useState({});
  const id = useSearchParams().get('orderid');
  const [loading, setLoading] = useState(true);
  const [paymentmode, setPaymentMode] = useState([]);
  const order = useCallback(async (id) => { getSpecificOrder(id, setData, setLoading) }, []);
  
  const getPaymentMode = async () => {
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
    const { testcost,taxValue, discount } = data;
    const cost = testcost + taxValue;
    const discountValue = parseFloat(discount);
    const payable = cost - discountValue;
    if (discountValue > cost) {
      setData({ ...data, discount: 0,cost,payable: cost });
      return;
    }
    setData({ ...data, cost, payable: payable,balance: 0,paid: 0});
  }


  const handlePaidAmount = async (ev) => {
    const { paid,payable } = data;
    const paidValue = parseFloat(paid);
    if (paidValue === 0) return;
    if (paidValue > payable) {
      setData({...data, paid: '0'})
      toast.warning('Please paid amount must be less or equal to payable amount', { autoClose: 3000 });
      return;
    }
    const balance = payable - paidValue;
    setData({ ...data, balance });
  }


  const handleOrder = async (ev) => {  
    try {
      const _this = { ...data };
      _this.paid = parseInt(data.paid);
       const { paymentmode, paid, payable,test} = _this;
       if (paymentmode == "") {
         toast.error("Payment mode not selected", { autoClose: 1000 });
         return;
       }
       if (paid <= 0 || paid < parseInt(payable) || paid < parseInt(payable)){
         toast.error("Amount must be greather than 0 and must be less equal to amount payabele");
         return;
       }
       const samplingCenter = window.localStorage.getItem("deviceDefaultBranch");
   
       if (samplingCenter) {
         const branchid = parseInt( samplingCenter.split("branch-")[1]);
         _this.samplingCenter = branchid;
       } else {
         toast.error("default branch not set", { autoClose: 10000 });
         return;
       }
   
       _this.outstanding = _this.balance;
       _this.discount = parseFloat(_this.discount);
       _this.status = 'none';
       if (test.length > 0) {
         _this.test = test.map((item, index) => { return item?.id });
       }
      const pushorder = await customPost("orders/processed", 'POST', _this);
      
      const { statusCode, status, message } = pushorder;

      if (statusCode == 200 && status == "success") {
        toast.success(message, { autoClose: 500 });
        setLoading(true);
        router.push("/orders");
      }
      else {
        toast.error(message, { autoClose: 3000 });
      }
    } catch (err) {
       toast.error("soemthing wrong occured", { autoClose: 3000 });
    }
  }



  return (
    <FrontDeskLayout>
      <ToastContainer />
      <div className="mx-2">
      {loading && <ISLOADING />}
      {!loading && (
          <>
            <div className="mx-2">
                <div className="repeat-5">
                  <Sampling data={{ title: 'Total test cost', value: data.testcost }} />
                  <Sampling data={{ title: 'Total Tax Value', value: data.taxValue }} />
                  <Sampling data={{ title: 'Total Cost', value:data.cost }} />
                  <Sampling data={{ title: 'Discount', value: data.discount || 0 }} />
                  <Sampling data ={{title: 'payable amount', value:  data.payable}} />
                </div>
              <div className="grid-2">
                <section >
                  <h4 >Requested clinical test</h4>
                    <div className="list-group">
                    {
                        (Object.keys(data).length > 0 && 'test' in data) && data?.test.map((item, index) => {
                            return (
                              <div key={item?.id} className="d-flex list-group-item justify-content-between text-sm">
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
                    <input className="custom-input" disabled type="text" value={data.clinicianname} />
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
                  <select className="custom-select" value={data.paymentmode} onChange={(ev) => setData({...data, paymentmode: ev.target.value})}>
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
                <h5>Taxes</h5>
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
                      ) :
                      (
                      <div className="text-white br-5 border border-primary bg-primary py-2 px-2">
                      No Taxes Applied
                  </div>)  
                  }
                </section>
              </div>
         </div>
        </>
      )}
     </div>
    </FrontDeskLayout>
  )
}