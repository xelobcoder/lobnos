import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import { TextField, Box, Button, Container } from '@mui/material';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { BranchesApi } from '../../endpoint';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';


export default function Branches() {
 const [data, setData] = useState('');
 const [branches, setBranches] = useState([]);
 // display edit or add on button determining if the user is editing or adding
 const [edit, setEdit] = useState(false);
 const [editId, setEditId] = useState('');

 // get all branches

 const getData = async function () {
  let getBranches = await fetch(BranchesApi)
  let response = await getBranches.json();
  setBranches(response);
 }


 // handle click function
 const onClick = function (e) {

  const updateData = function (e, branchid) {
   const sendData = async function () {
    let endpoint = await fetch(BranchesApi, {
     method: 'PUT',
     body: JSON.stringify({ branchname: data, branchid: branchid })
    })
    let response = await endpoint.json();
    return response;
   }
   sendData().then((response) => {
    setEdit(false);
    setData('');
    getData();
   })
    .catch((err) => {
     console.log(err)
    })
  }

  if (data != undefined && data.length > 0 && edit == false) {
   const sendData = async function () {
    let endpoint = await fetch(BranchesApi, {
     method: 'POST',
     body: JSON.stringify({ branch: data })
    })
    let response = await endpoint.json();
    return response;
   }
   sendData().then((response) => {
    getData();
   })
    .catch((err) => {
     console.log(err)
    })
  }

  if (data != undefined && data.length > 0 && edit == true) {
   updateData(e, editId);
  }


 }


 useEffect(() => {
  getData();
 }, [])


 //  click effe3ct for editing the data 

 const editData = function (e, index) {
  let dataset = branches.filter((item, i) => i == index);
  setData(dataset[0].NAME);
  setEdit(true);
  setEditId(dataset[0].BRANCHID);
 }



 // delete data 

 const deleteData = function (e, index) {
  // get branchid 
  const branch = branches.filter((item, i) => i == index);
  const branchid = branch[0].BRANCHID;
  // send delete request
  const sendData = async function () {
   let endpoint = await fetch(BranchesApi, {
    method: 'DELETE',
    body: JSON.stringify({ branch_id: branchid })
   })
   let response = await endpoint.json();
   return response;
  }
  sendData().then((response) => {
   getData();
  }).catch((err) => {
   console.log(err)
  })

  console.log(e, branch)
 }





 const BRANCHESDATA = function (branches) {
  return branches.map((item, index) => {
   return (
    <tr key={index} style={{ fontSize: '14px', color: '#fh3838' }}>
     <td style={{ padding: '20px' }}>
      {
       new String(item.BRANCHID).length == 1 ? 'BRANC' + '00' + item.BRANCHID : new String(item.BRANCHID).length == 2 ? 'BRANC' + '0' + item.BRANCHID :
        'BRANC' + item.BRANCHID
      }
     </td>
     <td style={{ padding: '20px' }}>
      {item.NAME.toUpperCase()}
     </td>
     <td style={{ padding: '20px' }}>
      {item.DATE.slice(0, 10)}
     </td>
     <td style={{ padding: '20px' }}>
      <EditIcon onClick={(e) => editData(e, index)} editset={index} style={{ color: 'green', cursor: 'pointer' }} />
      <DeleteForeverIcon onClick={(e) => deleteData(e, index)} style={{ color: 'red', cursor: 'pointer' }} />
     </td>
    </tr>
   )
  })
 }



 return (
  <div>
   {/* reset to add  */}
   <div className="container-fluid">
    <div className="row">
     <div className="col-md-11" style={{ display: 'flex', justifyContent: 'end' }}>
      <Button color='warning' onClick={(e) => { setEdit(false); setData('') }}>reset</Button>
     </div>
    </div>
   </div>
   <div className='container-fluid mt-4'>
    <div className='container'>
     <div className='row branches-split'>
      <div>
       <TextField size='small' value={data} onChange={(e) => setData(e.target.value)} label='branch name'
        sx={{ width: '100%' }} />
      </div>
      <div className='col'>
       <Button variant='contained' onClick={(e) => onClick(e)} >
        {edit ? 'edit branch' : 'add branch'}
       </Button>
      </div>
     </div>
    </div>
   </div>
   <div style={{ margin: '20px 20px 20px 20px', width: '90%' }}>
    <table className='table table-striped' style={{ marginLeft: '20px', marginRight: '200px !important' }} >
     <thead style={{
      textTransform: 'uppercase',
      backgroundColor: '#00224F',
      color: 'white'
     }} >
      <tr>
       <th style={{ fontWeight: '200' }}>
        branchid
       </th>
       <th style={{ fontWeight: '200' }}>
        branch name
       </th>
       <th style={{ fontWeight: '200' }}>
        Added on
       </th>
       <th style={{ fontWeight: '200' }}>
        action
       </th>
      </tr>
     </thead>
     <tbody>
      {
       branches.length == 0 ? null : BRANCHESDATA(branches)
      }
     </tbody>
    </table>
   </div>
  </div>
 )
}


Branches.getLayout = function PageLayout(page) {
 return (
  <>
   <Header />
   <div className="wrapper">
    <div className="side">
     <SidebarFrontPage />
    </div>
    <div className="main">
     {page}
    </div>
   </div>
  </>
 )
}