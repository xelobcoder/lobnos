import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { DeleteForever, EditAttributes, EditOffOutlined, Update } from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';
import TableDisplay from '../../components/accessories/TableDisplay';

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
          <span className='text-danger'>{params.value}</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: '30% 30% 30%', marginTop: '6px', gridGap: '10px' }}>
          <DeleteForever color='error' fontSize='medium' />
          <EditOffOutlined color='info' />
          <Update variant='success' onClick={() => updateFunction(params)} />
        </div>
      </>
    );
  };


  const columns = [
    { Header: 'BILLINGID', accessor: 'BILLINGID', checkboxSelection: true },
    { Header: 'PATIENTID', accessor: 'PATIENTID' },
    { Header: 'DATE', accessor: 'DATE' },
    { Header: 'PAID_AMOUNT', accessor: 'PAID_AMOUNT' },
    { Header: 'PAYABLE', accessor: 'PAYABLE' },
    { Header: 'DISCOUNT', accessor: 'DISCOUNT' },
    { Header: 'UPDATED', accessor: 'UPDATED' },
    { Header: 'ORGANIZATION', accessor: 'ORGANIZATION' },
    { Header: 'CLINICIAN', accessor: 'CLINICIAN' },
    { Header: 'PAYMENT_MODE', accessor: 'PAYMENT_MODE' },
    { Header: 'TYPE', accessor: 'TYPE' },
    { Header: 'OUTSTANDING', accessor: 'OUTSTANDING', Cell: outstandingCellRenderer },
    { Header: 'ACTION', accessor: 'ACTION', Cell: actionCellRenderer, width: 300 },
  ]


  const cellClicked = (row) => {
    console.log(row.original);
  };

  return (
    <>
      <TableDisplay data={billedclients} column={columns} filtering={true} />
    </>
  );
}
