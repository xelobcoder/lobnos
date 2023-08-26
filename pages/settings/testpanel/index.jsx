import React, { Suspense, useEffect, useState } from 'react';
import { TestPanelProvider } from '../../../components/testpanel/contextTest';
import TestPanelLayout from '../../../components/testpanel/TestPanelLayout';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { useRouter } from 'next/router';

export default function TESTPANEL() {
  const [testData, setTestData] = useState([]);

  const router = useRouter();

  // using react table to display data
  const columns = [{
    Header: 'ID',
    accessor: 'ID'
  },
  {
    Header: 'NAME',
    accessor: 'NAME',
    Cell: function ({ row }) {
      return <span className='text-success'>
        {row.original.NAME}
      </span>
    }
  },
  {
    Header: 'CATEGORY',
    accessor: 'CATEGORY'
  },
  {
    Header: 'DESCRIPTION',
    accessor: 'DESCRIPTION'
  },
  {
    Header: 'PRICE',
    accessor: 'PRICE'
  },
  {
    Header: 'ADDED ON',
    accessor: 'CREATED_ON'
  },
  {
    Header: 'SAMPLE',
    accessor: 'SAMPLE'
  },
  {
    Header: 'CONTAINER',
    accessor: 'SAMPLE_CONTAINER'
  },
  {
    Header: 'UNIT',
    accessor: 'UNIT'
  },
  {
    Header: 'QTY',
    accessor: 'QTY_REQUIRED'
  },
  {
    Header: 'ACTION',
    Cell: function ({ row }) {
      return (
        <div>
          <Button variant='contained' size='small' 
          onClick={(e) => {
            router.push(`/settings/testpanel/updatetest/${row.original.ID}`)
          }}
          >
            update
          </Button>
          {/* <Button color='error' onClick={() => deleteHandler(row.original.ID)}>
            Delete
          </Button> */}
        </div>
      )
    }
  }
  ]

  const deleteHandler = async (e) => {
    const response = await customPost(`testpanel/list?id=${e}`, 'DELETE', { id: e });

    const { statusCode, status } = response;

    if (statusCode === 200 && status === 'success') {
      alert('deleted successfully');
      // remove deleted item from the table
      const filteredData = testData.filter(item => item.ID !== e);
      setTestData(filteredData);
    }

    if (response?.err || statusCode === 401 || statusCode === 500 || status === 'error' || status == 'warning') {
      alert(response?.message)
    }

  }

  const getTestPanel = async function () {
    const response = await customFetch('testpanel/list');
    const { statusCode, status, data } = response;
    setTestData(data)
  }

  useEffect(() => { getTestPanel() }, [])

  return (
    <>
      <TestPanelProvider>
        <TestPanelLayout>
          <Suspense>
            <TableDisplay data={testData} column={columns} />
          </Suspense>
        </TestPanelLayout>
      </TestPanelProvider>
    </>
  )
}




