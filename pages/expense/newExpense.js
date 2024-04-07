import { useContext, useEffect, useState } from 'react';
import Textarea from '@mui/joy/Textarea';
import ExpenseLayout from '../../components/Expense/ExpenseLayout';
import { ToastContainer, toast } from 'react-toastify';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import AuthContext from '../../components/Auth/useAuthentification';
import Loader from '../../components/accessories/Loader';

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
     const { auth } = useContext(AuthContext);
     const [paymentmode, setPaymentMode] = useState([]);
     const [isloading, setLoading] = useState(false);



     const handleSubmit = async (ev) => {
          ev.preventDefault();

          if (Object.values(expense).some((item, index) => item.toString().length == 0)) {
               return toast.warning('All fields must be field', { autoClose: 2000 });
          }
          const { employeeid, branchid } = auth;
          if (!employeeid || !branchid)
               return window.location.reload();
          const response = await customPost('expenses', 'POST', { ...expense, employeeid, branchid });
          console.log(response)
     }




     useEffect((ev) => {
          async function getPaymentModes() {
               try {
                    setLoading(true);
                    const paymentModes = await customFetch('paymentmodes');
                    setPaymentMode(paymentModes?.data)
               } catch (err) {
                    setPaymentMode([])
               } finally {
                    setLoading(false);
               }
          }
          getPaymentModes();
     }, [])
     return (
          <ExpenseLayout>
               <ToastContainer theme='colored' />
               {isloading && <Loader />}
               {!isloading && (
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
                                        <option value="furniture">Furniture</option>
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
                                   <Textarea
                                        maxRows={5}
                                        minRows={3}
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
