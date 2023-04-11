import React, { Suspense } from 'react';
import { TestPanelProvider } from '../../components/testpanel/contextTest';
import TestPanelLayout from '../../components/testpanel/TestPanelLayout';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../components/accessories/TableDisplay';

export default function TESTPANEL({ data }) {
  const [testData, setTestData] = React.useState(data);
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
    Cell: function({row}){
      return (
        <div>
          <Button>
            edit
          </Button>
          <Button  color='error' onClick={() => deleteHandler(row.original.ID)}>
            Delete
          </Button>
        </div>
      )
    }
  }
]

const deleteHandler = async (e) => {
  const response = await customPost(`testpanel/list?id=${e}`, 'DELETE',{ id: e });
  
  const { statusCode, status} = response;

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