import React from 'react'
import SECOND_NO_DATA from '../accessories/secondNodata';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import {useRouter} from 'next/router';
export default function DepartmentStockLevel({datasource,deleteStock}) {
  const [stock, setStock] = React.useState(datasource || []);
  const router = useRouter();


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
                          <Button variant='contained' 
                           onClick={(e) => { 
                            deleteStock(e,item.stockid);
                          }}
                          color='error' startIcon={<DeleteIcon />}>Delete</Button>
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
