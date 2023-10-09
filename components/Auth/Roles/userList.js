import React, { useState, useEffect } from 'react';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
export default function UserList({ users, handleDelete, editUser, activateUser, updateRefresh }) {
  const navigateTo = useRouter();



  // We create columns for the table
  const columns = [
    {
      Header: "username",
      accessor: "USERNAME",
    },
    {
      Header: "Email",
      accessor: "EMAIL",
    },
    {
      Header: "Role",
      accessor: "ROLE",
    },
    {
      Header: "status", accessor: "ACTIVATION",
      Cell: function ({ row }) {
        const { original } = row;
        const { ACTIVATION } = original;
        return (
          <div>
            {ACTIVATION === 1 ? (
              <div className="text-success" variant="text">
                active
              </div>
            ) : (
              <div className="text-danger" variant="text">
                inactive
              </div>
            )}
          </div>
        );
      }
    },
    {
      Header: "permissions",
      Cell: function ({ row }) {
        const { original } = row;
        const { EMPLOYEEID } = original;
        return (
          <div>
            <Link
              href={`/authentication/permissions/${EMPLOYEEID}`}>
              update permissions
            </Link>
          </div>
        );
      },
    },
    {
      Header: "Action",
      Cell: function ({ row }) {
        const { original } = row;
        const { EMPLOYEEID } = original;
        return (
          <div>
            <Button
              color="primary"
              sx={{ textTransform: "capitalize" }}
              onClick={() => { navigateTo.push(`/authentication/register?employeeid=${EMPLOYEEID}`) }}
              variant="text"
            >
              edit
            </Button>
            <Button
              sx={{ textTransform: "capitalize" }}
              color="error"
              onClick={() => handleDelete(EMPLOYEEID)}
            >
              delete
            </Button>
            <Button
              sx={{ textTransform: "capitalize" }}
              color={original.ACTIVATION === 1 ? "error" : "success"}
              onClick={() => activateUser(EMPLOYEEID, original.ACTIVATION, updateRefresh)}
            >
              {original.ACTIVATION === 1 ? "deactivate" : "activate"}
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div>
        <TableDisplay column={columns} data={users} filtering={true} />
      </div>
    </>
  )
}
