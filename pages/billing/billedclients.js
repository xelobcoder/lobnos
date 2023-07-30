import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DeleteForever, Edit, EditAttributes, EditOffOutlined, Update } from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';
import TableDisplay from '../../components/accessories/TableDisplay';
import { Button } from '@mui/material';

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
        <div style={{ display: 'grid', gridTemplateColumns: '50% auto', marginTop: '6px', gridGap: '10px' }}>
          <Button variant='contained' color='error' size='small' startIcon={<DeleteForever fontSize='medium' />}>
            del
          </Button>
          <Button variant='contained' size='small'
           startIcon={<Edit/>}
          onClick={() => updateFunction(params)}>
            edit
          </Button>
        </div>
      </>
    );
  };


  const dateCellRenderer = (params) => (params.row.values.DATE.slice(0, 10))


  const columns = [
    { Header: 'BILLINGID', accessor: 'BILLINGID', checkboxSelection: true },
    { Header: 'PATIENTID', accessor: 'PATIENTID' },
    {Header:'FULLNAME',accessor:'FULLNAME'},
    {
      Header: 'DATE', accessor: 'DATE', Cell: dateCellRenderer
    },
    { Header: 'PAID', accessor: 'PAID' },
    { Header: 'PAYABLE', accessor: 'PAYABLE' },
    { Header: 'DISCOUNT', accessor: 'DISCOUNT' },
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
