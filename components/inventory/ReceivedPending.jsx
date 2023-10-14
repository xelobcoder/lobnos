import React, { useState, useEffect } from 'react'
import SettingsLayout from '../settingsComponents/SettingsLayout';
import DepartmentLevelSidebar from './DepartmentLevelSidebar';
import ISLOADING from '../isLoading';
import { useRouter } from 'next/router';
import { customData } from '../Auth/customFetch';
import TableDisplay from '../accessories/TableDisplay';
export default function ReceivedPending({ type = 'pending' }) {
  const departmentId = useRouter().query.id;
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    if (departmentId) {
      try {
        customData(`departments/requisitions?id=${departmentId}&&type=${type}`, setStocks);
        setLoading(false);
      } catch (err) {
        setStocks([])
      }
    }
  }, [departmentId, type]);


  const columns = [
    {
      Header: 'Date Requested',
      accessor: 'date',
      Cell: ({ row }) => <div>{row.original.date.slice(0, 10)}</div>,
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => (
        <div>
          {row.original.status === 'pending' && (<div >
            <span className='bg-warning px-2 br-7 py-1 text-white'>Pending</span>
          </div>)}
          {row.original.status === 'approved' && (<div>
            <span className='bg-success px-2 br-7 py-1 text-white'>
              Approved
            </span></div>)}
        </div>
      ),
    },
    {
      Header: 'Consumption Unit',
      accessor: 'comsumptionunit',
    },
    {
      Header: 'Qty Requested',
      accessor: 'quantity_requested',
    },
    {
      Header: 'Qty Approved',
      accessor: 'quantity_approved',
      Cell: ({ row }) => (
        <>
          {row.original.quantity_approved == null ? (
            <div className='-lims-text-color'>Not yet</div>
          ) : (
            row.original.quantity_approved
          )}
        </>
      ),
    },
  ];
  return (
    <>
      <SettingsLayout sidebar={<DepartmentLevelSidebar />}>
        {loading && <ISLOADING />}
        <TableDisplay column={columns} data={stocks} filtering={true} />)
      </SettingsLayout>
    </>
  )
}
