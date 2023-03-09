import React from 'react'
import EMPTY_TABLE_TEMPLATE from '../accessories/emptyTable';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOffIcon from '@mui/icons-material/EditOff';
import Message from '../accessories/message';
import PreviewIcon from '@mui/icons-material/Preview';
import Link from 'next/link';
import TableIsLoading from '../accessories/TableIsLoading';
export default function SUPPLIERS_LIST({ rawdata }) {

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
      {rawdata.length === 0 ? <TableIsLoading/> : (
       rawdata.map((item, index) => {
        return (
         <tr key={index} dataid={item.supplierid}>
          <td>SUPP{item.supplierid}</td>
          <td>{item.name}</td>
          <td>{item.commodity}</td>
          <td>{item.address}</td>
          <td className='d-flex'>
           <button className='btn btn-info' style={{ marginRight: '10px' }}><EditOffIcon /></button>
           <button className='btn btn-danger'><DeleteForeverIcon /></button>
           <button className='btn btn-warning'>
            <Link href={`/supplier/${item.supplierid}`}>
             <a ><PreviewIcon /></a>
            </Link>
           </button>
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
