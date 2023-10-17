import React, { useState, useEffect } from 'react'
import SettingsLayout from '../settingsComponents/SettingsLayout';
import DepartmentLevelSidebar from './DepartmentLevelSidebar';
import ISLOADING from '../isLoading';
import { useRouter } from 'next/router';
import { customData } from '../Auth/customFetch';
import TableDisplay from '../accessories/TableDisplay';
import { ProgressBar } from 'react-bootstrap';
export default function ReceivedPending({ type = 'pending', caption }) {
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
          <ProgressBar variant={`${row.original.status === 'pending' ? 'warning' : 'primary'}`} now={row.original.status === 'pending' ? 35 : 70} />
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
        <h3>{caption}</h3>
        <TableDisplay column={columns} data={stocks} filtering={true} />
      </SettingsLayout>
    </>
  )
}
