import { Button } from "@mui/material";
import Header from "../../components/header";
import React, { useEffect, useRef, useState } from "react";
import router, { useRouter } from "next/router";
import CheckIcon from "@mui/icons-material/Check";
import { Route } from "@mui/icons-material";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import ListTable from "../../components/phelobotomy/ListTable";
import SidebarFrontPage from "../../components/frontpagesidebar";
export default function Phelobotomy() {
  const [fallback, setFallback] = useState([]);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState(false);
  const [timer, setTimer] = useState(60000);
  const [splitScreen, setSplitScreen] = useState(false);
  const [clientFiltering, setClientFilter] = useState({ type: 'billingid', input: '' })
  const [sortingby, setSorting] = useState('')
  const [collection, setCollection] = useState({ billingid: null, patientid: null, fullname: null });

  // get the billing id from the router and filter the clients with id for quicking updating from  the operations room
  const operations_update = useRouter().query?.billingid;


  useEffect(() => {
    if (operations_update != undefined) {
      setClientFilter({ type: 'billingid', input: operations_update })

      const matchedData = (type, value) => {
        return data.length === 0 ? [] : data.filter((e, i) => { return e[type] == value })
      }
      // filter the data and only display such 
      const matched = matchedData('BILLINGID', clientFiltering.input)
      if (clientFiltering.type == 'billingid') {
        if (matched.length > 0) {
          setData(matched)
        } else {
          // send data to the server and look out, if none display all old data
          try {
            customFetch(`phelobotomy?billingid=${operations_update}`)
              .then((data) => {
                const { message, statusCode, result } = data;
                result.length > 0 ? setData(result) : alert('Client with such billingid not Found.')
              })
              .catch((err) => console.log(err))
          }
          catch (err) {
            console.log(err)
          }
        }
      }
    }
    if (clientFiltering.type == 'fullname') {
      const { input } = clientFiltering;

      if (input.length === 0) {
        setData(fallback);
      }
      const matched = data.filter((item, i) => {
        return new String(item.FULLNAME).toLowerCase().startsWith(clientFiltering.input.toLowerCase())
      })
      matched.length > 0 ? setData(matched) : setData([])
    }
  }, [clientFiltering.type, operations_update, clientFiltering.input, clientFiltering, data, fallback])
  // define ref for barcode and receipt

  // state for all samples collected
  const [allCollected, setAllCollected] = useState(false);


  const [testcollection, setTestCollection] = useState([]);

  // sample message if all samples are not collected
  const [isnotMessage, setIsNotMessage] = useState("");

  // this function sort the retrieved data by urgency
  let sorteddata = async function (datasource) {
    return datasource.sort((a, b) => {
      if (a.URGENCY == "emmergency") { return -1; }
      else if (a.URGENCY == "moderate") { return 0; }
      else { return 1; }
    });
  }
  // get data from database
  let getdata = async () => {
    let datajson = await customFetch('phelobotomy');
    // we need to sort the data by urgency
    setData(await sorteddata(datajson));
    setFallback(datajson)
  };

  useEffect(() => {
    try {
      getdata();

      setInterval(() => {
        getdata();
      }, timer);
    } catch (error) {
      alert('error in connection to server')
    }
  }, [timer]);



  // incase 

  // handle collectin of sample button

  const handleCollectSample = async (id, patientid) => {
    // where id is the billing id, weload a modal to collect the sample information
    // split screen for sample details panel to be revealed
    setSplitScreen(true);
    // filter data using the billing id
    const filteredBill = data.filter((item, index) => item.BILLINGID == id);
    // update collection state
    setCollection({ billingid: id, patientid, fullname: filteredBill[0]?.FULLNAME });
    // empty test collection
    setTestCollection([]);
    // set all samples collected state false
    setAllCollected(false);
    // empty is Not message
    setIsNotMessage("");
    const { status, statusCode, result } = await customFetch(`phelobotomy/ascension?billingid=${id}`)
    // ensure all the keys are in lowercase 
    let newResult = result.map((item, index) => {
      let Keys = Object.keys(item);
      let obj = {};

      for (let i = 0; i < Keys.length; i++) {
        let key = Keys[i]
        let value = item[key]
        let nw = Keys[i].toLowerCase();
        obj[nw] = value;

      }
      obj['collected'] = false;
      return obj
    })
    setTestCollection(newResult || []);
  };


  // this function changes state of test clicked when the sample have been taken

  const handleIndividualSample = async (index) => {
    const filtertest = testcollection.filter((item, i) => i === index);
    const unfilteredtest = testcollection.filter((item, i) => i != index);
    filtertest[0]["collected"] = true;
    // change the state
    setTestCollection([filtertest[0], ...unfilteredtest]);
    // check to see if all test have been collected to update allcolected State
    const isAllCollected = testcollection.filter((e, i) => { return e.collected == false });
    if (isAllCollected.length == 0) { setAllCollected(true); }
  };

  // this functions changes the collection state of the client to true
  useEffect(() => {
    const handleAllCollected = async (e) => {
      let collextion = testcollection.map((item, index) => {
        let nwItem = { ...item };
        nwItem.collected = true;
        return nwItem;
      });

      setTestCollection(collextion);
    };

    handleAllCollected();
  }, [allCollected]);


  // this function handles submit form

  const handleSubmit = async () => {
    // redefine the test collection array only to include the billingid and collected status
    //  this would check to ensure at least one of the samples have been collected
    const atleastOneCollected = testcollection.some((item, index) => {
      return item.collected === true;
    });

    if (!atleastOneCollected) {
      alert("atleast one sample has to be collected to finish");
    }

    if (atleastOneCollected) {
      //  check if all samples is collected here and if it isnt , then the message side shoudlnt be empty
      const emptyMessage = isnotMessage == "" ? true : false;
      const partial = testcollection.filter((i, e) => i.collected === false).length;


      if (partial > 0 && emptyMessage) {
        alert("please fill textbox with reason why all samples not taken");
      } else {
        //  send to swerver
        const requiredTestCollectionData = testcollection.map((item, index) => {
          return { collected: item.collected, billingid: item.billingid, testid: item.testid }
        })
        const serverData = { billingid: collection.billingid, testInfo: requiredTestCollectionData, alltaken: partial.length == 0 ? 'true' : 'false', message: isnotMessage }
        const pushData = await customPost('phelobotomy', 'POST', serverData);
        // destructure billing
        const { status, statusCode, message, error } = pushData;
        if (statusCode == 200) {
          alert(message);
          setSplitScreen(false);
          getdata()
        } else {
          if (error && message == "duplicate testid and billing id found in database") {
            alert("visit incomplete sample collectionto update records");
          } else {
            alert(message);
          }
          setSplitScreen(false);
        }
      }
    }

    //  send data to server side;
  };



  const handleStateFiltering = function (value) {
    setSorting(value);
    const newData = fallback.filter((item, index) => { return item.URGENCY == value })
    setData(newData)
  }




  useEffect(() => {
    if (allCollected == false) {
      setTestCollection(testcollection.map((e, i) => { return { ...e, collected: allCollected } }))
    }
  }, [allCollected])


  return (
    <>
      <div className={splitScreen === true ? "splitScreen" : null}>
        <div className="phelobotomy-wrapper">
          <div className="m-2 col-10 d-flex">
            <div className="col-6">
              {/* search here using client billing id or fullname */}
              <input
                type="text"
                className="custom-input"
                placeholder="search using bill ID or client fullname"
                value={clientFiltering.input}
                onChange={(e) => setClientFilter({ type: 'fullname', input: e.target.value })}
              />
            </div>
            <div className="col-5" style={{ marginLeft: '30px' }}>
              {/* sleect box for the sorting the data */}
              <Button variant="outlined" onClick={(e) => { setData(fallback); setSorting('') }}>Remove filter</Button>
              <input
                type="checkbox"
                style={{ marginLeft: "20px" }}
                onClick={(e) => handleStateFiltering("emmergency")}
                value={sortingby}
                checked={sortingby == "emmergency" ? true : false}
              />
              <span className="text-success"> Emmergency </span>
              <input
                type="checkbox"
                onClick={(e) => handleStateFiltering("moderate")}
                value={sortingby}
                className="text-success ml-2"
                checked={sortingby == "moderate" ? true : false}
                style={{ marginLeft: "3px" }}
              />
              <span className="text-success">Moderate </span>
              <input
                type="checkbox"
                onClick={(e) => handleStateFiltering("none")}
                value={sortingby}
                className="text-success ml-2"
                checked={sortingby == "none" ? true : false}
                style={{ marginLeft: "3px" }}
              />{" "}
              <span className="text-success">None </span>
            </div>
          </div>
          <hr></hr>
          {data.length === 0 ? (
            <SECOND_NO_DATA />
          ) : (
            <ListTable data={data} handleCollectSample={handleCollectSample} />
          )}
        </div>
        {
          // screen display as a modal when the split screen is true
          splitScreen === false ? null : (
            <div className="side-pane">
              <header className="collection-header bg-warning p-2 text-capitalize text-lead d-flex justify-content-between">
                <span>Billid: {collection.billingid}</span>
                <span>clientid:{collection.patientid}</span>
                <span>fullname:{collection.fullname}</span>
              </header>
              <main>
                {/* create a table of all the test with respective sample type and the requied button to indicate collected or not  */}
                {testcollection.length > 0 && (
                  <>
                    <table id="custom-table">
                      <thead>
                        <tr>
                          <th>test</th>
                          <th>collected</th>
                          <th>sample type</th>
                          <th>qty required</th>
                          <th>unit</th>
                          <th>sample container</th>
                          <th>action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testcollection.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>
                                {item.collected === false ? "N/A" : "collected"}
                              </td>
                              {item.sample === "SERUM" && (
                                <td className="text-warning">{item.sample}</td>
                              )}
                              {item.sample === "BLOOD" && (
                                <td className="text-danger">{item.sample}</td>
                              )}
                              {item.sample != "BLOOD" && item.sample != "SERUM" && (
                                <td className="text-dark">{item.sample}</td>
                              )}
                              <td>{item.qty_required}</td>
                              <td>{item.unit}</td>
                              <td>{item.sample_container}</td>
                              {item.collected == true ? (
                                <>
                                  <CheckIcon
                                    sx={{ marginTop: "10px" }}
                                    color="success"
                                    fontSize="medium"
                                  />
                                </>
                              ) : (
                                <td>
                                  <Button
                                    size="small"
                                    onClick={(e) => handleIndividualSample(index)}
                                    variant="contained"
                                    color="info"
                                  >
                                    collected
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <input
                      type="checkbox"
                      checked={allCollected}
                      onChange={(e) => setAllCollected(!allCollected)}
                    />{" "}
                    All collected
                  </>
                )}
                {!allCollected && (
                  <>
                    <div className="alert alert-info mt-1" style={{ fontSize: '14px' }}>
                      <strong>all samples not taken ?</strong>
                      <p> Entered reason in the text box below</p>
                    </div>

                    <textarea
                      className="form-control"
                      rows={4}
                      onChange={(e) => setIsNotMessage(e.target.value)}
                      value={isnotMessage}
                    >

                    </textarea>
                  </>
                )}
              </main>
              <Button
                variant="contained"
                sx={{ marginTop: "20px" }}
                color="primary"
                onClick={(e) => handleSubmit()}
              >
                Done
              </Button>
              <Button
                onClick={(e) => setSplitScreen(false)}
                sx={{ marginTop: "20px", marginLeft: "20px" }}
                variant="contained"
                color="error"
              >
                close
              </Button>
            </div>
          )
        }
      </div>
    </>
  );
}


