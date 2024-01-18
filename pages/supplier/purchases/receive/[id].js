import React, { useState, useEffect } from 'react';
import ReceivedOrderModal from '../../../../components/inventory/ReceivedOrderModal';
import SupplierLayout from '../../../../components/inventory/SupplierLayout';
import { useRouter } from 'next/router';
import Loader from '../../../../components/accessories/Loader';
import { customFetch } from '../../../../components/Auth/customFetch';
import { ToastContainer, toast } from 'react-toastify';
export default function ReceiveOrdersPage() {
  const transactionid = useRouter().query.id;
  const [datasource, setDatasource] = useState([]);
  const [totalprice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const transformData = (data, stockBrands) => {
    if (Array.isArray(data) && data.length > 0) {
      const nw = data.map((item, index) => {
        if (stockBrands.length > 0) {
          item.stockbrands = stockBrands.filter((a, i) => { return a.stockid == item.stockid });
          item.brandid = 0;
          item.expirydate = '';
          item.batchnumber = '';
          item.receiveddate = '';
          item.status = 'incomplete';
        } else {
          item.stockbrands = [];
          toast.warning("Some stocks brands have not been added, kindly do so to continue", { autoClose: 3000 });
         }
         item.brandid = '';
        return item;
      })  
      return nw;
    }
    return [];
  }

  useEffect(() => {
    if (transactionid && typeof parseInt(transactionid) === 'number') {
      setLoading(true);
      customFetch(`orders?orderTransactionid=${transactionid}&&includebrands=${true}`)
        .then((data) => {
          const { stockBrands, products } = data?.result;
          let nw = transformData(products, stockBrands);
          setDatasource(nw);
          setLoading(false);
        } )
        .catch((err) => { setLoading(false); setDatasource([]); })
    }

    return () => {
      setLoading(true);
      setDatasource([]);
    }
  }, [transactionid]);

  const clearData = () => { setDatasource([]) };

  const handleChange = async function (e, name, index) {
    let value = e.target.value;
    let mapped = datasource.map((item, i) => { if (index == i) { item[name] = value }; return item })
    setDatasource(mapped);
  };

  const changePricing = function (ev) {
    setDatasource(datasource.map((item, index) => { return { ...item, pricing: ev.target.value } }))
  }

  console.log(datasource)

  return (
    <SupplierLayout>
      <ToastContainer/>
      {loading ?
        <Loader /> 
        :
        ( <ReceivedOrderModal clearData={clearData} data={datasource} changePricing={changePricing} setupdata={setDatasource} setTotal={setTotalPrice}
          handleChange={handleChange} totalprice={totalprice} />)
      }
    </SupplierLayout>
  )
}
