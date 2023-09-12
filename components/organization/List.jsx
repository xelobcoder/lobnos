import React, { useState, useEffect } from 'react';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, deleteOrganization } from '../Auth/customFetch';
import { Button, IconButton } from '@mui/material';
import { Add, DeleteOutlineOutlined, Edit, Tab, Visibility, VisibilityIcon } from '@mui/icons-material';
import Link from 'next/link';

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
          <IconButton edge='start' size='small' color='primary'>
            <Edit />
          </IconButton>
          <IconButton edge='start' size='small' sx={{ color: 'green' }}>
            <Visibility />
          </IconButton>
          <IconButton edge='start' size='small' sx={{ color: 'red' }} onClick={(e) => deleteOrganization(row.original.ID, getOrganizationData)}>
            <DeleteOutlineOutlined />
          </IconButton>
        </span>
      }
    }
  ]


  const getOrganizationData = function () {
    customFetch('organizations/details')
      .then((response) => {
        const { statusCode, status, records } = response;
        statusCode == 200 && status == 'success' ?
          setOrganization(records) :
          setOrganization([])
      })
      .catch((err) => setOrganization([]))
  }

  useEffect(() => {
    getOrganizationData();
  }, [])

  return (
    <>
      <div className='d-flex justify-content-end m-2'>
        <Link href={'/organization/neworganization'}>
          <button className='btn btn-primary border-none mt-2 '>
            <Add />
            new organization
          </button>
        </Link>
      </div>
      <TableDisplay column={columns} data={organization} filtering={true} />
    </>
  )
}
