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
      { Header: "phone number", accessor: "phonenumber",
        Cell: function ({ row }) {
          const mobile = row?.original?.phonenumber;
          return (
            <span>{0 + "" + mobile }</span>
          )
        }
      },
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
              <EditOffIcon color='primary' onClick={(ev) => { router.push(`/supplier/addsupplier?tab=edit&supplierid=${value}`) }} />
              <PreviewIcon color='warning' onClick={(ev) =>  {router.push(`/supplier/preview?supplierid=${value}`)}} />
              <DeleteForeverIcon color='error' onClick={(e) => deleteController(e, value)} />
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
