import React, { useState, useEffect } from 'react';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { Button } from '@mui/material';
import Link from 'next/link';
export default function UserList({ users, handleDelete, editUser,activateUser }) {




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
    { Header: "activation status", accessor: "ACTIVATION",
  Cell: function ({ row }) {
    const { original } = row;
    const { ACTIVATION } = original;
    return (
      <div>
        {ACTIVATION === 1 ? (
          <div size="small" className="text-success" variant="text">
            active
          </div>
        ) : (
          <div size="small" className="text-danger" variant="text">
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
            <Button size="small" color="success" variant="text">
              <Link
                style={{ textTransform: "capitalize", color: "green" }}
                href={`/authentication/permissions/${EMPLOYEEID}`}
              >
                view or update permissions
              </Link>
            </Button>
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
              size="small"
              color="primary"
              sx={{ textTransform: "capitalize" }}
              onClick={() => editUser(EMPLOYEEID)}
              variant="text"
            >
              edit
            </Button>
            <Button
              sx={{ textTransform: "capitalize" }}
              size="small"
              color="error"
              onClick={() => handleDelete(EMPLOYEEID)}
            >
              delete
            </Button>
            <Button
              sx={{ textTransform: "capitalize" }}
              size="small"
              color={original.ACTIVATION === 1 ? "error" : "success"  }
              onClick={() => activateUser(EMPLOYEEID,original.ACTIVATION)}
            >
              {original.ACTIVATION === 1 ? "deactivate" : "activate"}
            </Button>
            <Button
              sx={{ textTransform: "capitalize" }}
              size="small"
              color="warning"
            >
              <Link href={`/authentication/updateinformation/${EMPLOYEEID}`}>
                advanced information entry
              </Link>
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
