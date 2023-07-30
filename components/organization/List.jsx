import React, { useState, useEffect } from 'react';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch } from '../Auth/customFetch';
import { Button, IconButton } from '@mui/material';
import { DeleteOutlineOutlined, Tab, Visibility, VisibilityIcon } from '@mui/icons-material';

export default function OrganizationList() {
  const [organization, setOrganization] = useState([]);

  const columns = [
    {
      Header: 'organization',
      accessor: 'NAME'
    },
    {
      Header: 'Location',
      accessor: 'LOCATION'
    },
    {
      Header: 'Contact',
      accessor: 'MOBILENUMBER'
    }, {
      Header: 'Email',
      accessor: 'EMAIL'
    },
    {
      Header: 'Region',
      accessor: 'REGION'
    },
    {
      Header: 'District',
      accessor: 'DISTRICT'
    },
    {
      Header: 'details',
      accessor: 'viewmore', Cell: ({ row }) => {
        return <span>
          <IconButton edge='start' size='small' sx={{ color: 'green' }}>
            <Visibility />
          </IconButton>
          <IconButton edge='start' size='small' sx={{ color: 'red' }}>
            <DeleteOutlineOutlined />
          </IconButton>
        </span>
      }
    }
  ]

  useEffect(() => {
    customFetch('organizations/details')
      .then((response) => {
        const { statusCode, status, records } = response;
        statusCode == 200 && status == 'success' ?
          setOrganization(records) :
          setOrganization([])
      })
      .catch((err) => setOrganization([]))
  }, [])

  return (
    <>
      <TableDisplay column={columns}  data={organization} filtering={true} />
    </>
  )
}
