import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useEffect, useState, useRef } from "react";
import { Button } from "@mui/material";

// buttons for the sample status
const rejectedview = () => <Button variant="text" color='error'>rejected</Button>
const acceptedview = () => <Button variant="text" color='success'>accepted</Button>
const pendingview = () => <Button variant="text" className="activated-warning" color='warning'>pending</Button>

// filter component
const FILTERS = function ({ onchange, ondate, sorting, onsearch, searchArea }) {
 const [date, setDate] = useState("");
 return (
  <>
   <div className="d-flex w-100 mb-3">
    <div className="col-2">
     <input
      type="date"
      className="form-control"
      onChange={(e) => ondate(e)}
     />
    </div>
    <div>
     <select className="form-select" aria-label="select sample status" onChange={(e) => {
      sorting(e);
      searchArea(e.target.value)
     }}>
      <option value="all">All</option>
      <option value="PENDING">Pending</option>
      <option value="REJECTED">Rejected</option>
      <option value="ACCEPTED">Accepted</option>
     </select>
    </div>
    <div className="col-4">
     <input
      type="text"
      className="form-control"
      onKeyUp={(e) => onchange(e)}
      placeholder="filter by name , BillingID,patientID"
     />
    </div>
   </div>
  </>
 );
};

const NODATA = function () {
 return (
  <>
   <div className="d-flex justify-content-center align-items-center">
    <div className="d-flex flex-column justify-content-center align-items-center">
     <AccessTimeIcon style={{ fontSize: "100px" }} />
     <h3>No data</h3>
    </div>
   </div>
  </>
 );
};

const SingleClient = function ({ item, approvalStatus }) {
 const [showAction, setShowAction] = useState(false);
 return (
  <>
   <div className="list-group-item list-group-item-action" id="sample-panel">
    <div
     className="d-flex w-100 justify-content-between border-none"
     id="sample-panel-span"
    >
     <div>
      <div>
       <strong> billing id:</strong>
       <span> {item.BILLINGID}</span>
      </div>
      <div>
       <strong> patient id:</strong>
       <span> {item.PATIENTID}</span>
      </div>
      <div>
       <strong> patient name:</strong>
       <span> {item.FULLNAME}</span>
      </div>
      <div>
       <strong> status:</strong>
       <span> {
        item.SAMPLE_STATUS == "PENDING" ? pendingview() : item.SAMPLE_STATUS == "ACCEPTED" ? acceptedview() : rejectedview()
       }
       </span>
      </div>
      <div>
       <strong>test panel</strong> <span>{item.TEST}</span>
      </div>
     </div>
     <div>
      <Button onClick={(e) => setShowAction(!showAction)}>
       pull action
      </Button>
      {!showAction ? null : (
       <div>
        <Button color="success" onClick={(e) => { approvalStatus(item, 'accepted'); setShowAction(!showAction) }}>accept </Button>
        <Button color="error" onClick={(e) => { approvalStatus(item, 'rejected'); setShowAction(!showAction) }}>reject</Button>
       </div>
      )}
     </div>
    </div>
   </div>
  </>
 );
};
export default function SAMPLE_ASSESSMENT({ initial }) {
 const [showAction, setShowAction] = useState(false);
 const [data, setData] = useState(initial);
 const [onsearch, setOnsearch] = useState("all");
 const searchRef = useRef();

 const ondate = (e) => {
  let date = e.target.value;
  console.log(date);
 };

 const onchange = (e) => {
  let value = e.target.value;
  let filteredData = data.filter((item) => {
   return (
    item.FULLNAME.toLowerCase().startsWith(value.toLowerCase()) ||
    item.PATIENTID.toString().startsWith(value.toLowerCase()) ||
    item.ID.toString().startsWith(value.toLowerCase())
   );
  });
  console.log(filteredData);

  value.length === 0
   ? setData(initial)
   : filteredData.length === 0
    ? setData([])
    : setData(filteredData);
 };
 // monitor the search input field
 // filled it with the selected filter
 const searchArea = function (value) {
  setOnsearch(value);
 }

 // refresh data  after every action change and updated UI data holder with the filter sample status
 // e.g if sample type === pending , then the data holder will be updated with the pending sample after status change
 const refresh = () => {
  if (onsearch == "all") {
   fetch("/api/sample")
    .then((res) => res.json())
    .then((data) => setData(data));
  } else {
   fetch(`/api/sample?status=${onsearch}`)
    .then((res) => res.json())
    .then((data) => setData(data));
  }
 };

 // changes the status of the sample
 const approvalStatus = function (item, status) {
  const { SAMPLE_STATUS, FULLNAME, PATIENTID, BILLINGID, TEST } = item;
  // create a post data object
  const data = {
   status,
   fullname: FULLNAME,
   patientid: PATIENTID,
   billingid: BILLINGID,
  };
  // send a post request to the server

  const deliverStatus = async () => {
   let api = await fetch('http://localhost:3000/api/sample', {
    method: 'PUT',
    body: JSON.stringify(data)
   })
   let response = await api.json();
   return response;
  }

  deliverStatus()
   .then((response) => {
    refresh();
   }).catch((err) => {
    console.log(err)
   })

 }


 // sorting the data displayed and present it to the user

 const sorting = (e) => {
  let sortingvalue = e.target.value;
  const REALTIMESTATUS = async () => {
   let api = await fetch(`http://localhost:3000/api/sample?status=${sortingvalue}`)
   let response = await api.json();
   response.length === 0 ? setData([]) : setData(response);
  }
  sortingvalue === 'all' ? setData(initial) : REALTIMESTATUS();
 }



 return (
  <>
   <div>
    <div className="p-4">
     <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">Sample Assessment</h5>
      <small>
       <AccessTimeIcon /> 3 days ago
      </small>
     </div>
     <FILTERS ondate={ondate} onchange={onchange} sorting={sorting} searchArea={searchArea} />
     <div className="list-group">
      {data.map((item, index) => {
       return <SingleClient key={index} item={item} approvalStatus={approvalStatus} />;
      })}
     </div>
    </div>
   </div>
  </>
 );
}



export async function getServerSideProps(context) {
 const fetchData = async () => {
  const response = await fetch(
   "http://localhost:3000/api/sample",
  )
  const data = await response.json();
  return data;
 };

 const data = await fetchData();
 return {
  props: {
   initial: data
  }
 }
}

SAMPLE_ASSESSMENT.getLayout = function (page) {
 return (
  <>
   <Header />
   <div className="wrapper">
    <div className="side">
     <SidebarFrontPage />
    </div>
    <div className="main bg-whitedark">{page}</div>
   </div>
  </>
 );
};
