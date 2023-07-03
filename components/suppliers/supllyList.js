import React from 'react'
import EMPTY_TABLE_TEMPLATE from '../accessories/emptyTable';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOffIcon from '@mui/icons-material/EditOff';
import Message from '../accessories/message';
import PreviewIcon from '@mui/icons-material/Preview';
import Link from 'next/link';
import TableIsLoading from '../accessories/TableIsLoading';
import useRouter from 'next/router';
import TableDisplay from '../accessories/TableDisplay';
export default function SUPPLIERS_LIST({ rawdata, deleteController, editController }) {

  const columns = 
    [
      { Header: "id", accessor: "supplierid" },
      { Header: "name", accessor: "name" },
      { Header: "address", accessor: "address" },
      { Header: "phone number", accessor: "phonenumber" },
      { Header: "email", accessor: "email" },
      { Header: "contact person", accessor: "contactperson" },
      { Header: "region", accessor: "region" },
      {
        Header: "action",
        accessor: "",
        Cell: ({ value }) => (
          <div className="d-flex">
            <button
              className="btn btn-info"
              onClick={() => {
                router.push(`/supplier/addsupplier?tab=edit&supplierid=${value}`);
              }}
              style={{ marginRight: "10px" }}
            >
              <EditOffIcon />
            </button>
            <button className="btn btn-danger" onClick={(e) => deleteController(e, value)}>
              <DeleteForeverIcon />
            </button>
            <button className="btn btn-warning">
              <Link href={`/supplier/${value}`}>
                <PreviewIcon />
              </Link>
            </button>
          </div>
        ),
      },
    ]
  
  const router = useRouter;
  return (
    <>
      <TableDisplay data={rawdata} column={columns} filtering={true}/>
    </>
  )
}
