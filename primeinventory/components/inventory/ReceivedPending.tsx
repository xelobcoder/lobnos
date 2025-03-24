"use client"
import Loader from "../accessories/Loader";
import TableDisplay from "../accessories/TableDisplay";
import { ProgressBar } from "react-bootstrap";


export default function ReceivedPending({ caption, loading, stocks }: { caption: string, loading: boolean, stocks: any[] }) {
     


     const columns = [
          {
               Header: "Date Requested",
               accessor: "date",
               Cell: ({ row }) => <div>{new Date(row.original.date).toLocaleDateString()}</div>,
          },
          {
               Header: "Name",
               accessor: "name",
               filteringMode: "text",
               isMenu:true
          },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ row }) => (
                    <div>
                         <ProgressBar
                              variant={`${row.original.status === "pending" ? "warning" : "primary"}`}
                              now={row.original.status === "pending" ? 35 : 70}
                         />
                    </div>
               ),
          },
          {
               Header: "Unit",
               accessor: "comsumptionunit",
          },
          {
               Header: "Qty Requested",
               accessor: "quantity_requested",
          },
          {
               Header: "Qty Approved",
               accessor: "quantity_approved",
               Cell: ({ row }) => (
                    <>{row.original.quantity_approved == null ? <div className="-lims-text-color">Not yet</div> : row.original.quantity_approved}</>
               ),
          },
     ];


     if (loading) return <Loader />;


     return (
          <>
               <div className="">
                    <h4 className="text-capitalize">{caption} Department stock request</h4>
                    <TableDisplay
                         handleSeverSideProcessing={null}
                         column={columns} data={stocks} filtering={true} />
               </div>
          </>
     );
}
