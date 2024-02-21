import { useEffect, useState } from 'react';
import SUPPLIERS_LIST from '../../components/suppliers/supllyList';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import ISLOADING from '../../components/isLoading';


export default function SUPPLY() {
  const [rawdata, setRawdata] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch data from server
  useEffect(() => {
    try {
      const getResponse = async () => {
        const response = await customFetch('suppliers')
        setRawdata(response?.result);
        setLoading(false);
      }
      getResponse()
    }
    catch (error) {
      console.log(error);
    }
  }, [])




  // constroller for deleting a supplier
  const deletehandler = async (id, supplierid) => {
   let confirmation = confirm(`Do you really want to delete supplier?`);
   if (!confirmation) return 
   else {
     try {
      const response = await customPost(`suppliers?supplierid=${supplierid}`, 'DELETE', {})
      const { status } = response;
      if (status === "success") {
        // remove the deleted item from the list using the supplierid
        const nwdata = rawdata.filter((item) => item.supplierid !== supplierid);
        setRawdata(nwdata);
      }
    } catch (error) {
      console.log(error)
    }
   }
  }

  // controller for updating a supplier
  const updatehandler = async (id, supplierid) => {
    // get data from raw data using the supplierid
    const data = rawdata.filter(item => item.supplierid === supplierid);
    // set the data to the update state
    // make the viewadd true
    setviewadd(true);
    setNewSupplier(data[0]);
    setButtonstatus('update');
  }


  return (
    <>
      <SupplierLayout>
        <div >
          {(rawdata.length == 0 && loading) && <ISLOADING />}
          {(rawdata.length > 0 && !loading) && (<SUPPLIERS_LIST rawdata={rawdata}
            editController={updatehandler}
            deleteController={deletehandler} />)}
        </div>
      </SupplierLayout>
    </>
  )
}

