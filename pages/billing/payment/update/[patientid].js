import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router';
import SettingsLayout from '../../../../components/settingsComponents/SettingsLayout'
import { customData, customFetch, customPost } from '../../../../components/Auth/customFetch';
import PreviewPatientInformation from '../../../../components/petientsComponent/PreviewPatientInformation';
import SidebarFrontPage from '../../../../components/frontpagesidebar';
import OutstandingBills from '../../../../components/petientsComponent/OutstandingBill';
import { ToastContainer, toast } from "react-toastify";
import Loader from '../../../../components/accessories/Loader';
import AuthContext from '../../../../components/Auth/useAuthentification';
export default function BillingUpdatelientpaymentHistory() {
  const { patientid } = useRouter().query;
  const [pyinfo, setPyinfo] = useState({ amount: 0, paymentmode: 0 })
  const [outHx, setoutstandinghX] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [billingoptions, setBillingOptions] = useState([]);
  const { auth } = useContext(AuthContext);
  const employeeid = parseInt(auth?.employeeid);



  useEffect(() => {
    if (patientid) {
      async function get() {
        try {
          setIsLoading(true);
          await customData(`billing/client/bulk/outstanding?patientid=${parseInt(patientid)}`, setoutstandinghX);
          const { data } = await customFetch('paymentmodes');
          data ? setBillingOptions(data) : setBillingOptions([]);
          setIsLoading(false);
        } catch (err) {
          setIsLoading(false);
          setBillingOptions([]);
          toast.error("something wrong occured", { autoClose: 5000, position: 'top-center' });
        }
      };
      get();
    }
  }, [patientid]);


  const toTotalOutstanding = () => {
    const total = outHx.reduce((current, previous) => current + previous.outstanding, 0);
    return total;
  }


  const handleSubmitInfo = async () => {
    const { amount, paymentmode } = pyinfo;
    const amountpaid = parseInt(amount);
    if (amountpaid > toTotalOutstanding() || amountpaid <= 0) {
      return toast.warning(`paid amount must be less or equal to total outstanding bill and greater than 0`, { autoClose: 2000, position: 'top-center' });
    }

    if (paymentmode < 0 || paymentmode == "") {
      return toast.warning(`select a valid payment option`, { autoClose: 2000, position: 'top-center' });
    }

    if (patientid && employeeid) {
      const forwardData = await customPost(`billing/client/clear/outstandingdebt`, 'POST', { amountpaid, patientid, paymentmode: parseInt(paymentmode), employeeid });
      const { statusCode, message, status } = forwardData;

      if (statusCode == 200 && status == "success") {
        toast.success(message, { autoClose: 1000, position: 'top-center' });
        await customData(`billing/client/bulk/outstanding?patientid=${patientid}`, setoutstandinghX);
        return;
      }
      return toast.error(message, { autoClose: 2000, position: 'top-center' })
    }
  }



  const transactionRender = () => {
    if (isloading) {
      return <Loader />
    } else {
      return (
        <section className='grid-70-30'>
          <div>
            <h2 className='mt-2 mx-2'>Transaction History</h2>
            <table className='table border br-5 mx-2'>
              <thead style={{ backgroundColor: '#00224f', color: 'white' }} >
                <tr>
                  <th>Date</th>
                  <th>billing id</th>
                  <th>Cost incurred</th>
                  <th>Amount Paid</th>
                  <th>Discount</th>
                  <th>outstanding</th>
                </tr>
              </thead>
              <tbody>
                {outHx.length === 0 ? <tr><td scope='5'>No data Available</td></tr> : outHx.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{new Date(item?.date).toLocaleDateString()} {" "} {new Date(item?.date).toLocaleTimeString()}</td>
                      <td>{item?.billingid}</td>
                      <td>{item?.payable}</td>
                      <td>{item?.paid}</td>
                      <td>{item?.discount}</td>
                      <td className={`${item?.outstanding > 0 ? 'text-danger' : 'text-primary'}`}>{item?.outstanding}</td>
                    </tr>
                  )
                })}
              </tbody>
          </table>
          </div>
          <div>
            <h2 className='mx-2 mt-2'>Update Payment</h2>
            <div className='form-row mx-2'>
              <label className='text-primary'>Amount</label>
              <input type='number' className='custom-input'
                onChange={(ev) => { setPyinfo({ ...pyinfo, amount: ev.target.value }) }}
                value={pyinfo.amount} placeholder='enter payment amount' />
            </div>
            <div className='form-row mx-2'>
              <label className='text-primary'>Payment Modes</label>
              <select className='custom-input' onChange={(ev) => { setPyinfo({ ...pyinfo, paymentmode: ev.target.value }) }}>
                <option value="">select a payment option here</option>
                {billingoptions.
                  map((item, index) => {
                    return (
                      <option
                        value={item.KeyID} key={index}>{item.PaymentMode}</option>)
                  })}
              </select>
            </div>
            <div>
              <button className='btn btn-primary btn-sm mx-2 mt-2' onClick={handleSubmitInfo}>
                update payment
              </button>
            </div>
          </div>
        </section>
      )
    }
  }
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <ToastContainer />
        <div >
          <div className='grid-70-30'>
            <PreviewPatientInformation patientid={patientid} />
            <OutstandingBills total={toTotalOutstanding()} />
          </div>
          {transactionRender()}
        </div>
      </SettingsLayout>
    </>
  )
}



