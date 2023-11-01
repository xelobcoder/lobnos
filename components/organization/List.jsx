import React, { useState, useEffect } from 'react';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, deleteOrganization } from '../Auth/customFetch';
import { IconButton, Input } from '@mui/material';
import { Add, DeleteOutlineOutlined, Edit, Visibility } from '@mui/icons-material';
import Link from 'next/link';

export default function OrganizationList() {
  const [organization, setOrganization] = useState([]);

  const columns = [
    {
      Header: '#',
      Cell: function ({ row }) {
        return (<Input type='checkbox' />)
      }
    },
    {
      Header: 'organization',
      accessor: 'name'
    },
    {
      Header: 'Location',
      accessor: 'location'
    },
    {
      Header: 'Contact',
      accessor: 'mobile'
    }, {
      Header: 'Email',
      accessor: 'email'
    },
    {
      Header: 'Region',
      accessor: 'region'
    },
    {
      Header: 'address',
      accessor: 'address'
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
        const { statusCode, status, result } = response;
        statusCode == 200 && status == 'success' ?
          setOrganization(result) :
          setOrganization([])
      })
      .catch((err) => setOrganization([]))
  }

  useEffect(() => {
    getOrganizationData();
  }, [])

  return (
    <>
      <TableDisplay column={columns} data={organization} filtering={true} />
    </>
  )
}
