import {  useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ExpenseLayout from '../../components/Expense/ExpenseLayout';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import Loader from '../../components/accessories/Loader';
import { useSearchParams } from 'next/navigation';
import { useApplicationSettings } from '../../components/Auth/useApplicationContext';

const defautExpense = {
  name: '',
  date: '',
  merchant: '',
  amount: '',
  category: '',
  mode: '',
  description: ''
};

export default function AddNewExpense() {
  const [expense, setExpense] = useState(defautExpense);
  const { user } = useApplicationSettings().applicationsettings;
  const employeeid = user?.employeeid;
  const [paymentmode, setPaymentMode] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const method = useSearchParams().get('action');
  const editid = useSearchParams().get("id");
  const [category, setCategoryList] = useState([]);

  useEffect(() => {
    setLoading(true);
    customFetch(`expense/get/category`)
      .then((data) => {
        if (Array.isArray(data)) {
          setCategoryList(data);
        }
      })
      .catch((err) => { })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (Object.values(expense).some((item, index) => item.toString().length == 0)) {
      return toast.warning('All fields must be filled', { autoClose: 2000 });
    }
    const { employeeid, branchid } = auth;
    if (!employeeid || !branchid)
      return window.location.reload();
    let httpMethod = method && editid ? 'PUT' : 'POST';
    const response = await customPost('expenses', httpMethod, { ...expense, employeeid, branchid });
    if (response?.status === "success") {
      toast.success('New expense generated successfully awaiting approval', { autoClose: 2000 });
      setExpense(defautExpense);
    } else {
      toast.error("Expense generation failed", { autoClose: 5000 });
    }
  };

  useEffect(() => {
    async function getPaymentModes() {
      try {
        setLoading(true);
        const paymentModes = await customFetch('paymentmodes');
        setPaymentMode(paymentModes?.data);
      } catch (err) {
        setPaymentMode([]);
      } finally {
        setLoading(false);
      }
    }
    getPaymentModes();
  }, []);

  useEffect(() => {
    if (method && editid) {
      setLoading(true);
      customFetch(`expenses/record/single?expenseid=${editid}`)
        .then((data) => {
          data.length > 0 && setExpense(data[0]);
        })
        .catch((err) => setExpense(defautExpense))
        .finally(() => { setLoading(false); });
    }
  }, [editid, method]);

  return (
    <ExpenseLayout>
      <ToastContainer theme='colored' />
      {isLoading && <Loader />}
      {!isLoading && (
        <div >
          <h4>New Expense </h4>
          <form className='bg-white border-secondary-subtle p-2 border'>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Name</label>
              <input
                className="custom-input"
                type="text"
                value={expense.name}
                required
                onChange={(e) => setExpense({ ...expense, name: e.target.value })}
              />
            </div>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Expense Date</label>
              <input
                type="datetime-local"
                className="custom-input"
                value={expense.date}
                onChange={(e) => setExpense({ ...expense, date: e.target.value })}
              />
            </div>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Merchant</label>
              <input
                className="custom-input"
                type="text"
                value={expense.merchant}
                onChange={(e) => setExpense({ ...expense, merchant: e.target.value })}
              />
            </div>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Amount</label>
              <input
                className="custom-input"
                type="number"
                value={expense.amount}
                onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
              />
            </div>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Category</label>
              <select
                className="custom-select"
                value={expense.category}
                onChange={(e) => setExpense({ ...expense, category: e.target.value })}
              >
                <option value={''}>Select a category</option>
                {category.map((item, index) => {
                  return <option key={index} value={item?.category}>{item?.category}</option>;
                })}
              </select>
            </div>
            <div className="form-row grid-reg px-2 py-1 mt-3">
              <label>Mode of Payment</label>
              <select
                className="custom-select"
                value={expense.mode}
                onChange={(e) => setExpense({ ...expense, mode: e.target.value })}
              >
                {paymentmode.length > 0 &&
                  paymentmode.map((item, index) => <option value={item.KeyID} key={index}>{item.PaymentMode}</option>)}
              </select>
            </div>
            <div>
              <label>Description</label>
              <Form.Control
                as="textarea"
                rows={3}
                value={expense.description}
                onChange={(e) => setExpense({ ...expense, description: e.target.value })}
              />
            </div>
            <div>
              <button onClick={(ev) => { handleSubmit(ev) }} type="button" className="btn btn-primary mt-2 btn-sm">
                Submit Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </ExpenseLayout>
  );
}
