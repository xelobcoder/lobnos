import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Edit } from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';
import TableDisplay from '../../components/accessories/TableDisplay';
import { Button } from '@mui/material';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Billedclients() {
  const [billedclients, setBilledclients] = React.useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { result } = await customFetch('billedclients');
        setBilledclients(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const outstandingCellRenderer = (params) => {
    return (
      <>
        {parseInt(params.value) > 0 || parseInt(params.value) < 0 ? (
          <span className='text-danger bold' style={{ fontWeight: 900 }}>{params.value}</span>
        ) : (
          <span className='text-success'>{params.value}</span>
        )}
      </>
    );
  };

  const router = useRouter();
  const updateFunction = (params) => {
    const { row } = params;
    router.push(`/billing/updatebilling?billingid=${row.values.BILLINGID}`);
  };

  const actionCellRenderer = (params) => {
    return (
      <>
        <div>
          <button className='btn btn-sm btn-primary'
            onClick={() => updateFunction(params)}>
            <Edit fontSize='small' />  update
          </button>
        </div>
      </>
    );
  };


  const dateCellRenderer = (params) => (params.row.values.DATE.slice(0, 10))


  const columns = [
    {
      Header: 'Date', accessor: 'DATE', Cell: dateCellRenderer
    },
    { Header: 'Patientid', accessor: 'PATIENTID' },
    { Header: 'Billingid', accessor: 'BILLINGID', checkboxSelection: true },
    { Header: 'fullname', accessor: 'FULLNAME' },
    { Header: 'payable', accessor: 'PAYABLE' },
    { Header: 'AMOUNT PAID', accessor: 'PAID' },
    { Header: 'discount', accessor: 'DISCOUNT' },
    { Header: 'debt', accessor: 'OUTSTANDING', Cell: outstandingCellRenderer },
    { Header: 'payment mode', accessor: 'PaymentMode' },
    { Header: 'action', accessor: 'ACTION', Cell: actionCellRenderer, width: 300 },
  ]

  console.log(billedclients)


  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <TableDisplay data={billedclients} column={columns} filtering={true} />
      </SettingsLayout>
    </>
  );
}
