import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SupllierProfile from '../../components/suppliers/SupllierProfile';
import { customFetch } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import Loader from '../../components/accessories/Loader';


export default function SINGLE_SUPPLIER() {
  const id = useSearchParams().get("supplierid");
  const [pendingorders, setPending] = useState(0);
  const [supplier, setSupplier] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      let fetchers = Promise.all([customFetch(`suppliers?supplierid=${id}`),
      customFetch(`supplier/status/unforfilled?supplierid=${id}&&status=count`)])
        .then((data) => {
          const [supplier, pendingorders] = data;
          setSupplier(supplier?.result[0]);
          setPending(pendingorders?.count);
        })
        .catch((data) => setSupplier([]))
        .finally(() => setLoading(false));
    }
  }, [id]);




  const commodities = [
    
  ]



  return (
    <SupplierLayout>
      <div className='d-flex p-2'>
            <button type="button" style={{ marginRight: '10px' }}
              className="btn btn-primary btn-sm">
          pending orders
          <span className="badge text-bg-secondary ">{pendingorders}</span>
            </button>
            <button type="button"
              className="btn btn-primary position-relative btn-sm">
              Orders delivered
              <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
            <span className="visually-hidden">New alerts</span>
          </span>
        </button>
        <button style={{ marginLeft: '10px' }} className='btn btn-danger btn-sm'>Raise issue</button>
        <button className='btn btn-primary mx-2 btn-sm'>
          commodities
        </button>
          </div>
          <div className='supplier-information-page'>
            <div className='wrapper'>
              <div className='information'>
            {loading ? <Loader /> : <SupllierProfile datasource={supplier} />} 
              </div>
              <div className='transaction'>

              </div>
            </div>

            <h1>Transactions</h1>
            <div className='m-10'>
            </div>
      </div>
    </SupplierLayout>
  )
}
