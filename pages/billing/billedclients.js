import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';
import Loader from '../../components/accessories/Loader';
import TableDisplay from '../../components/accessories/TableDisplay';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Billedclients() {
  const [isloading, setLoading] = useState(true);
  const [billedclients, setBilledclients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { result } = await customFetch('billedclients');
        setBilledclients(result);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setBilledclients([]);
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



  const renderer = () => {
    if (isloading) return <Loader />
    else return <TableDisplay data={billedclients} column={columns} filtering={true} />
  }


  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        {renderer()}
      </SettingsLayout>
    </>
  );
}
