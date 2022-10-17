import { useState, useCallback } from 'react'
import { Input, List } from '@mui/material'
import CheckBox, { Button } from '@mui/material';
import FastApipush from '../Auth/testpush';
import Message from './message'

function TEST_DETAILS({ data }) {
 const [textmessage, setTextmessage] = useState('')
 const [content, setContent] = useState('')
 const [ticked, setTicked] = useState(true)

 const dessociate = (test) => {
  return test.split(',')
 }



 const Listing = ({ data }) => {
  return dessociate(data).map((item, index) => {
   return (
    <>
     <ul className="list-group" id='test-list'>
      <li className="list-group-item -tr" style={{ borderRadius: '0px' }}>
       <div className="text-frame">
        <div
         style={{
          display: 'grid',
          gridTemplateColumns: '2% auto',
          gridGap: '20px 20px',
         }}
         key={index}
        >
         <div className="1">{index + 1}</div>
         <div className='two'>{item}</div>
        </div>
       </div>
      </li>
     </ul>
    </>
   )
  })
 }

 // if message checked box is ticked, it means all samples not taken. reason for incomplete status must be appended.
 const handleFinished = (clientid, content) => {
  let completedTime = new Date();
  const dbData = function () {
   if (ticked == false && content.length > 0) {
    return {
     clientid: clientid,
     content: content,
     status: 'INCOMPLETE',
     alltaken: 'FALSE',
     completedTime
    }
   } else if (ticked == false && content.length == 0) {
    alert('please type something in message box if all test are not done indicating the reason')
   }
   else {
    return {
     clientid: clientid,
     content: null,
     status: 'DONE',
     completedTime,
     alltaken: 'TRUE',
    }
   }
  }

  dbData()

  if (dbData() != undefined) {
   // send data to database
   let sendData = new FastApipush('PUT', dbData(), 'http://localhost:3000/api/phelobotomy', true)

   let response = sendData.postdata();

   console.log(response)
  }
 }

 const handleMessage = useCallback((e) => {
  setContent(e.target.value)
 })


 return (
  <>
   <div className="test-detail-panel" key={data.ID}>
    <div
     className="list-group"
     style={{ marginLeft: '4%', marginRight: '4%', borderRadius: '0' }}
    >
     <div
      className="list-group-item alert alert-warning"
      style={{
       display: 'grid',
       gridTemplateColumns: '50% auto',
       border: ' 1px solid lightgray',
       borderBottomRightRadius: '0',
       borderBottomLeftRadius: 0,
      }}
     >
      <div className="group">
       <div className="header">fullname</div>
       <div className="other">{data.FULLNAME}</div>
      </div>
      <div className="group">
       <div className="header">refering clinician</div>
       <div className="other">{data.CLINICIAN}</div>
      </div>
      <div className="group">
       <div className="header">Age</div>
       <div className="other">
        {data.AGE + ' '} {data.AGETYPE}
       </div>
      </div>
      <div className="group">
       <div className="header">urgency</div>
       <div className="other">{data.URGENCY}</div>
      </div>
      <div className="group">
       <div className="header">gender</div>
       <div className="other">{data.GENDER}</div>
      </div>
      <div className="group">
       <div className="header">refering organization</div>
       <div className="other">{data.ORGANIZATION}</div>
      </div>
      <div className="group">
       <div className="header">outstanding Bill</div>
       <div className="other">{data.OUTSTANDING}</div>
      </div>
     </div>
     <Listing data={data.TEST} />
     <li className="list-group-item go-top">
      <div className="grid-move-last">
       <label className="text-lowercase">
        <input
         type="checkbox"
         className="selectalllabel"
         onClick={(e) => setTicked(!ticked)}
        />
        tick here if all test samples was not taken and click on message
        to provide some information
       </label>
       <Button
        disabled={ticked ? true : false}
        color="error"
        onClick={(e) => setTextmessage(!textmessage)}
       >
        Add message
       </Button>
       <Button
        variant="contained"
        color="primary"
        sx={{
         marginLeft: '-4px',
         marginRight: '24px',
         borderRadius: '0px',
        }}
        onClick={(e) => handleFinished(data.ID, content)}
       >
        finish
       </Button>
      </div>
     </li>
     {!textmessage ? null : (
      <Message content={content} onMessage={handleMessage} />
     )}
    </div>
   </div>
  </>
 )
}

export default TEST_DETAILS
