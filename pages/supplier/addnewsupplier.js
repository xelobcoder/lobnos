import { useEffect, useState } from 'react';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';
import { pushNewSupplierInformation } from '../../components/suppliers/util';
import { ToastContainer, toast } from 'react-toastify';
import Pagination from '../../components/accessories/pagination';
import { useSearchParams } from 'next/navigation';

export default function SUPPLY() {
  const [rawdata, setRawdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setisEditing] = useState(false);
  const [editingid, setEditid] = useState(null);
  const userid = useSearchParams().get("csvid");
  const gen = useSearchParams().get("gen");



  useEffect(() => {
    if (gen && userid) {
      const supplierid = userid.slice(gen);
      setEditid(parseInt(supplierid));
      setisEditing(true);
  }
},[gen,userid])

  
  
  const handleSubmit = async (newsupplier) => {
    const method = isEditing === true ? 'PUT' : 'POST';
    let outcome = await pushNewSupplierInformation(method, newsupplier, toast, editingid);
    if (!outcome) toast.error("operation failed");
  }

  const reset = () => { setEditid(null); setisEditing(false); }





  return (
    <>
      <SupplierLayout>
        <ToastContainer theme='colored' position='top-center' className='text-sm'/>
        <ADD_NEW_SUPPLIER
          reset={reset}
          supplierid={editingid}
          isEditing={isEditing}
          handleAddNew={handleSubmit} />
        <i className="bi bi-shield-lock-fill"></i>
      </SupplierLayout>
    </>
  )
}

