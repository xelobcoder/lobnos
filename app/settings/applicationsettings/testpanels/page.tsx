"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customFetch } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

export default function TESTPANEL() {
  const [testData, setTestData] = useState([]);

  const router = useRouter();

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
    try {
      const response = await customFetch('testpanel/list');
      const { statusCode, status, data } = response;
      setTestData(data)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { getTestPanel() }, [])

  return (
    <div>
      <PrimeTable data={testData} column={columns} serverSideFiltering={false} filtering={false}
        handleSeverSideProcessing={null} />
    </div>
  )
}




