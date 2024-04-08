import { useContext, useEffect, useState } from "react"
import ExpenseLayout from "../../components/Expense/ExpenseLayout"
import AuthContext from "../../components/Auth/useAuthentification"
import Loader from "../../components/accessories/Loader";
import Authorization from "../../components/accessories/authorization";
import { currencyFormatter, customFetch } from "../../components/Auth/customFetch";
import Image from 'next/image'
import Pagination from '../../components/accessories/pagination';
import { List } from "@mui/icons-material";

export default function AdminExpensesList({ props }) {
     const { auth } = useContext(AuthContext);
     const [loading, setLoading] = useState(false);
     const [detail, setDetails] = useState(true);
     const [selected, setSelected] = useState(null);
     const [expenses, setExpenses] = useState([]);
     const [selectedLoading, setSelectedLoading] = useState(false);
     const [imagefull, setImageFull] = useState(false);
     const { branchid, employeeid } = auth;


     // const renderingView = () => {
     //      if (!auth.role) {
     //           return <Loader />
     //      } else if (auth.role && !['admin', 'manager'].includes(auth.role)) {
     //           return <Authorization/>
     //      } else {
     //           return <h1>Hello</h1>
     //      }
     // }

     useEffect(() => {
          if (employeeid && branchid) {
               customFetch(`expenses/records?branchid=${branchid}&&employeeid=${employeeid}`)
                    .then((data) => {
                         setExpenses(data);
                    }).catch((err) => {
                         console.log(err);
                    })
          }
     }, [branchid, employeeid])


     useEffect(() => {
          if (selected) {
               setSelectedLoading(true);
               customFetch(`expenses/record/single?expenseid=${parseInt(selected)}`)
                    .then((data) => {
                         data.length > 0 && setDetails(data[0]);
                    })
                    .catch((err) => {
                         setDetails(null)
                    })
                    .finally(() => { setSelectedLoading(false) })
          }
     }, [selected])




     const viewSelected = () => {
          if (selectedLoading) {
               return <Loader />
          } else {
               if (selected) {
                    return <>
                         <div className="d-flex justify-content-end">
                              {detail?.approved == 0 &&
                                   <span className="text-warning bg-warning text-white border-warning border p-2"> AWAITING APPROVAL</span>}
                              {detail?.approved == 2 &&
                                   <span className="text-danger bg-danger text-white border-danger border p-2">EXPENSE REJECTED</span>}
                              {detail?.approved == 1 && <span className="text-success p-2 border-success border">EXPENSE APPROVED</span>}
                         </div>
                         <div className="border border-secondary-subtle p-2 grid grid-50">
                              <span>Title:{detail?.name}</span>
                              <span>ID:EXP{detail?.id}</span>
                              <span>
                                   Expense date: {new Date(detail?.date).toLocaleDateString()}
                                   {" "}
                                   {new Date(detail?.date).toLocaleTimeString()}
                              </span>
                              <span>
                                   Loggedon:
                                   {new Date(detail?.createdon).toLocaleDateString()} {" "}
                                   {new Date(detail?.createdon).toLocaleTimeString()}
                              </span>
                              <span>
                                   Amount: {currencyFormatter.format(detail?.amount)}
                              </span>
                              <span>
                                   ApprovedOn: {detail?.approved == 1 ? detail.approvedon : 'N/A'}
                              </span>
                         </div>
                         <div className="mx-1 mt-2">
                              <h6>Description</h6>
                              <p className="bg-secondary-subtle br-5 p-3">
                                   {detail?.description}
                              </p>
                         </div>
                         <div className="mx-1">
                              <div className="d-flex justify-content-between">
                                   <h6>Receipts</h6>
                                   <List fontSize="large" onClick={(ev) => { setImageFull(!imagefull) }} />
                              </div>
                              {detail?.images && detail?.images.length == 0 && "No receipts uploaded"}
                              {detail?.images && detail.images.length > 0 &&
                                   <div className={imagefull ? 'grid ' : "grid-30-30-30"}>
                                        {
                                             detail.images.map((item, index) => {
                                                  const url = `http://localhost:5000/api/v1/expenses/receipt/upload/images?imageid=${item}`
                                                  return (<Image key={index} alt='expense receipt'
                                                       className={imagefull ? 'mb-3 container ' : ''}
                                                       height={imagefull ? '600' : '300'}
                                                       onClick={(ev) => { window.open(url) }}
                                                       width={imagefull ? '1000' : '300'}
                                                       src={url} />)
                                             })
                                        }
                                   </div>}
                         </div>
                    </>
               }
          }
     }


     return (
          <ExpenseLayout>
               {/* {renderingView()} */}
               <div style={{ minHeight: '100vh', maxHeight: 'max-content', backgroundColor: 'white', display: 'grid', gridTemplateColumns: `${selected ? '25% auto' : '100%'}` }}>
                    <section style={{ borderRight: '1px solid lightgray' }}>
                         <div className="d-block p-1" >
                              <input type="date" className="custom-input" />
                              <input type="date" className="custom-input mt-2" />
                              <select className="custom-select mt-2">
                                   <option value='approved'>approved</option>
                                   <option value='rejected'>rejected</option>
                                   <option value='requested'>requested</option>
                              </select>
                              <button className="btn btn-primary btn-sm mt-2">
                                   search
                              </button>
                         </div>
                         <div>
                              {expenses.map((item, index) => {
                                   return (
                                        <div onClick={(ev) => { setSelected(item?.id) }} key={index}
                                             className={`border-bottom p-3 pointer ${selected == item?.id ? "expense-admin-li" : ""}`}>
                                             <div className="d-flex justify-content-between">
                                                  <span className="text-capitalize text-primary">{item?.name}</span>
                                                  <span className="text-secondary text-lead">
                                                       {currencyFormatter.format(item.amount)}
                                                  </span>
                                             </div>
                                             <div className="mt-2 d-flex justify-content-between" >
                                                  <div className="text-capitalize">Requested By:
                                                       <span className="text-warning mx-2">
                                                            {item.username}
                                                       </span>
                                                  </div>
                                                  <div>
                                                       {item.approved == 0 &&
                                                            <span className="text-warning border-warning border"> PENDING</span>}
                                                       {item.approved == 2 &&
                                                            <span className="text-danger border-danger border">REJECTED</span>}
                                                       {item.approved == 1 && <span className="text-success border-success border">APPROVED</span>}
                                                  </div>
                                             </div>
                                        </div>)
                              })}
                         </div>
                         <div className="d-flex justify-content-end mt-2 mx-2">
                              <Pagination />
                         </div>
                    </section>
                    {selected &&
                         (
                              <section className="pointer">
                                   <div className="d-flex justify-content-end border-bottom p-2">
                                        <button className="btn  btn-sm btn-success">
                                             Approve
                                        </button>
                                        <button className="btn btn-sm  btn-danger mx-2 ">
                                             Reject
                                        </button>
                                   </div>
                                   <div>
                                        {viewSelected()}
                                   </div>
                              </section>
                         )}
               </div>
          </ExpenseLayout>
     )
}


