import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useEffect, useState, useRef } from "react";
import { Button, Link, Typography } from "@mui/material";
import SAMPLE_REJECTION_MODAL_MESSAGE from "../../components/samples/sampleRejectionModal";
import REJECTEDVIEW from "../../components/samples/rejectedview";

// buttons for the sample status
const rejectedview = () => <Button variant="text" color='error'>rejected</Button>
const acceptedview = () => <Button variant="text" color='success'>accepted</Button>
const pendingview = () => <Button variant="text" className="activated-warning" color='warning'>pending</Button>

// filter component
const FILTERS = function ({ onchange, ondate, sorting, onsearch, searchArea, currentdate, setData, rejectedList }) {
 const [date, setDate] = useState("");
 return (
  <>
   <div className="d-flex w-100 mb-3">
    <div className="col-2">
     <input
      type="date"
      className="custom-input"
      onChange={(e) => ondate(e)}
      value={currentdate}
     />
    </div>
    <div>
     <select className="custom-input" value={onsearch} aria-label="select sample status" onChange={(e) => {
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
      className="custom-input"
      onKeyUp={(e) => onchange(e)}
      placeholder="filter by name , BillingID,patientID"
     />
    </div>
    <div className="col-2">
     <Button variant="contained" color="primary" className="custom-button" onClick={() => {
      const data = {
       date: currentdate,
       status: onsearch
      }
      // send data to server 
      let endpoint = `http://localhost:5000/api/v1/sample/?date=${data.date}&status=${data.status}`;
      let push = async () => {
       await fetch(endpoint)
        .then((res) => res.json())
        .then((data) => {
         // populate the data into the sample list
         setData(data);
        })
        .catch((err) => console.log(err));
      }
      push();
     }}>Search</Button>
    </div>
    <div>
     <Button variant="text" color="warning" >
      <Link href="/sample/rejected">View Rejected</Link>
     </Button>

    </div>
   </div>

  </>
 );
};

const NODATA = function () {
 return (
  <>
   <div className="d-flex justify-content-center align-items-center bg-white ">
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ color: '#00224F' }}>
     <AccessTimeIcon style={{ fontSize: "100px" }} />
     <Typography variant="h5" sx={{ mb: 4 }} className="text-center">No data found</Typography>
    </div>
   </div>
  </>
 );
};

const SingleClient = function ({ item, approvalStatus, billingid = 0 }) {
 const [showAction, setShowAction] = useState(false);
 return (
  <>
   <div className="list-group-item list-group-item-action" id="sample-panel">
    <div className="d-flex w-100 justify-content-between border-none" id="sample-panel-span">
     <div><div><strong> billing id:</strong><span> {item.BILLINGID}</span></div>
      <div> <strong> patient id:</strong> <span> {item.PATIENTID}</span></div>
      <div><strong> patient name:</strong><span> {item.FULLNAME}</span></div>
      <div><strong> status:</strong><span> {
       item.SAMPLE_STATUS == "PENDING" ? pendingview() : item.SAMPLE_STATUS == "ACCEPTED" ? acceptedview() : rejectedview()}</span>
      </div><div><strong>test panel</strong> <span>{item.TEST}</span></div></div>
     <div>
      <Button onClick={(e) => setShowAction(!showAction)}>
       pull action
      </Button>
      {!showAction ? null : (
       <div>
        <Button color="success" onClick={(e) => { approvalStatus(item, 'accepted'); setShowAction(!showAction) }}>
         accept
        </Button>
        <Button color="error" onClick={(e) => { approvalStatus(item, 'rejected'); setShowAction(!showAction) }}>reject</Button>
       </div>
      )}
     </div>
    </div>
   </div>
  </>
 );
};

