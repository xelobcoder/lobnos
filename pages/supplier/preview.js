import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SupllierProfile from '../../components/suppliers/SupllierProfile';
import dynamic from 'next/dynamic';
import { customFetch } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';

const EditorJS = dynamic(() => import('../../components/accessories/markdownEditor'), { ssr: false })

export default function SINGLE_SUPPLIER() {
  const id = useSearchParams().get("supplierid");
  const [supplier, setSupplier] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const supplier_information = async function () {
        try {
          const data = await customFetch(`suppliers?supplierid=${id}`)
          const { status, result, message } = data;
          if (status === 200 && message === "success" && result !== null && result !== undefined && result.length > 0 && result[0] !== null) {
            setSupplier(result[0]);
          } 
          setLoading(false);
        }
        catch (error) {
          console.log(error);
        }
      }

      supplier_information();
    }
  }, [id]);



  const commodities = [
    
  ]



  return (
    <SupplierLayout>
      <div className='d-flex p-2'>
            <button type="button" style={{ marginRight: '10px' }}
              className="btn btn-primary btn-sm">
              Orders
              <span className="badge text-bg-secondary ">4</span>
            </button>
            <button type="button"
              className="btn btn-primary position-relative btn-sm">
              Orders delivered
              <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>
            <button style={{ marginLeft: '10px' }} className='btn btn-danger btn-sm'>Raise issue</button>
          </div>
          <div className='supplier-information-page'>
            <div className='wrapper'>
              <div className='information'>
                <SupllierProfile datasource={supplier} />
              </div>
              <div className='transaction'>
              {/* <CommoditiesList datasource={commodities} /> */}
              <h1>Yet to be determined</h1>
              </div>
            </div>

            <h1>Transactions</h1>
            <div className='m-10'>
            </div>
      </div>
    </SupplierLayout>
  )
}
