import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SidebarFrontPage from '../../components/frontpagesidebar';
import Header from '../../components/header';
import { useState } from 'react';
import { Button } from '@mui/material';


const FILTERS = function ({ onchange, ondate, callback }) {
 const [date, setDate] = useState('');
 return (
  <>
   <div className="d-flex w-100  mb-2" style={{boxShadow:'(0 0 0 0.2px) black'}}>
    <div className='col-2'>
     <input type='date' className='form-control' onChange={(e) => ondate(e)} />
    </div>
    <div>
     <select className="form-select" aria-label="select sample status">
      <option value="all">All</option>
      <option value="accepted">Pending</option>
      <option value='rejected'>Rejected</option>
     </select>
    </div>
    <div className='col-4'>
     <input type="text" className="form-control" onKeyUp={(e) => onchange(e)} placeholder='filter by name , BillingID,patientID' />
    </div>
   </div>
  </>
 )
}

const NODATA = function () {
 return (
  <>
   <div className="d-flex justify-content-center align-items-center">
    <div className="d-flex flex-column justify-content-center align-items-center">
     <AccessTimeIcon style={{ fontSize: '100px' }} />
     <h3>No data</h3>
    </div>
   </div>
  </>
 )
}

const initial = [{
 id: 1,
 patientid: 1,
 patientname: "John Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
 date: "2022-08-11"
}, {
 id: 1,
 patientid: 1,
 patientname: "John Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
}, {
 id: 1,
 patientid: 1,
 patientname: "John Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
},
{
 id: 2,
 patientid: 1,
 patientname: "John Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
},
{
 id: 2,
 patientid: 1,
 patientname: "Fillaria",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
},
{
 id: 3,
 patientid: 1,
 patientname: "Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
},
{
 id: 4,
 patientid: 1,
 patientname: "John Doe",
 status: "pending",
 test: "Blood Group , full blood count, widal, urinalysis",
}]


const SingleClient = function ({ item }) {
 const [showAction, setShowAction] = useState(false);
 return (
  <>
   <div className="list-group-item list-group-item-action" id='sample-panel'>
    <div className='d-flex w-100 justify-content-between border-none' id='sample-panel-span'>
     <div>
      <div><strong> Transaction id:</strong><span> {item.id}</span></div>
      <div><strong> patient id:</strong><span> {item.patientid}</span></div>
      <div><strong> patient name:</strong><span> {item.patientname}</span></div>
      <div><strong> status:</strong><span> {item.status}</span></div>
      <div><strong>test panel</strong> <span>{item.test}</span></div>
     </div>
     <div>
      <Button onClick={(e) => setShowAction(!showAction)}>
       pull action
      </Button>
      {
       !showAction ? null : (<div>
        <Button color='success'>accept </Button>
        <Button color='error'>reject</Button>
       </div>)
      }
     </div>
    </div>
   </div>
  </>
 )
}
export default function SAMPLE_ASSESSMENT() {
 const [showAction, setShowAction] = useState(false);
 const [data, setData] = useState(initial);

 const ondate = (e) => {
  let date = e.target.value;
  console.log(date);
 }

 const onchange = (e) => {
  let value = e.target.value;
  let filteredData = data.filter((item) => {
   return (item.patientname.toLowerCase().startsWith(value.toLowerCase())
    || item.patientid.toString().startsWith(value.toLowerCase())
    || item.id.toString().startsWith(value.toLowerCase()));
  })
  console.log(filteredData);

  value.length === 0 ? setData(initial) :
   filteredData.length === 0 ? setData([]) : setData(filteredData);
 }
 return (
  <>
   <div>
    <div className="p-4">
     <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">Sample Assessment</h5>
      <small><AccessTimeIcon /> 3 days ago</small>
     </div>
     <FILTERS ondate={ondate} onchange={onchange} />
     <div className='list-group'>
      {
       data.map((item, index) => {
        return (
         <SingleClient key={index} item={item} />
        )
       })
      }
     </div>
    </div>
   </div>
  </>
 )
}




SAMPLE_ASSESSMENT.getLayout = function (page) {
 return (
  <>
   <Header />
   <div className="wrapper">
    <div className="side">
     <SidebarFrontPage />
    </div>
    <div className="main bg-whitedark">
     {page}
    </div>
   </div>
  </>
 )
}