import React from 'react'
import PLACE_ORDER from '../../components/inventory/placeorder';
import InventroyHeader from '../../components/inventroyHeader';
import Header from '../../components/header';
import CART_DISPLAY_COMPONENT from '../../components/inventory/cartDisplay';

export default function PLACE_ORDER_PAGE({ datasource }) {
 const [source, setDatasource] = React.useState(datasource );
 const [cart, setCart] = React.useState({
  data: [],
  display: false
 });
 const [search, setSearch] = React.useState('');

console.log(datasource)
 const cartHandler = (e, clicked) => {
  e.preventDefault();
  // ensure that the clicked item is not already in the cart
  const isAlreadyInCart = cart.data.some(item => item.stockid === clicked.stockid);
  const isNotEmpty = clicked.quantity !== '' && clicked.supplier !== '';

  if (isAlreadyInCart) {
   alert('item already in cart');
   return;
  }

  if (!isNotEmpty) {
   alert('please fill all fields');
   return;
  }

  if (clicked.quantity == 0 || clicked.quantity < 1) {
   alert('quantity must be greater than 0');
   return;
  }

  if (isNotEmpty && !isAlreadyInCart) {
   setCart({
    data: [...cart.data, clicked],
    display: false
   })
  }
 }


 
// handler for removing an item from the cart
const removeCartHandler = (e, stockid) => {
 e.preventDefault();
 const newCart = cart.data.filter(item => item.stockid !== stockid);
 setCart({
  data: newCart,
  display: true
 })
}

// handler for placing an order

 return (
  <div>
   <div id='place-order-search' >
    <input className='custom-input' type="text" placeholder='search for a product here' />
    <button 
     onClick={(ev) => {!cart.display ? setCart({ ...cart, display: true }) : setCart({ ...cart, display: false })}}
    className='btn btn-sm btn-primary'>cart {cart.data.length}</button>
   </div>
   {
    cart.display ? <CART_DISPLAY_COMPONENT 
    removeCartHandler={removeCartHandler}
     data={cart.data} /> :
    <PLACE_ORDER source={source} cartHandler={cartHandler} />
   }
  </div>
 )
}





PLACE_ORDER_PAGE.getLayout = function getLayout(page) {
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



export async function getServerSideProps(context) {
 const response = await fetch('http://localhost:5000/api/v1/stock');
 const data = await response.json();
 const { status, result } = data;
 if (status === 'success') {
  return {
   props: {
    datasource: result
   }
  }
 }
 else {
  return {
   props: {
    datasource: []
   }
  }
 }
}