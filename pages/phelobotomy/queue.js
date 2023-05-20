import { Button } from "@mui/material";
import Header from "../../components/header";
import React, { useEffect, useRef, useState } from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import router from "next/router";
import CheckIcon from "@mui/icons-material/Check";
import { Route } from "@mui/icons-material";
import SECOND_NO_DATA from "../../components/accessories/secondNodata";
import { customFetch } from "../../components/Auth/customFetch";
export default function Phelobotomy() {
  const [fallback, setFallback] = useState([]);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState(false);
  const [timer, setTimer] = useState(60000);
  const [splitScreen, setSplitScreen] = useState(false);
  const [sortingby, setSorting] = useState('')
  const [collection, setCollection] = useState({
    billingid: null,
    patientid: null,
    fullname: "TIIFU hamza",
  });

  // define ref for barcode and receipt
  const barcodeRef = useRef();
  const receiptRef = useRef();

  // state for all samples collected
  const [allCollected, setAllCollected] = useState(false);

  const [testpanel, setTestpanel] = useState([]);
  // this state create an object for each test and button to indicate received;

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
  useEffect(() => {
    try {
      let getdata = async () => {
        let datajson = await customFetch('phelobotomy')
        // we need to sort the data by urgency
        setData(await sorteddata(datajson));
        setFallback(datajson)
        // when done , fetch testpanel
        const response = await customFetch("testpanel/list");
        setTestpanel(response?.data);
      };
      getdata();

      setInterval(() => {
        getdata();
      }, timer);
    } catch (error) {
      alert('error in connection to server')
    }
  }, [timer]);

  // handle collectin of sample button

  const handleCollectSample = async (id, patientid) => {
    // where id is the billing id, weload a modal to collect the sample information
    // split screen for sample details panel to be revealed
    setSplitScreen(true);
    // update collection state
    setCollection({ billingid: id, patientid, fullname: "tiifu hamza" });
    // filter data using the billing id
    const filteredBill = data.filter((item, index) => item.BILLINGID == id);

    // empty test collection
    setTestCollection([]);

    // set all samples collected state false

    setAllCollected(false);

    // empty is Not message

    setIsNotMessage("");

    // get test from filteredBill and populate testcollection state
    const test = filteredBill[0]["TEST"].split(",");
    // return a map
    const created_panels = test.map((item, indexx) => {
      return {
        test: item,
        billid: id,
        collected: false,
        sample: getSampleType(item, "SAMPLE"),
        qtyrequired: getSampleType(item, "QTY_REQUIRED"),
        sampleContainer: getSampleType(item, "SAMPLE_CONTAINER"),
        unit: getSampleType(item, "UNIT"),
      };
    });

    // poupulate test collection
    setTestCollection(created_panels);
  };


  // this function changes state of test clicked when the sample have been taken

  const handleIndividualSample = async (index) => {
    const filtertest = testcollection.filter((item, i) => i === index);
    const unfilteredtest = testcollection.filter((item, i) => i != index);
    filtertest[0]["collected"] = true;
    // change the state
    setTestCollection([filtertest[0], ...unfilteredtest]);
  };

  // this functions changes the collectin state of ehe client to true
  useEffect(() => {
    const handleAllCollected = async (e) => {
      let collextion = testcollection.map((item, index) => {
        return {
          test: item.test,
          collected: allCollected,
          billid: item.billid,
          sample: getSampleType(item.test, "SAMPLE"),
          qtyrequired: getSampleType(item.test, "QTY_REQUIRED"),
          sampleContainer: getSampleType(item.test, "SAMPLE_CONTAINER"),
          unit: getSampleType(item.test, "UNIT"),
        };
      });

      setTestCollection(collextion);
    };

    handleAllCollected();
  }, [allCollected]);

  // get te sample type of test

  const getSampleType = (test, field) => {
    const matched = testpanel.filter((item, index) => {
      return test === item.NAME;
    });
    return matched[0]?.[field];
  };

  // this function handles submit form

  const handleSubmit = async () => {
    // redefine the test collection array only to include the billingid and collected status
    const definedCollection = testcollection.map((item, index) => {
      // this filter the testid from the testpanel
      const getid = testpanel.filter((itemx, indexx) => {
        return itemx.NAME === item.test;
      });
      return {
        billingid: item.billid,
        collection: `${item.collected}`,
        testid: getid[0].ID,
      };
    });

    const doneTime = new Date();
    const data = {
      test: definedCollection,
      message: isnotMessage,
      billingid: collection.billingid,
      patientid: parseInt(collection.patientid),
      fullname: collection.fullname,
      datetime: doneTime,
      time: doneTime.getHours() + doneTime.getMinutes() + doneTime.getSeconds(),
      status: "done".toUpperCase(),
      takenby: 5,
    };

    //  this would check to ensure at least one of the samples have been collected

    const atleastOneCollected = testcollection.some((item, index) => {
      return item.collected === true;
    });

    if (!atleastOneCollected) {
      alert("atleast one sample has to be collected to finish");
    }

    if (atleastOneCollected) {
      //  check if all samples is collected here and if it isnt , then the message side shoudlnt be empty
      const emptyMessage = data.message == "" ? true : false;
      const partial = testcollection.filter(
        (i, e) => i.collected === false
      ).length;

      if (partial > 0 && emptyMessage) {
        alert("please fill textbox with reason why all samples not taken");
      } else {
        //  send to swerver
        data.alltaken = partial == 0 ? true : false;
        data.message = partial === 0 ? "" : data.message;
        const pushData = await fetch(`${process.env.BASEURL}/phelobotomy`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN} `
          },
          body: JSON.stringify(data),
        });

        const response = await pushData.json();
        // destructure billing
        const { status, statusCode, message } = response;

        if (status == "success") {
          alert(message);
          setSplitScreen(false);
          router.reload();
        } else {
          if (
            error &&
            message == "duplicate testid and billing id found in database"
          ) {
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

  console.log(data)
  return (
    <>
      <div className={splitScreen === true ? "splitScreen" : null}>
        <div className="phelobotomy-wrapper">
          <div className="m-2 col-10 d-flex">
            <div className="col-5">
              {/* sleect box for the sorting the data */}
              <Button variant="outlined" onClick={(e) => {setData(fallback); setSorting('')}}>Remove filter</Button>
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
            <div className="col-6">
              {/* search here using client billing id or fullname */}
              <input
                type="text"
                className="custom-input"
                placeholder="search using bill ID or patient id"
              />
            </div>
            <div style={{ marginLeft: '20px' }}>
              <Button variant='contained' color='error'>
                incomplete
                <div className="badge">200</div>
              </Button>
            </div>
          </div>
          <hr></hr>
          {data.length === 0 ? (
            <SECOND_NO_DATA />
          ) : (
            <ListGroup className="m-2">
              {data.length == 0
                ? null
                : data.map((item, index) => {
                  return (
                    <ListGroupItem
                      key={index}
                      className="border"
                      id="sample-display-dsh"
                    >
                      <div>
                        <div className="1">{item.BILLINGID}</div>
                      </div>
                      <div>
                        <div>{item.PATIENTID}</div>
                      </div>
                      <div>
                        <div>
                          {item.FIRSTNAME} {item.MIDDLENAME} {item.LASTNAME}
                        </div>
                      </div>
                      {/* age and age type */}
                      <div>
                        <div>
                          {item.AGE} {item.AGETYPE}
                        </div>
                      </div>
                      <div>
                        <div>{item.GENDER}</div>
                      </div>
                      <div>
                        <div> Test: {item.TEST}</div>
                      </div>
                      <div>
                        <div
                          className={
                            item.URGENCY == "emmergency"
                              ? "text-danger"
                              : item.URGENCY == "moderate"
                                ? "text-warning"
                                : "text-success"
                          }
                        >
                          {item.URGENCY.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div>
                          <Button
                            variant="contained"
                            sx={{ marginRight: "5px" }}
                            onClick={(e) =>
                              router.push("/phelobotomy/receive")
                            }
                            color="primary"
                          >
                            receive
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={(e) => {
                              handleCollectSample(
                                item.BILLINGID,
                                item.PATIENTID
                              );
                            }}
                          >
                            pull sample
                          </Button>
                        </div>
                      </div>
                    </ListGroupItem>
                  );
                })}
            </ListGroup>
          )}
        </div>
        {
          splitScreen === false ? null : (
            <div className="side-pane">
              <header className="collection-header bg-warning p-2 text-capitalize text-lead">
                <span>Billid: {collection.billingid}</span>
                <br />
                <span>clientid:{collection.patientid}</span>
                <br />
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
                              <td>{item.test}</td>
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
                              <td>{item.qtyrequired}</td>
                              <td>{item.unit}</td>
                              <td>{item.sampleContainer}</td>
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
                    <input id="checkbo" type="checkbox" ref={barcodeRef} /> print
                    barcode
                    <input id="checkbo" type="checkbox" ref={receiptRef} /> print
                    receipt
                  </>
                )}
                {!allCollected && (
                  <>
                    <div className="alert alert-warning">
                      <pre>all samples not taken ?</pre>
                      entered reason in the text box below
                    </div>

                    <textarea
                      className="form-control"
                      rows={4}
                      onChange={(e) => setIsNotMessage(e.target.value)}
                      value={isnotMessage}
                    ></textarea>
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

