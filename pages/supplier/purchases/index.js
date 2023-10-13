import React, { useState, useMemo, useEffect, Suspense } from 'react'
import EMPTY_TABLE_TEMPLATE from '../../../components/accessories/emptyTable';
import { useRouter } from 'next/router';
import { customData, customFetch, customPost } from '../../../components/Auth/customFetch';
import SupplierLayout from '../../../components/inventory/SupplierLayout';



export default function PURCHASES() {
  const [ordersplacedList, setOrdersPlacedList] = useState([]);
  const routers = useRouter();
  const [receivemodal, setModalReceived] = useState(false);
  const [supplierOrders, setSupplierOrders] = useState([]);

  const closeSignal = () => {
    setModalReceived(false);
  }


  const cancelOrder = async function (stockid) {
    // send a request to the server to cancel the order
    try {
      let response = await customPost('orders', 'DELETE', { productordersid: stockid })
      const { status, err } = response;

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



  const viewReceivedOrders = async function (item) {
    const { orderTransactionid } = item;
    routers.push(`/supplier/purchases/receive/${orderTransactionid}`)
  }



  useEffect(() => {
    customData('orders', setOrdersPlacedList);
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
              </tr>
            </thead>
            <tbody>
              {
                ordersplacedList.length === 0 ?
                  <EMPTY_TABLE_TEMPLATE col={9} /> :
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
                              <button className='btn btn-primary btn-sm' onClick={(e) => { viewReceivedOrders(item) }}>
                                receive order
                              </button>
                            </td>
                            <td>
                              <button className='btn btn-danger btn-sm'
                                onClick={(e) => { cancelOrder(item.productordersid) }}>
                                cancel
                              </button>
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
      </SupplierLayout>
    </>
  )
}


