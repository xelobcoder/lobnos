import React from 'react'
import SECOND_NO_DATA from '../accessories/secondNodata';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
export default function DepartmentStockLevel({departmentid}) {
  const [stock, setStock] = React.useState([]);


  React.useMemo(() => {
    const getdata = async () => {
      const response = await fetch(`http://localhost:5000/api/v1/departments/stocks?id=${departmentid}`);
      const data = await response.json();
      if (data.status == 'success') {
        setStock(data.result)
      }
    }
    getdata();
  }, [])

  return (
    <div className='p-3'>
      {
        stock.length == 0 ? <SECOND_NO_DATA /> :
          <div>
            <table id='custom-table'>
              <thead>
                <tr>
                  <th>stockid</th>
                  <th>name</th>
                  <th>category</th>
                  <th>consumption unit</th>
                  <th>available quantity</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {
                  stock.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td> {item.stockid}</td>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.consumptionunit}</td>
                        <td>{item.quantityAvailable
                        }</td>
                        <td>
                          <Button variant='contained' color='error' startIcon={<DeleteIcon />}>Delete</Button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
      }
    </div>
  )
}
