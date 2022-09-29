import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import { TextField, Box, Button, Container } from '@mui/material';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { BranchesApi } from '../../endpoint';
export default function Branches() {
 const [data, setData] = useState('');
 const [branches, setBranches] = useState([]);
 // handle click function
 const onClick = function (e) {
  if (data != undefined && data.length > 0) {
   const sendData = async function () {
    let endpoint = await fetch(BranchesApi, {
     method: 'POST',
     body: JSON.stringify({ branch: data })
    })
    let response = await endpoint.json();
    return response;
   }
   sendData().then((response) => {
    console.log(response)
   })
    .catch((err) => {
     console.log(err)
    })
  }
 }


 useEffect(() => {
  const getData = async function () {
   let getBranches = await fetch(BranchesApi)
   let response = await getBranches.json();
   setBranches(response);
  }

  getData()


 }, [])



 const BRANCHESDATA = function (branches) {
  return branches.map((item, index) => {
   return (
    <tr key={index} style={{ fontSize: '14px', color: '#fh3838' }}>
     <td>
      {
       new String(item.BRANCHID).length == 1 ? 'BRANC' + '00' + item.BRANCHID : new String(item.BRANCHID).length == 2 ? 'BRANC' + '0' + item.BRANCHID :
        'BRANC' + item.BRANCHID
      }
     </td>
     <td>
      {item.NAME.toUpperCase()}
     </td>
     <td>
      edit delete
     </td>
    </tr>
   )
  })
 }



 return (
  <div>
   <div className='container-fluid mt-4'>
    <div className='container'>
     <div className='row branches-split'>
      <div>
       <TextField size='small' value={data} onChange={(e) => setData(e.target.value)} label='branch name'
        sx={{ width: '100%' }} />
      </div>
      <div className='col'>
       <Button variant='contained' onClick={(e) => onClick(e)} >
        add branch
       </Button>
      </div>
     </div>
    </div>
   </div>
   <div style={{ margin: '20px 20px 20px 20px', width: '90%' }}>
    <table className='table table-striped' style={{marginLeft:'20px',marginRight:'200px !important'}} >
     <thead style={{ textTransform: 'uppercase',
     backgroundColor:'#00224F',
      color: 'white' }} >
      <tr>
       <th style={{fontWeight:'200'}}>
        branchid
       </th>
       <th  style={{fontWeight:'200'}}>
        branch name
       </th>
       <th  style={{fontWeight:'200'}}>
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