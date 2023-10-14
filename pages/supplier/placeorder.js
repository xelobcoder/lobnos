import React, { useState, useEffect } from 'react'
import PLACE_ORDER from '../../components/inventory/placeorder';
import CART_DISPLAY_COMPONENT from '../../components/inventory/cartDisplay';
import TopMessage from '../../components/accessories/TopMessage';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import { Shop, ShoppingBagOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';

export default function PLACE_ORDER_PAGE() {
  const [source, setDatasource] = useState([]);
  const [tempStorage, setTempStorage] = useState([]);
  const [suppliers, setSuppliers] = useState([])
  const [cart, setCart] = useState({
    data: [],
    display: false
  });
  const [search, setSearch] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from external API
        const orders = await customFetch('stock');
        // Fetch data about the suppliers
        const suppliersData = await customFetch('suppliers');
        // Handle the fetched data based on the response status
        if (orders.status === 'success' && suppliersData.status === 'success') {
          // Update the state or perform any other logic with the fetched data
          setDatasource(orders?.result);
          setTempStorage(orders?.result);
          setSuppliers(suppliersData?.result);
        } else {
          // Handle the case when the data fetching was not successful
        }
      } catch (error) {
        // Handle any errors that occurred during data fetching
      }
    };
    fetchData();
  }, []);


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


  const placeOrderHandler = (e) => {
    e.preventDefault();
    // transform data
    const cartdata = { stock: cart.data }
    const sendData = async function () {
      let data = await customPost('orders', 'POST', cartdata)
      // when successfully placed removwe the item from the cart
      if (data.status === 'success' && data.message === 'order placed successfully') {
        // removeCartHandler(e, stockid);
      }
      alert(data.message)
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
      else return;
    } else {
      setDatasource(tempStorage)
    }

  }

  return (
    <SupplierLayout>
      <div className='p-2'>
        <div style={{ display: 'grid', gridTemplateColumns: '90% auto' }}>
          <div>
            <input
            style={{width:'60%'}}
              className="custom-input"
              type="text"
              onChange={(ev) => searchHandler(ev)}
              placeholder="search for a product here"
              value={search}
            />
          </div>
          {source.length > 0 && (
            <Button
              onClick={(ev) => {
                !cart.display
                  ? setCart({ ...cart, display: true })
                  : setCart({ ...cart, display: false });
              }}
              className="btn btn-sm btn-primary mb-3"
            >
              <ShoppingBagOutlined fontSize='large' />
              cart {cart.data.length}
            </Button>
          )}
        </div>
        {cart.display ? (
          <CART_DISPLAY_COMPONENT
            removeCartHandler={removeCartHandler}
            placeOrderHandler={placeOrderHandler}
            data={cart.data}
          />
        ) : (
          <PLACE_ORDER
            source={source}
            cartHandler={cartHandler}
            suppliers={suppliers}
          />
        )}
      </div>
    </SupplierLayout>
  );
}







