import React  from "react";
import TableDisplay from '../accessories/TableDisplay';
export default function ListTable({ data, handleCollectSample ,receive}) {
  const columns = [
    { Header: "DATE", accessor: "date",Cell:  ({value}) => {return new Date(value).toLocaleDateString()}},
    { Header: "BILLINGID", accessor: "billingid" },
    { Header: "FULLNAME", accessor: "fullname" },
    { Header: "AGE", accessor: "age" },
    { Header: "GENDER", accessor: "gender" },
    { Header: "URGENCY", accessor: "clientstatus" },
    { Header: "ACTION", accessor: "action",
      Cell: ({ row }) => (
        <div>
          <button onClick={(ev) => {receive()}} className="btn btn-primary btn-sm mx-1" color="primary">
            receive
          </button>
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={(e) => {
              handleCollectSample(
                row.original.billingid,
                row.original.patientid,
                row.original.fullname
              );
            }}
          >
            pull sample
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
     <TableDisplay column={columns} data={data} filtering={true} />
    </>
  );
}