const currentdate_function = function () {
 let date = new Date();
 let year = date.getFullYear();
 let month = date.getMonth() + 1;
 let dt = date.getDate();
 return year + "-" + 0 + month + "-" + 0 + dt;
}
export default function SAMPLE_ASSESSMENT({ initial }) {
 const [showAction, setShowAction] = useState(false);
 const [data, setData] = useState(initial);
 const [onsearch, setOnsearch] = useState("all");
 const searchRef = useRef();
 const [currentdate, setCurrentdate] = useState(currentdate_function());
 const [show, setShow] = useState(false);
 const [completed, setCompleted] = useState(false);
 const [modalDetails, setModalDetails] = useState({
  patientname: '',
  billingid: 0,
  item: {},
 });
 const [rejectedList, setRejectedList] = useState(false);

 //  function to filter the rejected samples
 const filteredData = initial.filter((item) => item.SAMPLE_STATUS === 'REJECTED');

 const ondate = (e) => {
  let date = e.target.value;
  setCurrentdate(date);
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

  const all = function () {
   setData(initial);
   setOnsearch("all");
   setCurrentdate('0000-00-00');
  }

  value.length === 0
   ? all()
   : filteredData.length === 0
    ? setData([])
    : setData(filteredData);
  // reset data to all

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
   fetch("http://localhost:5000/api/v1/sample")
    .then((res) => res.json())
    .then((data) => setData(data));
  } else {
   fetch(`http://localhost:5000/api/v1/sample?status=${onsearch}`)
    .then((res) => res.json())
    .then((data) => setData(data));
  }
 };

 // changes the status of the sample
 const approvalStatus = function (item, status) {
  // set completed to default
  setCompleted(false);
  // destructuring the item
  const { SAMPLE_STATUS, FULLNAME, PATIENTID, BILLINGID, TEST } = item;
  // create a post data object
  const data = {
   status,
   fullname: FULLNAME,
   patientid: PATIENTID,
   billingid: BILLINGID,
  };

  // props for modal
  const prepareModal = function () {
   setModalDetails({
    patientname: FULLNAME,
    billingid: BILLINGID,
   });
   setShow(true);
  }

  //  if sample status is rejected then show modal

  status === 'rejected' ? prepareModal() : null;

  // send a post request to the server

  const forwardData = function () {
   const SAVE = function () {
    const deliverStatus = async () => {
     let api = await fetch('http://localhost:5000/api/v1/sample', {
      method: 'PUT',
      headers: {
       'content-type': 'application/json'
      },
      body: JSON.stringify(data),
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



   status === 'accepted' ? SAVE() : null;
  }

  forwardData();

 }


 // sorting the data displayed and present it to the user

 const sorting = (e) => {
  let sortingvalue = e.target.value;
  const REALTIMESTATUS = async () => {
   let api = await fetch(`http://localhost:5000/api/sample?status=${sortingvalue}`)
   let response = await api.json();
   response.length === 0 ? setData([]) : setData(response);
  }
  sortingvalue === 'all' ? setData(initial) : REALTIMESTATUS();
 }

 useEffect(() => {
  completed ? refresh() : null;
 }, [completed])


 // setData function to update the data holder after query button click
 const updateData = (data) => {
  setData(data)
 }


 // handleModal message 

 const handleModal = (message) => {
  setModalMessage(message);
 }



 const reverse = function () {
  setRejectedList(!rejectedList);
 }
 return (
  <>
   {
    rejectedList ? <REJECTEDVIEW filteredData={filteredData} reverse={reverse} /> :
     (
      <><div>
       <div className="p-4">
        <div className="d-flex w-100 justify-content-between">
         <h5 className="mb-1">Sample Assessment</h5>
        </div>
        <FILTERS ondate={ondate} onchange={onchange} setData={updateData} sorting={sorting} rejectedList={setRejectedList}
         onsearch={onsearch} searchArea={searchArea} currentdate={currentdate} />
        <div className="list-group">
         {data.length === 0 ? <NODATA /> : (
          data.map((item, index) => {
           return <SingleClient key={index} item={item} approvalStatus={approvalStatus} />;
          })
         )}
        </div>
       </div>
      </div><SAMPLE_REJECTION_MODAL_MESSAGE show={show} setShow={setShow}
       modalMessage={handleModal} item={modalDetails.item} completed={setCompleted}
       billingid={modalDetails.billingid} patientname={modalDetails.patientname} />
      </>
     )
   }
  </>
 );
}



export async function getServerSideProps(context) {
 const fetchData = async () => {
  const response = await fetch(
   "http://localhost:5000/api/v1/sample",
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

// SAMPLE_ASSESSMENT.getLayout = function (page) {
//  return (
//   <>
//    <Header />
//    <div className="wrapper">
//     <div className="side">
//      <SidebarFrontPage />
//     </div>
//     <div className="main bg-whitedark">{page}</div>
//    </div>
//   </>
//  );
// };
