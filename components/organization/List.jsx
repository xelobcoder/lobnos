import React, { useState, useEffect } from 'react';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, deleteOrganization } from '../Auth/customFetch';
import { IconButton } from '@mui/material';
import { DeleteOutlineOutlined, Edit } from '@mui/icons-material';
import { useRouter } from 'next/router';




export default function OrganizationList() {
  const [organization, setOrganization] = useState([]);
  const router = useRouter();

  const handleEditing = async (id) => { router.push(`/organization/${id}/basicinfo`) }

  const columns = [
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
      Header: 'action',
      accessor: 'viewmore', Cell: ({ row }) => {
        return <span>
          <IconButton edge='start' size='small' sx={{ color: 'blue' }} onClick={(ev) => {handleEditing(row.original.id)}}>
            <Edit />
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
