import React, { useState, useMemo, useEffect } from 'react'
export default function PURCHASES() {
 const [ordersplacedList, setOrdersPlacedList] = useState([]);

 useMemo(() => {
  fetch('http://localhost:5000/api/v1/orders')
   .then(res => res.json())
   .then(data => {
    console.log(data)
    setOrdersPlacedList(data.result)
   })
 }, [])

 const demo = {
  "productordersid": 6,
  "stockid": 10,
  "name": "tiifu hamza",
  "tax": 10,
  "supplierid": 69,
  "suppliername": "TIIFU HAMZA",
  "purchaseunit": "l",
  "date": "2023-03-12T18:13:18.026Z",
  "quantity": 2000,
  "received": "FALSE",
  "quantityReceived": null,
  "Batch No": null
 }
 return (
  <div id='placeorder'>
   {ordersplacedList.length === 0 ? <h1>no orders placed</h1> :
    <table>
     <thead>
      <tr>
       <th>orderid</th>
       <th>prod name</th>
       <th>suppliername</th>
       <th>purchaseunit</th>
       <th>date</th>
       <th>quantity ordered</th>
       <th>received</th>
       <th>received order</th>
       <th>cancel order</th>
       <th>details</th>
      </tr>
     </thead>
     <tbody>
      {ordersplacedList.map((item, index) => {
       return (
        <tr key={index}>
         <td>{item.productordersid}</td>
         <td>{item.name}</td>
         <td>{item.suppliername}</td>
         <td>{item.purchaseunit}</td>
         <td>{item.date.slice(0,10)}</td>
         <td>{item.quantity}</td>
         <td>{item.received}</td>
         <td>
          <button className='btn btn-primary btn-sm'>receive order</button>
         </td>
         <td>
          <button className='btn btn-danger btn-sm'>cancel</button>
         </td>
         <td>
          <button className='btn btn-info btn-sm'>details</button>
         </td>
        </tr>
       )
      }
      )}
     </tbody>
    </table>

   }
  </div>
 )
}
