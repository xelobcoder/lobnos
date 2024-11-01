import { useState, useEffect } from "react";
import Loader from "../accessories/Loader";
import { useRouter } from "next/router";
import { customData } from "../Auth/customFetch";
import TableDisplay from "../accessories/TableDisplay";
import { ProgressBar } from "react-bootstrap";
export default function ReceivedPending({ type = "pending", caption }) {
  const departmentId = useRouter().query.id;
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    if (departmentId) {
      setLoading(true);
      try {
        customData(`departments/requisitions?id=${departmentId}&&type=${type}`, setStocks);
        setLoading(false);
      } catch (err) {
        setStocks([]);
        setLoading(false);
      }
    }
  }, [departmentId, type]);

  const columns = [
    {
      Header: "Date Requested",
      accessor: "date",
      Cell: ({ row }) => <div>{row.original.date.slice(0, 10)}</div>,
    },
    {
      Header: "Name",
      accessor: "name",
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
      Header: "Consumption Unit",
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

  const renderer = () => {
    if (loading) return <Loader />;
    else return <div   className="bg-white p-2"> <TableDisplay column={columns} data={stocks} showpage={false}  filtering={true} /></div>;
  };
  return (
    <>
      <div className=" bg-light p-2 ">
        <h4>{caption}</h4>
        {renderer()}
     </div>
    </>
  );
}
