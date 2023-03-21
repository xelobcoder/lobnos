import React from 'react'
import TableDisplay from '../../components/accessories/TableDisplay'
import Header from '../../components/header'
import InventoryHeaders from '../../components/Headers/inventoryHeaders'
import PLACE_ORDER from '../../components/inventory/placeorder'

export default function DepartmentRequisition({ departments, stocks }) {
  const [department, setDepartments] = React.useState(departments || [])

  // create a column 

  const columns = [
    {
      Header: 'Stock ID',
      accessor: 'stockid'
    },
    {
      Header: 'Name',
      accessor: 'name'
    },
    {
      Header: 'Category',
      accessor: 'category'
    },
    {
      Header: 'purchaseunit',
      accessor: 'purchaseunit'
    },
    {
      Header: 'consumptionunit',
      accessor: 'consumptionunit'
    },
    {
      Header: 'quantity required',
      accessor: 'quantityrequired',
      Cell: ({ row }) => (
        <input type='number' className='custom-input' />
      )
    },
    {
      Header: 'order',
      accessor: 'order',
      Cell: ({ row }) => (
        <button className='btn btn-warning btn-sm'>Order</button>
      )
    }
  ]
  return (
    <>
      <div className='p-1 lims-text-color d-flex justify-content-center'>
        {/* <header className='mt-1'> */}
        <h4 className='text-2xl font-bold col-6'>Department Requisition</h4>
        <select className='custom-input'>
          <option>select a department</option>
          {
            department.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.department}</option>
            ))
          }
        </select>

      </div>
      <div id='placeorder'>
        <TableDisplay column={columns} data={stocks} />
      </div>
    </>
  )
}


DepartmentRequisition.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders />
        </div>
        <div className="main" id='page-main-view'>{page}</div>
      </div>
    </>
  )
}


// usring server side rendering

export async function getServerSideProps(context) {
  // using promise all to fetch all the data at once
  const departments = await fetch('http://localhost:5000/api/v1/departments')
  const stocks = await fetch('http://localhost:5000/api/v1/stock')
  const response = await Promise.all([departments, stocks])
  const data = await Promise.all(response.map((res) => res.json()))

  return {
    props: {
      departments: data[0].data,
      stocks: data[1].result
    },
  }
}