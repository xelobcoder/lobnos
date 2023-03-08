import React from 'react'
import EMPTY_TABLE_TEMPLATE from '../accessories/emptyTable';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOffIcon from '@mui/icons-material/EditOff';
import Message from '../accessories/message';

export default function SUPPLIERS_LIST({rawdata}) {

 return (
  <>
   <div className='supply-list-overhead'>
    <table className='table'>
     <thead>
      <tr>
       <th>id</th>
       <th>name</th>
       <th>commodity</th>
       <th>address</th>
       <th>action</th>
      </tr>
     </thead>
     <tbody>
      {rawdata.length === 0 ? <EMPTY_TABLE_TEMPLATE/>: (
       rawdata.map((item, index) => {
        return (
         <tr key={index}  dataid={item.supplierid}>
          <td>SUPP{item.supplierid}</td>
          <td>{item.name}</td>
          <td>{item.commodity}</td>
          <td>{item.address}</td>
          <td className='d-flex'>
           <button className='btn btn-info' style={{marginRight: '10px'}}><EditOffIcon/></button>
           <button className='btn btn-danger'><DeleteForeverIcon/></button>
          </td>
         </tr>
        )
       })
      )}
     </tbody>
    </table>
   </div>
  </>
 )
}
