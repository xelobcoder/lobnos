'use client'
import styles from '../../../../components/organization/OrganizationWorkspace.module.css';
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { customPost,customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

type OutsourcedCase = {
     tracking_id: number;
     serviceid: number;
     testid: number;
     test_name: string;
     category: number;
     price: number;
     unit: string;
     employeeid: number;
     status: number;
     comments: string;
     createdOn: string;
     updatedOn: string | null;
     outsourceid: number;
     completedconfirmedby: number | null;
};


export default function OutsourcedCasesTrackingPage() {
     const [cases, setCases] = useState<OutsourcedCase[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const employeeid = useApplication()?.user.employeeid;
     const branchid = useApplication()?.branchid;


     const fetchCases = async () => {
          setLoading(true);
          try {
               const response = await customFetch(`outsourced/cases/tracking?page=1&&count=10`);
               if ((response.status === "success" || response.status === true) && Array.isArray(response.data)) {
                    setCases(response.data);
               } else {
                    setCases([]);
               }
          } catch (err) {
               setCases([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchCases();
     }, []);

     const handleMarkExpense = async (item: OutsourcedCase) => {
          const { serviceid, testid, tracking_id } = item;
          const response = await customPost(`outsourced/cases/mark-expense`, 'POST', {
               serviceid, testid, employeeid, branchid,
               tracking_id
          });
          if (response.status === true || response.status === "success") {
               toast.success(`Tracking ID ${tracking_id} marked as expense.`, { autoClose: 3000 });
               fetchCases();
          } else {
               toast.error(`Failed to mark tracking ID ${tracking_id} as expense.`, { autoClose: 3000 });
          }
     };

     const handleConfirmDone = async (item: OutsourcedCase) => {
          const { tracking_id } = item;
          const response = await customPost(`outsourced/cases/confirm-done`, 'POST', { trackingId: tracking_id, branchid, employeeid });
          if (response.status === true || response.status === "success") {
               toast.success(`Tracking ID ${tracking_id} confirmed as done.`, { autoClose: 3000 });
               fetchCases();
          } else {
               toast.error(`Failed to confirm tracking ID ${tracking_id} as done.`, { autoClose: 3000 });
          }
     };



     const handleServerSideProcessing = () => {
          // TODO: Implement server-side processing logic
          alert("Implement server-side processing");
     };
     if (loading) return <div>Loading...</div>;

     // Columns config for PrimeTable
     const columns = [
          { Header: "Tracking ID", accessor: "tracking_id" },
          { Header: "Test Name", accessor: "test_name" },
          { Header: "Price", accessor: "price" },
          { Header: "Status", accessor: "status" },
          { Header: "Comments", accessor: "comments" },
          {
               Header: "Created On",
               accessor: "createdOn",
               Cell: ({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss")
          },
          {
               Header: "Actions",
               accessor: "actions",
               Cell: ({ row }) => {
                    const { approved, completedconfirmedby, expense_id } = row.original;
                    const isConfirmed = completedconfirmedby != null;
                    const isMarkedExpense = expense_id != null;
                    return (
                         <>
                              {isMarkedExpense && (
                                   <span className="badge bg-warning text-dark mx-1 p-2">Marked as Expense</span>
                              )}
                              {isConfirmed && (
                                   <span className="badge bg-success mx-1 p-2">Confirmed</span>
                              )}
                              {!isMarkedExpense && approved !== 1 && (
                                   <button className="btn btn-warning btn-sm mx-1" onClick={() => handleMarkExpense(row.original)}>
                                        Mark as Expense
                                   </button>
                              )}
                              {!isConfirmed && (
                                   <button className="btn btn-success btn-sm mx-1" onClick={() => handleConfirmDone(row.original)}>
                                        Confirm Done
                                   </button>
                              )}
                         </>
                    );
               }
          }
     ];

     return (
          <main className={styles.workspace}><header className={styles.header}><div><span className={styles.eyebrow}>Outsourcing</span><h1>Outsourced cases</h1><p>Track outsourced tests, record expenses, and confirm completed work.</p></div></header><section className={styles.panel}>
               <PrimeTable
                    column={columns}
                    data={cases}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
               />
          </section></main>
     );
}