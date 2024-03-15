import { useState, useEffect } from 'react'
import PLACE_ORDER from '../../components/inventory/placeorder'
import { customFetch, customPost } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import TableDisplay from '../../components/accessories/TableDisplay';


export default function PlaceNewOrderIndexPage() {
  const [editing, setEditing] = useState({});
  const [source, setDatasource] = useState([]);
  const [suppliers, setSuppliers] = useState([])
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Promise.all([customFetch('stock'), customFetch('suppliers')]);
        const [stocks, suppliers] = response;
        if (stocks.status === 'success' && suppliers.status === 'success') {
          setDatasource(stocks?.result);
          setSuppliers(suppliers?.result);
        } else {
          setDatasource([]);
          setSuppliers([]);
        }
      } catch (error) {
        // Handle any errors that occurred during data fetching
      }
    };
    fetchData();
  }, []);


  const cartHandler = async (e, clicked) => {
    e.preventDefault();
    // ensure that the clicked item is not already in the cart
    const isAlreadyInCart = cart.some(item => item.stockid === clicked.stockid);
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
      setCart([...cart,clicked]);
    }
  }



  // handler for removing an item from the cart
  const removeCartHandler = (e, stockid) => {
    e.preventDefault();
    const newCart = cart.data.filter(item => item.stockid !== stockid);
    setCart(newCart);
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

  


  const columns = [
    { Header: 'name', accessor: 'name' },
    { Header: 'quantity', accessor: 'quantity' },
    { Header: 'supplier', accessor: 'suppliername' },
    { Header: 'purchaseunit', accessor: 'purchaseunit' },
    {
      Header: 'action', accessor: '', Cell: ({ row }) => {
        const stockid = row.original.stockid;
        return <div>
          <button className='btn btn-primary btn-sm p-1'>edit field</button>
          <button onClick={(ev) => { removeCartHandler(ev, stockid) }} className='btn btn-danger btn-sm p-1 mx-1'>remove</button>
        </div>
      }
    }
  ]


  const handleEditField = (row) => {
    if (!row) return;
    const { stockid } = row;
    const matched = cart.data.filter((item, index) => item.stockid == stockid);
    if (matched.length <= 0) return;
    setEditing(matched[0]);
}
  return (
    <SupplierLayout>
      <div className='p-2'>
          <PLACE_ORDER
            source={source}
          cartHandler={cartHandler}
          editdata={editing}
            suppliers={suppliers}
        />
        <TableDisplay data={cart|| []} showpage={false} filtering={true} column={columns} />
       {cart.length != 0 &&  <button onClick={(ev) => { placeOrderHandler(ev) }} className='btn btn-primary btn-sm'>placeorder</button>}
      </div>
    </SupplierLayout>
  );
}







