import { useRouter } from 'next/navigation';
import TableDisplay from '../accessories/TableDisplay';
export default function SUPPLIERS_LIST({ rawdata, deleteController, editController}) {
  const router = useRouter();

  const columns =
    [
      { Header: "name", accessor: "name" },
      // { Header: "address", accessor: "address" },
      {
        Header: "phone number", accessor: "phonenumber", Cell: function ({ row }) {
          const mobile = row?.original?.phonenumber;
          return (
            <span>{0 + "" + mobile }</span>
          )
        }
      },
      { Header: "email", accessor: "email" },
      { Header: "contact person", accessor: "contactperson" },
      { Header: "region", accessor: "region", width: '50px' },
      {
        Header: "action",
        accessor: "",
        Cell: ({ row }) => {
          const value = row.original?.supplierid;
          return (
            <div className="d-flex justify-content-between">
              <button onClick={(ev) => { editController(value) }} className='btn btn-info btn-sm'>
                edit
              </button>
              <button onClick={(ev) => { router.push(`/supplier/preview?supplierid=${value}`) }} className='btn btn-warning btn-sm mx-2'>
                details
              </button>
              <button className='btn btn-danger btn-sm' onClick={(e) => deleteController(e, value)} >
                delete
              </button>
            </div>
          )
        },
      },
    ]
    




  return (
    <>
      <TableDisplay data={rawdata} column={columns} filtering={true} showpage={false} />
    </>
  )
}
