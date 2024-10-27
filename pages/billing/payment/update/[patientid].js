import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { customData, customFetch, customPost } from '../../../../components/Auth/customFetch';
import PreviewPatientInformation from '../../../../components/petientsComponent/PreviewPatientInformation';
import OutstandingBills from '../../../../components/petientsComponent/OutstandingBill';
import { ToastContainer, toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';
import AuthContext from '../../../../components/Auth/useAuthentification';
import FrontDeskLayout from '../../../../components/Layout/FrontDeskLayout';

export default function BillingUpdateClientPaymentHistory() {
  const { patientid } = useRouter().query;
  const { auth } = useContext(AuthContext);
  const employeeId = parseInt(auth?.employeeid);

  const [paymentInfo, setPaymentInfo] = useState({ amount: 0, paymentMode: '' });
  const [outstandingBills, setOutstandingBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingOptions, setBillingOptions] = useState([]);

  useEffect(() => {
    if (!patientid) return;

    const fetchBillingData = async () => {
      try {
        setIsLoading(true);
        await customData(
          `billing/client/bulk/outstanding?patientid=${parseInt(patientid)}`,
          setOutstandingBills
        );

        const { data } = await customFetch('paymentmodes');
        setBillingOptions(data || []);
      } catch (err) {
        toast.error('Something went wrong', { autoClose: 5000, position: 'top-center' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [patientid]);

  const calculateTotalOutstanding = () =>
    outstandingBills.reduce((sum, bill) => sum + bill.outstanding, 0);

  const handlePaymentSubmission = async () => {
    const { amount, paymentMode } = paymentInfo;
    const amountPaid = parseFloat(amount);

    if (amountPaid <= 0 || amountPaid > calculateTotalOutstanding()) {
      return toast.warning(
        'Amount must be greater than 0 and less than or equal to the outstanding bill',
        { autoClose: 2000, position: 'top-center' }
      );
    }

    if (!paymentMode) {
      return toast.warning('Select a valid payment option', { autoClose: 2000, position: 'top-center' });
    }

    if (patientid && employeeId) {
      const response = await customPost('billing/client/clear/outstandingdebt', 'POST', {
        amountPaid,
        patientid,
        paymentMode: parseInt(paymentMode),
        employeeId,
      });

      const { statusCode, message, status } = response;

      if (statusCode === 200 && status === 'success') {
        toast.success(message, { autoClose: 1000, position: 'top-center' });

        await customData(
          `billing/client/bulk/outstanding?patientid=${patientid}`,
          setOutstandingBills
        );
      } else {
        toast.error(message, { autoClose: 2000, position: 'top-center' });
      }
    }
  };

  const renderTransactionHistory = () => {
    if (isLoading) return <Loader />;

    const totalOutstanding = calculateTotalOutstanding();
    const isFreeSelected = paymentInfo.paymentMode.toLowerCase() === 'free';

    return (
      <section>
        <h2 className="mx-1 mt-2 pls-color header-content justify-content-center d-flex p-2 bg-body-secondary fw-bold">
          Transaction History
        </h2>
        <table className="table ttable br-5 mx-2">
          <thead className="fw-bold bg-secondary-subtle">
            <tr>
              <th>Date</th>
              <th>Billing ID</th>
              <th>Cost Incurred</th>
              <th>Amount Paid</th>
              <th>Discount</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {outstandingBills.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No data available</td>
              </tr>
            ) : (
              outstandingBills.map((bill, index) => (
                <tr key={index}>
                  <td>
                    {new Date(bill.date).toLocaleDateString()} {new Date(bill.date).toLocaleTimeString()}
                  </td>
                  <td>{bill.billingid}</td>
                  <td>{bill.payable}</td>
                  <td>{bill.paid}</td>
                  <td>{bill.discount}</td>
                  <td className={bill.outstanding > 0 ? 'text-danger' : 'text-primary'}>
                    {bill.outstanding}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5" className="text-end fw-bold">Total Outstanding:</td>
              <td>{totalOutstanding}</td>
            </tr>
            <tr>
              <td colSpan="5" className="text-end">Payment Amount:</td>
              <td>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="Enter payment amount"
                  value={paymentInfo.amount}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, amount: e.target.value })
                  }
                />
              </td>
            </tr>
            <tr>
              <td colSpan="5" className="text-end">Payment Mode:</td>
              <td>
                <select
                  className="custom-input"
                  value={paymentInfo.paymentMode}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, paymentMode: e.target.value })
                  }
                >
                  <option value="">Select a payment option</option>
                  {billingOptions.map((option, index) => (
                    <option key={index} value={option.PaymentMode}>
                      {option.PaymentMode}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td colSpan="6" className="text-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handlePaymentSubmission}
                  disabled={isFreeSelected && totalOutstanding > 0}
                >
                  Update Payment
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    );
  };

  return (
    <FrontDeskLayout>
      <ToastContainer />
      <div className="grid-70-30">
        <div>
          <PreviewPatientInformation patientid={patientid} />
        </div>
        <div>
          <OutstandingBills total={calculateTotalOutstanding()} />
        </div>
      </div>
      {renderTransactionHistory()}
    </FrontDeskLayout>
  );
}
