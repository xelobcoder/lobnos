import React from 'react'
import EMPTY_TABLE_TEMPLATE from '../accessories/emptyTable';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditOffIcon from '@mui/icons-material/EditOff';
import Message from '../accessories/message';
import PreviewIcon from '@mui/icons-material/Preview';
import Link from 'next/link';
import TableIsLoading from '../accessories/TableIsLoading';
import useRouter from 'next/router';
export default function SUPPLIERS_LIST({ rawdata, deleteController, editController }) {

const router = useRouter;
 return (
  <>
   <div className='supply-list-overhead'>
    <table className='table'>
     <thead>
      <tr>
       <th>id</th>
       <th>name</th>
       <th>address</th>
       <th>phone number</th>
       <th>email</th>
       <th>contact person</th>
       <th>region</th>
       <th>action</th>
      </tr>
     </thead>
     <tbody>
      {rawdata.length === 0 ? <TableIsLoading /> : (
       rawdata.map((item, index) => {
        return (
         <tr key={index} >
          <td>SUPP{item.supplierid}</td>
          <td>{item.name.toLowerCase()}</td>
          <td>{item.address.toLowerCase()}</td>
          <td>{item.phonenumber}</td>
          <td>{item.email.toLowerCase()}</td>
          <td>{item.contactperson.toLowerCase()}</td>
          <td>{item.region.toLowerCase()}</td>

          <td className='d-flex'>
           <button className='btn btn-info'
            onClick={ (e) => {
             // navigate to edit page
              router.push(`/supplier/addsupplier?tab=edit&supplierid=${item.supplierid}`)
            }}
            style={{ marginRight: '10px' }}><EditOffIcon /></button>
           <button className='btn btn-danger' onClick={(e) => deleteController(e, item.supplierid)}><DeleteForeverIcon /></button>
           <button className='btn btn-warning'>
            <Link href={`/supplier/${item.supplierid}`}>
             <PreviewIcon />
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
