import React, { useState } from 'react'
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';


export default function PendingTableSample({ data,removeClient}) {
const [showAssesModal,setShowAssesModal]= useState(false);
const [target,setTarget]= useState(null);


const openModal=(ev)=>{ setShowAssesModal(true); }
const  closeModal=(ev)=>{ setShowAssesModal(false); }


  return (
   <>
    <div className="list-group p-0">
      <div className='list-group-item list-group-item-dark text-capitalize ' style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
        <span className='fw-light'>billedon</span>
        <span className='fw-light'>fullname</span>
        <span className='fw-light'>billingid</span>
        <span className='fw-light'>action</span>
      </div>
      {data.map((item, index) => {
        return <div key={index} className="list-group-item  text-capitalize p-2" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
           <span >{new Date(item?.date).toLocaleDateString()}</span>
           <span > {item?.fullname}</span>
           <span>{item?.billingid}</span>
           <span><button className='btn btn-outline-primary btn-sm' onClick={(ev) =>  {setTarget(item?.billingid);openModal()}}>assess</button></span>
        </div>;
      })}
    </div>
    <SampleAssessmentModal show={showAssesModal}  hide={closeModal} billingid={target} removeClient={removeClient}/>
   </>
  );
}
