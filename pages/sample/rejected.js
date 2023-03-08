import { useState, useRef } from "react";
import Header from "../../components/header";
import FilterRejectedList from "../../components/samples/FilterRejectedList";
import PersonalData from "../../components/samples/PersonalData";
import RejectedListView from "../../components/samples/rejectedListView";
import TestTable from "../../components/samples/TestTable";


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
    setSelectedClient(index);
    // filter the data from the list
    // fetch the data from the database
    async function fetchdata() {
      let pulldata = await fetch(`http://localhost:5000/api/v1/rejected?type=getsampleinfo&billingid=${index}`);
      let data = await pulldata.json();
      setSelectedClientData(data);
      const { result, statusCode } = data;
      //  if statusCode == 200
      if (result && result.length > 0 && statusCode == 200) {
        setSelectedClientData(result)
        setTestSource(result[0].TEST.split(','))
        changeValidationStatus(index);
      }

      console.log(selectedclientdata)
    }

    fetchdata();

  }

  // change the rejected circle to green or red based on the validations status
  const changeValidationStatus = async function (billingid) {
    let returner = await fetch(`http://localhost:5000/api/v1/rejected?type=getvalidationstatus&billingid=${billingid}`)
    let response = await returner.json();
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
            let push = await fetch('http://localhost:5000/api/v1/rejected', {
              method: 'POST',
              headers: {
                'Content-type': 'application/json',
              },
              body: JSON.stringify({
                billingid: selectedclient,
                message: action === 'futher' ? 'futher examination' : declinemessage,
                manager: 'Dr Ohene Ketoku',
                action
              })
            })

            let response = push.json();
            return await response;
          }
          forward_deploy()
            .then((t) => { return t })
            .then((t) => {
              console.log(t)
            })
            .catch((err) => console.log(err))
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
            <h6 className="m-3">PERFORMING TEST</h6>
            <div ref={test_table_ref}>
              <TestTable testsource={testsource} />
            </div>
            <h6 className="m-3 text-uppercase">Reason for rejection</h6>
            <div className="alert alert-danger m-3 " >
              {
                selectedclientdata.length == 0 ?
                  'sample messaage here'
                  :
                  selectedclientdata[0]['MESSAGE']}
            </div>
            {messageView === false ? null :
              <div className="message-boxs alert alert-warning m-3" ref={messageBox}>
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
          <div id='sample-status-rejection' className="d-flex">
            <div className="rejection-clip
            "
              style={{ border: validated == false ? '10px solid red' : '10px solid green' }}
            ></div>
            <button className={validated != false ? "btn btn-success" : 'btn btn-danger'}>{validated != false ? validated : 'rejection'}</button>
          </div>
        </div>
      </div>
    </>
  )
}



REJECTED_VIEW_PAGE.getLayout = function PageLayout(page) {
  return (
    <>
      <Header />
      <div >
        {page}
      </div>
    </>
  )
}


// using page static props
export async function getStaticProps() {
  // get the data from the database
  let pulldata = await fetch('http://localhost:5000/api/v1/sample?status=REJECTED');
  let data = await pulldata.json();
  return {
    props: {
      data,
    }
  }
}