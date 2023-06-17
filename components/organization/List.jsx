import React, { useState, useEffect } from 'react';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch } from '../Auth/customFetch';
import { Button, IconButton } from '@mui/material';
import { Tab, Visibility, VisibilityIcon } from '@mui/icons-material';

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
      accessor: 'MOBILE_NUMBER'
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
          <IconButton edge='start' size='small' sx={{backgroundColor:'#d2f4d3'}}>
            <Visibility/>
          </IconButton>
        </span>
      }
    }
  ]

  useEffect(() => {
    customFetch('organizations/details')
      .then((response) => {
        const { statusCode, status, records } = response;
        if (statusCode == 200 && status == 'success') {
          setOrganization(records || [])
        }
      })
      .catch((err) => setOrganization([]))
  }, [])

  return (
    <>
      <TableDisplay column={columns} styling={'excel-table'} data={organization} filtering={true} />
    </>
  )
}
