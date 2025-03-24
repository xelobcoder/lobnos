import { useState } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../accessories/TableDisplay';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import MoreVertIcon from '@mui/icons-material/MoreVert';



export default function SUPPLIERS_LIST({ rawdata, deleteController, editController }) {
  const router = useRouter();

  const columns = [
    {
      Header: "Registration Date", accessor: "date", Cell: ({ value }) => {
        return value ? new Date(value).toLocaleDateString() : '';
      }
    },
    { Header: "Name", accessor: "name" },
    {
      Header: "Phone Number", accessor: "phonenumber", Cell: ({ row }) => {
        const mobile = row.original.phonenumber;
        return (
          <span>{0 + "" + mobile}</span>
        );
      }
    },
    { Header: "Email", accessor: "email" },
    { Header: "Contact Person", accessor: "contactperson" },
    { Header: "Region", accessor: "region", width: '50px' },
    {
      Header: "Action",
      accessor: "",
      Cell: ({ row }) => {
        const value = row.original.supplierid;
        return (
          <Dropdown  >
            <Dropdown.Toggle variant="light" id="archives-dropdown">
              <MoreVertIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu className="m-0 p-0 bg-white">
              <Dropdown.Item className='text-primary text-capitalize' onClick={() => editController(value)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5 18.89H6.41421L15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89ZM21 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L9.24264 18.89H21V20.89ZM15.7279 6.74785L17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785Z"></path></svg>
                <span className='mx-2 mt-1'> Edit supplier </span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => router.push(`/supplier/preview?supplierid=${value}`)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 6H21V18H3V6ZM2 4C1.44772 4 1 4.44772 1 5V19C1 19.5523 1.44772 20 2 20H22C22.5523 20 23 19.5523 23 19V5C23 4.44772 22.5523 4 22 4H2ZM13 8H19V10H13V8ZM18 12H13V14H18V12ZM10.5 10C10.5 11.3807 9.38071 12.5 8 12.5C6.61929 12.5 5.5 11.3807 5.5 10C5.5 8.61929 6.61929 7.5 8 7.5C9.38071 7.5 10.5 8.61929 10.5 10ZM8 13.5C6.067 13.5 4.5 15.067 4.5 17H11.5C11.5 15.067 9.933 13.5 8 13.5Z"></path></svg>
                <span className='mx-2 mt-1'>  view Details </span>
              </Dropdown.Item>
              <Dropdown.Item color='danger' className='text-danger' onClick={(e) => deleteController(e, value)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path></svg>
                <span className='mx-2 mt-1'>   Delete supplier</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <TableDisplay data={rawdata} column={columns} styling={"ttable  table"} filtering={true} showpage={false} />
    </>
  );
}


