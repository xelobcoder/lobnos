import React from 'react'
import Header from '../../components/header';
import ADD_STOCK_INVENTORY from '../../components/inventory/addstock';
import InventroyHeader from '../../components/inventroyHeader';

export default function INVENTORY_MAIN_PAGE() {
 return (
  <div>
   <ADD_STOCK_INVENTORY />
  </div>
 )
}



INVENTORY_MAIN_PAGE.getLayout = function getLayout(page) {
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