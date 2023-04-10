import React, { Suspense } from 'react';
import { TestPanelProvider } from '../../components/testpanel/contextTest';
import TestPanelLayout from '../../components/testpanel/TestPanelLayout';
import { customFetch } from '../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../components/accessories/TableDisplay';

export default function TESTPANEL({ data }) {
  // using react table to display data
  const columns = [{
    Header: 'ID',
    accessor: 'ID'
  },
  {
    Header: 'NAME',
    accessor: 'NAME'
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
    Header: 'CREATED_ON',
    accessor: 'CREATED_ON'
  },
  {
    Header:'SAMPLE',
    accessor: 'SAMPLE'
  },
  {
    Header: 'SAMPLE_CONTAINER',
    accessor: 'SAMPLE_CONTAINER'
  },
  {
    Header: 'UNIT',
    accessor: 'UNIT'
  },
  {
    Header: 'QTY_REQUIRED',
    accessor: 'QTY_REQUIRED'
  },
  {
    Header: 'ACTION',
    accessor: 'ACTION',
    Cell: () => {
      return (
        <div>
          <Button>
            edit
          </Button>
          <Button color='error'>
            Delete
          </Button>
        </div>
      )
    }
  }
]
  return (
    <>
      <TestPanelProvider>
        <TestPanelLayout>
          <Suspense>
            <TableDisplay data={data} column={columns} />
          </Suspense>
        </TestPanelLayout>
      </TestPanelProvider>
    </>
  )
}



export async function getServerSideProps(context) {
  const response = await customFetch('testpanel/list');
  const { statusCode, status, data } = response;

  if (statusCode === 200 && status === 'success') {
    return {
      props: {
        data: data
      }
    }
  }

  if (response?.err || statusCode === 401 || statusCode === 500) {
    return {
      props: {
        data: []
      }
    }
  }


}