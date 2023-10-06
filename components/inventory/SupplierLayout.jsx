import React from 'react';
import SupplierTopNav from '../../components/supplierTopNav';

export default function SupplierLayout({ children }) {
  return (
    <>
      <div style={{backgroundColor:'#00224f17',height:'100vh'}}>
        <SupplierTopNav />
        {children}
      </div>
    </>
  )
}
