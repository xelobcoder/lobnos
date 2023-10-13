import React, { useState, useEffect } from 'react';
import ReceivedOrderModal from '../../../../components/inventory/ReceivedOrderModal';
import SupplierLayout from '../../../../components/inventory/SupplierLayout';
import { useRouter } from 'next/router';
import { customData } from '../../../../components/Auth/customFetch';
export default function ReceiveOrdersPage() {
  const transactionid = useRouter().query.id;
  const [datasource, setDatasource] = useState([]);
  const [totalprice, setTotalPrice] = useState(0);

  useEffect(() => {
    customData(`orders?orderTransactionid=${transactionid}`, setDatasource);
  }, [transactionid])

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
      <ReceivedOrderModal clearData={clearData} data={datasource} changePricing={changePricing} setupdata={setDatasource} setTotal={setTotalPrice}
        handleChange={handleChange} totalprice={totalprice} />
    </SupplierLayout>
  )
}
