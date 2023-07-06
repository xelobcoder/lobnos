import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { Tooltip, Button } from '@mui/material';
import { DeleteForever, Edit, EditAttributes, EditNotifications } from '@mui/icons-material';
export default function UserList({ editcall }) {
  const [users, setUser] = useState([]);

  const getUsers = async () => {
    const response = await customFetch('logins');
    const { statusCode, message, result } = response;
    if (statusCode === 200) {
      setUser(result);
    }
  }
  useEffect(() => {
    getUsers();
  }, []);


  // We create columns for the table
  const columns = [
    {
      Header: 'username',
      accessor: 'USERNAME',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'Role',
      accessor: 'ROLE',
    },
    {
      Header: 'permissions',
      Cell: function ({ row }) {
        const { original } = row;
        const { DELETEV, EDITV, READV, CREATEV } = original;
        return (
          <div>
            <input style={{ marginLeft: '10px' }} type='checkbox' value='read' checked={READV == 'TRUE' ? true : false} /> read
            <input style={{ marginLeft: '10px' }} type='checkbox' value='edit' checked={EDITV == 'TRUE' ? true : false} /> edit
            <input style={{ marginLeft: '10px' }} type='checkbox' value='create' checked={CREATEV == 'TRUE' ? true : false} /> create
            <input style={{ marginLeft: '10px' }} type='checkbox' value='delete' checked={DELETEV == 'TRUE' ? true : false} /> delete
          </div>
        )
      }
    },
    {
      Header: 'Action',
      Cell: function ({ row }) {
        const { original } = row;
        const { id } = original;
        return (
          <div>
            <Button size='small' color='primary'  variant='text'>edit</Button>
            <Button size='small' color='error'>delete</Button>
          </div>
        )
      }
    }
  ];
  return (
    <>
      <div>
        <TableDisplay column={columns} data={users} />
      </div>
    </>
  )
}
