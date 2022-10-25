import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import SortList from './sort';
import NODATA_FOUND from '../../Nodata';
import ISLOADING from '../../isLoading';

export default function UserList({editcall}) {
 const [users, setusers] = useState([])
 const [isloading, setisLoading] = useState(true);
 const [isFound, setFound] = useState(true);
 const [clear, setClear] = useState(false);
 const [sort, setSort] = useState('ID ASC');

 // get all queries

 const router = useRouter();


 let getData = async function () {
  const backend_fetch = async function () {
   let endpoint = 'http://localhost:3000/api/roles'
   let response = await fetch(endpoint);
   let res = response.json();
   res.then((res) => { return res }).then((final) => setusers(final.data)).catch((err) => { throw (err) })
  }

  if (users.length == 0 || (users.length > 0 && clear == true)) {
   return backend_fetch()
  }
  else {
   return users
  }
 }

 const sorthandle = useCallback(function (e) {
  const option = e.target.value;

  setSort(option)

  if (option == 'ID ASC') {
   setusers(users.sort((a, b) => a.ROLEID - b.ROLEID).slice(0, users.length))
  }

  if (option == 'ID DESC') {
   let sorted = users.sort((a, b) => a.ROLEID - b.ROLEID).reverse().slice(0, users.length)
   setusers(sorted)
   console.log(sorted)
  }
 }
 )


 // HANDLE FILTER 

 const filterhandle = function (e) {
  let required = e.target.value;
  let filtered = users.filter((item, index) => {
   return item.ROLEID == parseInt(required)
    || new String(item.FULLNAME.toLowerCase()).startsWith(required.toLowerCase())
    || new String(item.USERNAME.toLowerCase()).startsWith(required.toLowerCase())
    || new String(item.ROLE.toLowerCase()).startsWith(required.toLowerCase())
  })

  if (required.length == 0) {
   setClear(true); getData(); setSort('ID ASC');setFound(true)
  } else
   if (required.length > 0 && filtered.length == 0) {
    setClear(false);setisLoading(false);setusers(filtered);
    setFound(false)
   }
   else {
    setusers(filtered)
    setFound(true)
    setisLoading(true)
   }
 }


 const handleDelete = function (e,id) {
   const deleteuser = async function (id) {
    let deletex = await fetch('http://localhost:3000/api/roles',{
      method: 'DELETE',
      body: JSON.stringify({id})
    })
    let response = deletex.json();

    let usex = users.filter ( (item,index) => id != item.ROLEID)

    setusers(usex)
  
   }

   deleteuser(id)
 }


 useMemo(() => {
  getData()
 }, [])


 const editbuttonCall = function (e,data) {
  router.push(`http://localhost:3000/Authentication?users=${data.ROLEID}`)
  editcall()
 }


 const SingleUser = function ({ data }) {
  const id = data.ROLEID;
  return (
   <>
    <tr>
     <td>{data.ROLEID}</td>
     <td>{data.FULLNAME}</td>
     <td>{data.USERNAME}</td>
     <td>{data.ROLE}</td>
     <td>{data.DATE_CREATED.slice(0, 10)}</td>
     <td>{data.TIME.slice(0, 8)}</td>
     <td>
      <Button variant='contained' sx={{ padding: 0, borderRadius: 0 }} color='primary' onClick={(e) => editbuttonCall(e,data)} >edit</Button>
      <Button variant='text' sx={{ padding: 0, borderRadius: 0 }} 
      onClick={ (e) => handleDelete(e,id) }
    color='error'>delete</Button>
     </td>
    </tr>
   </>
  )
 }



 return (
  <>
   <SortList sorthandle={sorthandle} filterhandle={filterhandle} sortdefault={sort} />
   <div>
    <table className='try'>
     <thead className=''>
      <tr>
       <th scope='col'>roleid</th>
       <th scope='col'>fullname</th>
       <th scope='col'>username</th>
       <th scope='col'>role</th>
       <th scope='col'>date created</th>
       <th scope='col'>time</th>
       <th scope='col'>actions</th>
      </tr>
     </thead>
     <tbody>
      {
       users.length > 0 && users.map((item, index) => {
        return (<SingleUser data={item} key={index} />)
       })
      }

     </tbody>
    </table>
    {
     (users.length == 0 && isloading == true) && <ISLOADING />
    }
    {
     (isFound == false && isloading == false) && <NODATA_FOUND />
    }
   </div>
  </>
 )
}
