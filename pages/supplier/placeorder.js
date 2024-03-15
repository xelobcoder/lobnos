import { useState, useEffect } from 'react'
import PLACE_ORDER from '../../components/inventory/placeorder'
import { customFetch, customPost } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';
import TableDisplay from '../../components/accessories/TableDisplay';
import { ToastContainer, toast } from 'react-toastify';

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
    setEditing({})
    // ensure that the clicked item is not already in the cart
    if (cart.length == 0) {
      return setCart([clicked]);
    }
    const isAlreadyInCart = cart.some(item => item.stockid === clicked.stockid);
    const isNotEmpty = clicked.quantity !== '' && clicked.supplier !== '';

    if (isAlreadyInCart) {
      toast.error('item already in cart');
      return;
    }

    if (!isNotEmpty) {
      toast.error('please fill all fields');
      return;
    }

    if (clicked.quantity == 0 || clicked.quantity < 1) {
      toast.error('quantity must be greater than 0');
      return;
    }

    if (isNotEmpty && !isAlreadyInCart) {
      setCart([...cart, clicked]);
    }
  }



  // handler for removing an item from the cart
  const removeCartHandler = (e, stockid) => {
    e.preventDefault();
    const newCart = cart.data.filter(item => item.stockid !== stockid);
    setCart(newCart);
  }
  

  const placeOrderHandler = (e) => {
    e.preventDefault();
    const cartdata = { stock: cart }
    const sendData = async function () {
      let data = await customPost('orders', 'POST', cartdata)
      if (data.status === 'success' && data.statusCode == 200 && data.clear == 0) {
        toast.success(data.message, { autoClose: 500 })
        setCart([]);
      } else {
        toast.error(data.message, { autoClose: 30000, position: 'top-center' });
      }
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
          <button onClick={(ev) => { handleEditField(row.original) }} className='btn btn-primary btn-sm p-1'>edit field</button>
          <button onClick={(ev) => { removeCartHandler(ev, stockid) }} className='btn btn-danger btn-sm p-1 mx-1'>remove</button>
        </div>
      }
    }
  ]


  const handleEditField = (row) => {
    setEditing({});
    if (!row) return;
    const { stockid } = row;
    if (cart.length > 1) {
      const matched = cart.filter((item, index) => item.stockid == stockid);
      if (matched.length <= 0) return;
      setEditing(matched[0]);
      setCart((prev) => { return prev.filter((item, index) => matched[0]['stockid'] != item.stockid) });
    } else {
      setEditing(cart[0]);
      setCart([])
    }
  }


  console.log(cart)
  return (
    <SupplierLayout>
      <ToastContainer theme='colored' className={'col-6'} />
      <div className='p-2'>
          <PLACE_ORDER
            source={source}
          cartHandler={cartHandler}
          editdata={editing}
            suppliers={suppliers}
        />

        {cart.length != 0 && (
          <div>
            <TableDisplay data={cart || []} showpage={false} filtering={true} column={columns} />
            <button onClick={(ev) => { placeOrderHandler(ev) }} className='btn btn-primary btn-sm'>placeorder</button>
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}







