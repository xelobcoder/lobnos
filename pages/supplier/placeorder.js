import React from 'react'
import PLACE_ORDER from '../../components/inventory/placeorder';
import InventroyHeader from '../../components/inventroyHeader';
import Header from '../../components/header';
import CART_DISPLAY_COMPONENT from '../../components/inventory/cartDisplay';
import TopMessage from '../../components/accessories/TopMessage';
import { Suspense } from 'react';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import { customFetch } from '../../components/Auth/customFetch';

export default function PLACE_ORDER_PAGE({ datasource, suppliers }) {
  const [source, setDatasource] = React.useState(datasource);
  const [cart, setCart] = React.useState({
    data: [],
    display: false
  });
  const [search, setSearch] = React.useState('');

  // handle messages view begin ---states
  const [messageshow, setMessageshow] = React.useState(false);
  const [message, setMessage] = React.useState({
    type: '',
    message: '',
    display: false
  });

  const viewMessageTimer = () => {
    setTimeout(() => {
      setMessageshow(false);
      setMessage({
        type: '',
        message: '',
        display: false
      })
    }, 2000)
  }
  // handle messages view end ---states


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


  const placeOrderHandler = (e, stockid) => {
    e.preventDefault();
    // get the cart data
    // filter cartdata using the stockid
    const filtered = cart.data.filter(item => parseInt(item.stockid) === parseInt(stockid));
    // get the first data 
    const order = filtered[0];
    // send the data 
    const sendData = async function () {
      let endpoint = `http://localhost:5000/api/v1/orders`;
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
        },
        body: JSON.stringify(order)
      })

      let data = await response.json();

      console.log(data);

      // when successfully placed removwe the item from the cart
      if (data.status === 'success' && data.message === 'order placed successfully') {
        removeCartHandler(e, stockid);
        setMessageshow(true);
        setMessage({
          type: 'success',
          message: data.message,
          display: true
        })
      } else if
        (data.status == 'success' && data.message === 'order already exist') {
        setMessageshow(true);
        setMessage({
          type: 'warning',
          message: data.info,
          display: true
        })
      } else {
        setMessageshow(true);
        setMessage({
          type: 'danger',
          message: data.message,
          display: true
        })
      }
    }

    sendData()

  }

  const searchHandler = async function (ev) {
    const { value } = ev.target;
    setSearch(value)
    if (value.length > 0) {
      let filtered = source.filter((item, index) => {
       return new String(item.name).includes(value)
      })

      if (filtered.length > 0) {
        setDatasource(filtered)
      }
      else return ;
    } else {
      setDatasource(datasource)
    }

    console.log(source,datasource)
  }

  return (
    <>
      <div>
        {
          messageshow ? <TopMessage message={message.message} type={message.type} display={message.display} messageTimer={viewMessageTimer} /> : null
        }
        <div id='place-order-search' >
          <input className='custom-input' type="text"
            onChange={(ev) => searchHandler(ev)}
            placeholder='search for a product here' value={search} />
          <button
            onClick={(ev) => { !cart.display ? setCart({ ...cart, display: true }) : setCart({ ...cart, display: false }) }}
            className='btn btn-sm btn-primary'>cart {cart.data.length}</button>
        </div>
        {
          cart.display ? <CART_DISPLAY_COMPONENT
            removeCartHandler={removeCartHandler}
            placeOrderHandler={placeOrderHandler}
            data={cart.data} /> :
            <PLACE_ORDER source={source} cartHandler={cartHandler} suppliers={suppliers} />
        }
      </div>
    </>
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
  // Fetch data from external API
  const orders = await customFetch('orders')

  // fetch abput the suppliers 
  const suppliers = await customFetch('suppliers')

  // Pass data to the page via props

  if (orders.status === 'success' && suppliers.status === 'success') {
    return {
      props: {
        datasource: orders.result,
        suppliers:  suppliers.result
      }, // will be passed to the page component as props
    }
  }

  if (!result && status != 'success') {
    return {
      notFound: true
    }
  }
}