'use client'
import React, { useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import dayjs from "dayjs";

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


     useEffect(() => {
          async function fetchCases() {
               setLoading(true);
               try {
                    const response = await customFetch(`outsourced/cases/tracking?page=1&&count=10`);
                    if (response.status === "success" && Array.isArray(response.data)) {
                         setCases(response.data);
                    } else {
                         setCases([]);
                    }
               } catch (err) {
                    setCases([]);
               } finally {
                    setLoading(false);
               }
          }
          fetchCases();
     }, []);

     const handleMarkExpense = (item: OutsourcedCase) => {
          // TODO: Implement logic for marking as expense
          alert(`Marking tracking ID ${item.tracking_id} as expense.`);
     };
     const handleConfirmDone = (item: OutsourcedCase) => {
          // TODO: Implement logic for confirming done
          alert(`Confirming tracking ID ${item.tracking_id} as done.`);
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
               Cell: ({ row }) => (
                    <>
                         <button className="btn btn-warning btn-sm mx-1" onClick={() => handleMarkExpense(row.original)}>
                              Mark as Expense
                         </button>
                         <button className="btn btn-success btn-sm mx-1" onClick={() => handleConfirmDone(row.original)}>
                              Confirm Done
                         </button>
                    </>
               )
          }
     ];

     return (
          <div>
               <h2 className="alert alert-primary text-muted small col-4">Outsourced Cases Tracking</h2>
               <PrimeTable
                    column={columns}
                    data={cases}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
               />
          </div>
     );
}
