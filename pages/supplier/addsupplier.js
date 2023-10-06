import React from 'react';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';
import SupplierLayout from '../../components/inventory/SupplierLayout';


export default function ADD_SUPPLIER_PAGE() {


  return (
    <>
      <SupplierLayout>
        <ADD_NEW_SUPPLIER />
      </SupplierLayout>
    </>
  )
}



