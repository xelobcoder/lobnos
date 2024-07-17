import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import SupplierLayout from '../../../components/inventory/SupplierLayout';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { Col, Form, Row } from 'react-bootstrap';



export default function PURCHASES() {
  const [ordersplacedList, setOrdersPlacedList] = useState([]);
  const routers = useRouter();
  const [selected, setSelected] = useState([]);




  const cancelOrder = async function (stockid) {
    try {
      let response = await customPost('orders', 'DELETE', { productordersid: stockid })
      const { status, err } = response;
      if (status === 'success') {
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



  const cancelBulk = async (deletables) => {
    if (!Array.isArray(deletables) || (Array.isArray(deletables) && deletables.length == 0)) return false;

    let response = await customPost('orders', 'DELETE', { productordersid: deletables })

    console.log(response);
  }


  useEffect(() => {
    customFetch(`orders?status=pending`)
      .then((data) => {
        const { products } = data.result;
        setOrdersPlacedList(products);
      })
      .catch((err) => setOrdersPlacedList([]));
  }, [])


  const pushSelected = (productordersid) => { return setSelected([...selected, productordersid]) }

  console.log(selected, '[]')
  const columns = [
    {
      Header: "#", accessor: "productordersid", Cell: ({ value }) => {
        return <Form.Check checked={selected.includes(value)} onChange={(ev) => { pushSelected(value) }} />
      }
    },
    {
      Header: 'Prod Name',
      accessor: 'name',
    },
    {
      Header: 'Supplier Name',
      accessor: 'suppliername',
    },
    {
      Header: 'Purchase Unit',
      accessor: 'purchaseunit',
    },
    {
      Header: 'Order Date',
      accessor: 'date',
      Cell: ({ value }) => value.slice(0, 10),
    },
    {
      Header: 'Quantity Ordered',
      accessor: 'quantity',
    },
    {
      Header: 'Received Order',
      Cell: ({ row }) => (
        <button className='btn btn-primary p-1 btn-sm' onClick={() => viewReceivedOrders(row.original)}>
          Receive Order
        </button>
      ),
    },
    {
      Header: 'Cancel Order',
      Cell: ({ row }) => (
        <button className='btn btn-danger btn-sm p-1' onClick={() => cancelOrder(row.original.productordersid)}>
          Cancel
        </button>
      ),
    },
  ]



  return (
    <>
      <SupplierLayout>
        <Row className='mx-1'>
          <Col>
            <button className='btn btn-danger' onClick={(ev) => { cancelBulk(selected) }}>
              cancel selected
            </button>
            <button className='btn btn-primary mx-2'>
              receive selected
            </button>
          </Col>
          <TableDisplay column={columns} data={ordersplacedList} />
        </Row>
      </SupplierLayout>
    </>
  )
}


