import React from "react";
import TableDisplay from '../accessories/TableDisplay';

export default function ListTable({ data, handleCollectSample, receive }) {
  const columns = [
    { Header: "Date", accessor: "date", Cell: ({ value }) => { return new Date(value).toLocaleDateString() } },
    { Header: "Fullname", accessor: "fullname" },
    { Header: "Age", accessor: "age" },
    { Header: "Gender", accessor: "gender" },
    {
      Header: "Urgency", accessor: "clientstatus",
      Cell: ({ value }) => {
        return value == "urgent" ? <span className="btn btn-danger btn-sm ">{value}</span> : <div>{value}</div>
      }
    },
    {
      Header: "Action", accessor: "action",
      Cell: ({ row }) => (
        <div>
          <button onClick={(ev) => { receive() }} className="btn btn-primary btn-sm mx-1" color="primary">
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
      <TableDisplay  initpageSize={50} styling={'table '} column={columns} data={data} filtering={true} showpage={false} />
    </>
  );
}
