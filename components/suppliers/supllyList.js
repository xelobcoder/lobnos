import React from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOffIcon from '@mui/icons-material/EditOff';
import PreviewIcon from '@mui/icons-material/Preview';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TableDisplay from '../accessories/TableDisplay';
export default function SUPPLIERS_LIST({ rawdata, deleteController, editController }) {
  const router = useRouter();

  const columns =
    [
      { Header: "#", accessor: "supplierid", Cell: ({ row }) => { return <span>{row?.original?.supplierid}</span> } },
      { Header: "name", accessor: "name" },
      { Header: "address", accessor: "address" },
      { Header: "phone number", accessor: "phonenumber" },
      { Header: "email", accessor: "email" },
      { Header: "contact person", accessor: "contactperson" },
      { Header: "region", accessor: "region" },
      {
        Header: "action",
        accessor: "",
        Cell: ({ row }) => {
          const value = row.original?.supplierid;
          return (
            <div className="d-flex">
              <button
                className="btn btn-info btn-sm"
                title='edit info'
                onClick={() => {
                  router.push(`/supplier/addsupplier?tab=edit&supplierid=${value}`);
                }}
                style={{ marginRight: "10px" }}
              >
                <EditOffIcon />
              </button>
              <button title='delete supplier' className="btn btn-danger btn-sm" onClick={(e) => deleteController(e, value)}>
                <DeleteForeverIcon />
              </button>
              <button className="btn btn-warning btn-sm " title='view supplier'>
                <Link href={`/supplier/${value}`}>
                  <PreviewIcon />
                </Link>
              </button>
            </div>
          )
        },
      },
    ]




  return (
    <>
      <TableDisplay data={rawdata} column={columns} filtering={true} />
    </>
  )
}
