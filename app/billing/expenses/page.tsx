"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { currencyFormatter, customFetch, updatePagination } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";


export default function ExpenseList() {
     const [expenses, setExpenses] = useState([]);
     const [filter, setFiltering] = useState({ page: 1, count: 10 });
     const [shoudload, setLoad] = useState(false);
     const { applicationsettings } = useApplicationSettings();
     const { employeeid, username, role } = applicationsettings.user;
     const branchid = applicationsettings.branchid;


     const columns = [
          { Header: 'Expense', accessor: 'name' },
          { Header: 'merchant', accessor: 'merchant' },
          { Header: "submitter", accessor: 'username' },
          { Header: 'expense date', accessor: 'date', Cell: ({ value }) => new Date(value).toLocaleDateString() },
          { Header: 'submittedon', accessor: 'createdon', Cell: ({ value }) => new Date(value).toLocaleDateString() },
          {
               Header: 'Amount', accessor: 'amount', Cell: ({ value, original }) => {
                    return currencyFormatter.format(value)
               }
          },
          {
               Header: 'status', accessor: "approved", Cell: ({ value, row }) => {
                    if (value == 0) {
                         return (
                              <div>
                                   <span className="text-capitalize text-warning mx-2">Pending</span>
                                   <Link href={`/expense/newExpense?action=edit&&id=${row.original.id}`}>Edit</Link>
                              </div>
                         )
                    } else if (value == 1) {
                         return (
                              <div className="d-flex">
                                   <span className="text-capitalize text-success">Approved</span>
                                   <Link className="mx-2 border-bottom-1" href={`/expense/receipt/${row.original.id}`}>upload receipt</Link>
                              </div>
                         )
                    } else {
                         return <div className="text-capitalize text-danger">Rejected</div>
                    }
               }
          }
     ]

     useEffect(() => {
          if (employeeid && branchid) {
               customFetch(`expenses/records?branchid=${branchid}&&employeeid=${employeeid}&&page=${filter.page}&&count=${filter.count}`)
                    .then((data) => {
                         setExpenses(data);
                    }).catch((err) => {
                         console.log(err)
                    })
          }
     }, [employeeid, branchid, filter]);



     const updatePage = (value) => {
          updatePagination(value, setFiltering, filter);
     }

     return (
         <div>
               <section className="mb-4 my-2">
                    <div className="d-flex">
                         <input type="date" className="custom-input" />
                         <input type="date" className="custom-input mx-2" />
                         <select className="custom-select mx-2">
                              <option value='approved'>approved</option>
                              <option value='rejected'>rejected</option>
                              <option value='requested'>requested</option>
                         </select>
                         <button className="btn btn-primary btn-sm">
                              search
                         </button>
                    </div>
               </section>
               <div className=" bg-secondary-subtle p-2 br-5 pls-color col-4">
                    User Requested Expenses
               </div>
                <PrimeTable handleSeverSideProcessing={null}
               column={columns} data={expenses || []} serverSideFiltering={true} filtering={false} />
         </div>
     )
}