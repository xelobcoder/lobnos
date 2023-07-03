import React, { useState, useMemo, useEffect, Suspense } from 'react'
import EMPTY_TABLE_TEMPLATE from '../../components/accessories/emptyTable';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import ReceivedOrderModal from '../../components/inventory/ReceivedOrderModal';
import { customFetch } from '../../components/Auth/customFetch';
import SupplierLayout from '../../components/inventory/SupplierLayout';



export default function PURCHASES() {
  const [ordersplacedList, setOrdersPlacedList] = useState([]);
  const [receivemodal, setModalReceived] = useState(false);
  const [supplierOrders, setSupplierOrders] = useState([]);

  const closeSignal = () => {
    setModalReceived(false);
  }


  const cancelOrder = async function (stockid) {
    // send a request to the server to cancel the order
    try {
      let response = await fetch(`${process.env.BASEURL}/orders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          productordersid: stockid
        })
      })
      let data = await response.json();

      const { status, err } = data;

      if (status === 'success') {
        // remove the order from the list
        const newList = ordersplacedList.filter(item => item.productordersid !== stockid)
        setOrdersPlacedList(newList)
      }

      if (err || status == 'error') {
        alert(err?.message)
      }
    }
    catch (error) {
      console.log(error)
    }
  }




  const addToStock = async function () { }



  const viewReceivedOrders = async function (supplierid) {
    // filter data to show orders by such supplier in orderplacedlist
    const filteredList = ordersplacedList.filter(item => item.supplierid === supplierid)
    // puplulate the modal with the filtered list in the supplierOrders state
    // mofify filterlist to include a received quantity field,price,received date,expiry date,batch number,balance,total amount
    filteredList.map(item => {
      item['receivedquantity'] = 0;
      item['price'] = parseFloat(item.price);
      item['tax'] = 0;
      item['receiveddate'] = '';
      item['expirydate'] = '';
      item['batchnumber'] = '';
      item['totalamount'] = 0;
      item['balance'] = parseInt(item.quantity) - parseInt(item.receivedquantity);
    })

    setSupplierOrders(filteredList)
    // set the modal to true
    setModalReceived(true)

    console.log(filteredList)
  }



  const viewDetails = async function () { }

  useMemo(() => {
    try {
      async function fetchOrdersPlaced() {
        const data = await customFetch('orders')
        setOrdersPlacedList(data.result)
      }
      fetchOrdersPlaced()
    }
    catch (error) {
      console.log(error)
    }
  }, [])



  return (
    <>
      <SupplierLayout>
        <div className='mt-2'>
          <table id='custom-table'>
            <thead>
              <tr>
                <th>orderid</th>
                <th>prod name</th>
                <th>suppliername</th>
                <th>purchaseunit</th>
                <th>order date</th>
                <th>quantity ordered</th>
                <th>received</th>
                <th>received order</th>
                <th>cancel order</th>
                <th>details</th>
              </tr>
            </thead>
            <tbody>
              {
                ordersplacedList.length === 0 ?
                  <EMPTY_TABLE_TEMPLATE col={10} /> :
                  (
                    <>
                      {ordersplacedList.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.productordersid}</td>
                            <td>{item.name}</td>
                            <td>{item.suppliername}</td>
                            <td>{item.purchaseunit}</td>
                            <td>{item.date.slice(0, 10)}</td>
                            <td>{item.quantity}</td>
                            <td>{item.received}</td>
                            <td>
                              <button className='btn btn-primary btn-sm'
                                onClick={(e) => {
                                  viewReceivedOrders(item.supplierid)
                                }}
                              >receive order</button>
                            </td>
                            <td>
                              <button className='btn btn-danger btn-sm'
                                onClick={(e) => { cancelOrder(item.productordersid) }}
                              >cancel</button>
                            </td>
                            <td>
                              <button className='btn btn-info btn-sm'>details</button>
                            </td>
                          </tr>
                        )
                      }
                      )}
                    </>
                  )
              }
            </tbody>
          </table>
        </div>
        <div>
          {receivemodal && <ReceivedOrderModal receivedmodal={receivemodal} datasource={supplierOrders} closeSignal={closeSignal} />}
        </div>
      </SupplierLayout>
    </>
  )
}


