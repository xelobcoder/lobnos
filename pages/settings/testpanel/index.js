import React, { Suspense, useEffect, useState } from 'react';
import { TestPanelProvider } from '../../../components/testpanel/contextTest';
import TestPanelLayout from '../../../components/testpanel/TestPanelLayout';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { useRouter } from 'next/router';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

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
    accessor: 'CREATED_ON',
    Cell: ({ row }) => {
      return <span>{row.original?.CREATED_ON.slice(0, 10)}</span>
    }
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
    Header: 'QTY',
    accessor: 'QTY_REQUIRED'
  },
  {
    Header: 'UNIT',
    accessor: 'UNIT'
  },
  {
    Header: 'ACTION',
    Cell: function ({ row }) {
      return (
        <div>
          <Button variant='contained' size='small'
            onClick={(e) => { router.push(`/settings/testpanel/updatetest/${row.original.ID}`) }}>
            update
          </Button>
        </div>
      )
    }
  }
  ]


  const getTestPanel = async function () {
    const response = await customFetch('testpanel/list');
    const { statusCode, status, data } = response;
    setTestData(data)
  }

  useEffect(() => { getTestPanel() }, [])

  return (
    <>
      <TestPanelProvider>
        <MainSettingsLayoutView>
          <TableDisplay data={testData} column={columns} styling={""} />
        </MainSettingsLayoutView>
      </TestPanelProvider>
    </>
  )
}




