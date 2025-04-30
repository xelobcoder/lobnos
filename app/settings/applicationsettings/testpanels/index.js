import  { useEffect, useState } from 'react';
import { TestPanelProvider } from '../../../components/testpanel/contextTest';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { useRouter } from 'next/navigation';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

export default function TESTPANEL() {
  const [testData, setTestData] = useState([]);

  const router = useRouter();

  // using react table to display data
  const columns = [{
    Header: 'ID',
    accessor: 'id'
  },
  {
    Header: 'NAME',
    accessor: 'name',
    Cell: function ({ row }) {
      return <span className='text-success'>
        {row.original.name}
      </span>
    }
  },
  {
    Header: 'CATEGORY',
    accessor: 'category'
  },
  {
    Header: 'DESCRIPTION',
    accessor: 'description'
  },
  {
    Header: 'PRICE',
    accessor: 'price'
  },
  {
    Header: 'ADDED ON',
    accessor: 'created_on',
    Cell: ({ row }) => {
      return <span>{row.original?.created_on.slice(0, 10)}</span>
    }
  },
  {
    Header: 'SAMPLE',
    accessor: 'sample'
  },
  {
    Header: 'CONTAINER',
    accessor: 'sample_container'
  },
  {
    Header: 'QTY',
    accessor: 'qty_required'
  },
  {
    Header: 'UNIT',
    accessor: 'unit'
  },
  {
    Header: 'ACTION',
    Cell: function ({ row }) {
      return (
        <div>
          <button className='btn btn-sm btn-primary'
            onClick={(e) => { router.push(`/settings/testpanel/updatetest/${row.original.id}`) }}>
            update
          </button>
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




