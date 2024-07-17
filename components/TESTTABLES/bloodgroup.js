import React, { useState, useEffect } from 'react';


const EmptyBloodGroupTable = () => {
 return (
  <>
   {
    <tr>
     <td className="border px-4 py-2" colSpan={3}>No data</td>
    </tr>
   }
  </>
 )
}

const BloodGroupTableBody = ({ data }) => {
 return (
  <>
   {
     data.map( (item,index) => {
      return (
       <tr key={index}>
        <td className="border px-4 py-2">{index + 1}</td>
        <td className="border px-4 py-2">{item.BILLINGID}</td>
        <td className="border px-4 py-2">{item.BLOODGROUP}</td>
        <td className="border px-4 py-2">{item.RHESUS}</td>
       </tr>
      )
     })
   }
  </>
 )
}

const BloodGroupTable = ({ data }) => {
 return (
  <>
   <div className="p-4">
    <table className="table table-stripped">
     <thead>
      <tr>
       <th className="border px-4 py-2">#</th>
       <th className='border px-4 py-2'>patient ID</th>
       <th className="border px-4 py-2">blood group</th>
       <th className="border px-4 py-2">rhesus</th>
      </tr>
     </thead>
     <tbody>
      {data.length > 0 ? <BloodGroupTableBody data={data} /> : <EmptyBloodGroupTable />}
     </tbody>
    </table>
   </div>
  </>
 )
}

function BloodGroupTableList() {
 const [bloodGroupList, setBloodGroupList] = useState([]);
 console.log(bloodGroupList);
 useEffect(() => {
  // fetch data from api
  let fetchData = async () => {
   let response = await fetch('http://localhost:3000/api/test/?test=bloodgroup');
   let data = await response.json();
   setBloodGroupList(data);
  }
  fetchData();
 }, [])
 return (
  <>
   <BloodGroupTable data={bloodGroupList} />
  </>
 )
}



export default BloodGroupTableList;