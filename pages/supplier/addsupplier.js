import React from 'react';
import InventroyHeader from '../../components/inventroyHeader';
import Header from '../../components/header';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';


export default function ADD_SUPPLIER_PAGE() {


 return (
  <div>
   <ADD_NEW_SUPPLIER />
  </div>
 )
}



ADD_SUPPLIER_PAGE.getLayout = function (page) {
 return (
  <>
   <Header />
   <div className="wrapper">
    <div className="side">
     <InventroyHeader />
    </div>
    <div className="main" id='page-main-view'>
     {page}
    </div>
   </div>
  </>
 )
}