import { useEffect, useState, useRef } from "react";
import { Button, Link, Typography } from "@mui/material";
import REJECTEDVIEW from "../../components/samples/rejectedview";
import { customFetch, customPost } from '../../components/Auth/customFetch';
import PendingTableSample from "../../components/samples/pendingTable";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";

// buttons for the sample status

// filter component
const FILTERS = function ({ onchange, ondate, sorting, onsearch, searchArea, currentdate, setData, rejectedList }) {
  const [date, setDate] = useState("");
  return (
    <>
      <div className="d-flex w-100 mb-3">
        <div className="col-3">
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
          <Button variant="contained" color="primary" sx={{ marginLeft: '20px' }} onClick={() => {
            const data = {
              date: currentdate,
              status: onsearch
            }
            let push = async () => {
              let response = await customFetch(`sample/?date=${data.date}&status=${data.status}`)
              setData(response)
            }
            push();
          }}>Search</Button>
        </div>
        <div>
          <Button variant="contained" color="error" >
            <Link href="/sample/rejected" style={{ color: 'white', width: '200px' }}>
              View Rejected
            </Link>
          </Button>

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
      async function fetchdata() {
        let data = await customFetch(`sample`);
        setData(data)
      }
      fetchdata();
    } else {
      async function fetchdata() {
        let data = await customFetch(`sample/?status=${onsearch}`)
        setData(data)
      }
      fetchdata();
    }
  };




  // sorting the data displayed and present it to the user

  const sorting = (e) => {
    let sortingvalue = e.target.value;
    const REALTIMESTATUS = async () => {
      let response = await customFetch(`sample/?status=${sortingvalue}`)
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




  const reverse = function () {
    setRejectedList(!rejectedList);
  }


  const removeClient = async function (target) {
    const filteredData = data.filter((item, index) => { return item.BILLINGID != target });
    console.log(filteredData)
    setData(filteredData);
  }

  return (
    <>
      <div className="m-3">
        {rejectedList ? (
          <REJECTEDVIEW filteredData={filteredData} reverse={reverse} />
        ) : (
          <>
            <div>
              <div className="p-2">
                <div className="d-flex  justify-content-between">
                  <h5 className="mb-1">Sample Assessment</h5>
                  <FILTERS
                    ondate={ondate}
                    onchange={onchange}
                    setData={updateData}
                    sorting={sorting}
                    rejectedList={setRejectedList}
                    onsearch={onsearch}
                    searchArea={searchArea}
                    currentdate={currentdate}
                  />
                </div>
                <div className="list-group">
                  {data.length === 0 ? (
                    <SECOND_NO_DATA />
                  ) : (
                    <PendingTableSample
                      data={data}
                      setShow={setShow}
                      removeClient={removeClient}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}



export async function getServerSideProps(context) {
  const data = await customFetch('sample')

  const { status, message } = data;

  if (status === 401) {
    return {
      redirect: {
        destination: '/authentication/login',
        permanent: false,
      },
    }
  }

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
