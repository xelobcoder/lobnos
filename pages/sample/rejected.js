import { useState, useRef } from "react";
import Header from "../../components/header";
import FilterRejectedList from "../../components/samples/FilterRejectedList";
import PersonalData from "../../components/samples/PersonalData";
import RejectedListView from "../../components/samples/rejectedListView";
import TestTable from "../../components/samples/TestTable";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import { Typography } from "@mui/material";


export default function REJECTED_VIEW_PAGE(data) {
  const [filteredData, setFilteredData] = useState(data.data);
  const [searchValue, setSearchedValue] = useState(null);
  const [selectedclient, setSelectedClient] = useState(0);
  const [selectedclientdata, setSelectedClientData] = useState([]);
  const [testsource, setTestSource] = useState([])
  const [messageView, setMessageview] = useState(false);
  const [declinemessage, setDeclineMessage] = useState('')
  // validated state changes the color of the box to indicate if sample has been validated by manager as in decline , approved or reuested for further examination
  const [validated, setValidated] = useState('decline')
  // reference to DOM Elements
  const test_table_ref = useRef();
  const messageBox = useRef();
  // handle search
  const searchController = (value) => {
    setSearchedValue(value);
    if (searchValue == null
      || searchValue == undefined
      || searchValue == '') {
      return;
    }
    else {
      // filter the data
      let filtered = data.data.filter((item) => {
        return (new String(item.PATIENTID).toLowerCase().startsWith(value) ||
          new String(item.PATIENTID).toLowerCase().includes(value) ||
          new String(item.PATIENTID).toLowerCase().startsWith(value));
      }
      )
      if (filtered.length == 0 && value.length > 0) {
        setFilteredData([]);
      } else if (filtered.length == 0 && value.length == 0) {
        setFilteredData(data.data);
      } else if (filtered.length > 0 && value.length > 0) {
        setFilteredData(filtered);
      }
      else {
        setFilteredData(data.data);
      }
    }
  }

  // this get data from the server of rejected client selected.
  // This would populate seleccted client data state
  const clickedContoller = (index) => {
    // setSelectedClient(index);
    // // filter the data from the list
    // // fetch the data from the database
    async function fetchdata() {
      let data = await customFetch(`rejected?type=getsampleinfo&billingid=${index}`);
      const { result, statusCode } = data;
      //  if statusCode == 200
      if (result && result.length > 0 && statusCode == 200) {
       setSelectedClientData(result)
       getRejectedSampleList()
      }
    }
    fetchdata();
    // get the rejected samples for that particular test
    const getRejectedSampleList = async function() {
      let data = await customFetch(`rejected?type=getRejectedClientSample&billingid=${index}`);
      const {result,statusCode} = data;
      console.log(data)
      if (result && result.length > 0 && statusCode == 200) {
        setTestSource(result)
      }
    }
  }


  // change the rejected circle to green or red based on the validations status
  const changeValidationStatus = async function (billingid) {
    let response = await customFetch(`rejected?type=getvalidationstatus&billingid=${billingid}`)
    const { status, result } = response;

    if (status === 'success' && result.length > 0) {
      // get message 
      const MESSAGE = result[0]['MESSAGE'];
      const STATUS = result[0]['ACTION']
      // display message box
      setMessageview(true)
      // append message by manager
      setDeclineMessage(MESSAGE)
      // set validated true
      setValidated(STATUS)
    } else {
      setDeclineMessage('');
      setMessageview(false);
      setValidated(false)
    }
    return await response;
  }

  const actionController = function (action) {
    // check type of action
    if (typeof action !== 'string') throw new Error('string type required');
    // if type is string, switch action 
    if (typeof action === 'string') {
      if (action === 'declined' || action == 'further examination') {
        // make message view visbile
        setMessageview(true);
        if (messageBox.current !== undefined || messageBox.current === null) {
          //  send data to server
          const forward_deploy = async function () {
            let t = await customPost('rejected');
            console.log(t)
          }
          forward_deploy()
        }
      } else {

      }
    }
  }






  return (
    <>
      {/* main view and side view */}
      <div className='rejected-view'>
        <div className='rejected-view-side'>
          <FilterRejectedList
            searchHandler={searchController}
          />
          <RejectedListView
            listsource={filteredData}
            controller={clickedContoller}
            selectedDefault={selectedclient}
          />
        </div>
        <div className='rejected-view-main'>
          <div className="left">
            <PersonalData data={selectedclientdata} />
          </div>
          <div className="right">
            <div ref={test_table_ref}>
              <TestTable testsource={testsource} />
            </div>
            <h6 className="m-3 text-uppercase">Reason for rejection</h6>
            <div className="alert alert-danger m-3 " >
             
            </div>
            {messageView === false ? null :
              <div className="message-boxs  m-3" ref={messageBox}>
                <textarea className="form-control" rows={5} value={declinemessage} placeholder='type your message for declining here '
                  onChange={(e) => { setDeclineMessage(e.target.value) }}
                >

                </textarea>
              </div>}
            <div className="m-3 button-group" >
              <button
                onClick={(ev) => actionController('success')}
                className="btn btn-primary"
              >
                Approve
              </button>
              <button
                onClick={(ev) => actionController('decline')}
                className="btn btn-warning text-white">Decline</button>
              <button
                onClick={(ev) => actionController('further examination')}
                className="btn btn-info text-white">Request futher Examination</button>
            </div>
          </div>
          {/* <div id='sample-status-rejection' className="d-flex">
            <div className="rejection-clip
            "style={{ border: validated == false ? '10px solid red' : '10px solid green' }}
            ></div>
            <button className={validated != false ? "btn btn-success" : 'btn btn-danger'}>{validated != false ? validated : 'rejection'}</button>
          </div> */
          }
        </div>
      </div>
    </>
  )
}



// using page static props
export async function getServerSideProps() {
  // get the data from the database
  let data = await customFetch(`sample?status=REJECTED`);

  const { status } = data;

  if (status == 401) {
    return {
      redirect: {
        destination: '/authentication/login',
        permanent: false,
      },
    }
  }
  return {
    props: {
      data,
    }
  }
}