import { useEffect, useState } from 'react';
import SUPPLIERS_LIST from '../../components/suppliers/supllyList';
import { customPost, getDataAndUpdateState, updatePagination } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';
import Loader from '../../components/accessories/Loader';
import { pushNewSupplierInformation } from '../../components/suppliers/util';
import { ToastContainer, toast } from 'react-toastify';
import Pagination from '../../components/accessories/pagination';

export default function SUPPLY() {
  const [rawdata, setRawdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, count: 10 });
  const [load, setLoad] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [editingid, setEditid] = useState(null);


  useEffect(() => {
    getDataAndUpdateState(setRawdata, `suppliers?count=${query.count}&&page=${query.page}`, false, setLoading);
  }, [query.count, query.page])



  const deletehandler = async (id, supplierid) => {
   let confirmation = confirm(`Do you really want to delete supplier?`);
   if (!confirmation) return 
   else {
     try {
      const response = await customPost(`suppliers?supplierid=${supplierid}`, 'DELETE', {})
       const { status, message } = response;
       if (status === "success") {
         toast.success(message, { autoClose: 500 });
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
  const updatehandler = async (supplierid) => {
    if (!supplierid) return;
    setEditid(supplierid); setisEditing(true);
  }



  const handleSubmit = async (ev, newsupplier) => {
    ev.preventDefault();
    const method = isEditing === true ? 'PUT' : 'POST';
    const isNotEmpty = (Object.values(newsupplier).some((item, index) => (item == "" || item == " " || item == 0)));
    if (isNotEmpty === false) {
      let outcome = await pushNewSupplierInformation(method, newsupplier, toast, editingid);
      if (isEditing && outcome && editingid != null) {
        const prev = [...rawdata]
        const indexOf = prev.findIndex((item, index) => item.supplierid == editingid);
        prev[indexOf] = newsupplier;
        setRawdata(prev);
      } else {
        setRawdata([newsupplier, ...rawdata]);
      }
    } else {
      toast.error('Fill in all fields', { autoClose: 5000 });
    }
  }

  const reset = () => { setEditid(null); setisEditing(false); }


  const updatePage = (value) => {
    updatePagination(value, setQuery, query);
  }

  const renderingView = () => {
    if (loading) return <Loader />
    else {
      return (
        <section className='mx-2'>
          <SUPPLIERS_LIST rawdata={rawdata}
            editController={updatehandler}
            deleteController={deletehandler} />
          <div className='d-flex justify-content-center'>
            <Pagination updateFunction={updatePage} page={query.page} load={setLoad} />
          </div>
        </section>
      )
    }
  }


  return (
    <>
      <SupplierLayout>
        <ToastContainer />
        <ADD_NEW_SUPPLIER
          reset={reset}
          supplierid={editingid}
          isEditing={isEditing}
          handleAddNew={handleSubmit} />
        {renderingView()}
      </SupplierLayout>
    </>
  )
}

