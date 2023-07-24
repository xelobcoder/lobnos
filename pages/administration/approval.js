import React, { useEffect, useState } from "react";
import {
  customFetch,
  customPost,
  handleChange,
  handleComments,
  handleResponse,
  validateFormData,
} from "../../components/Auth/customFetch";
import { IconButton, Tooltip } from "@mui/material";
import { Launch } from "@mui/icons-material";
import DisplayTest from "../../components/operations/DisplayTest";
import Tip from "../../components/accessories/Tip";

export default function Approval() {
  const [clients, setClients] = useState([]);
  const [splinter, setSplinter] = useState(false);
  const [active, setActive] = useState({ billingid: null, testid: null });
  const [rejectionMessage, setRejectionMessage] = useState({
    declineMessage: "",
    actionplan: "",
  });

  useEffect(() => {
    function sortByUrgency(data) {
      return data.sort((a, b) => {
        const urgencyA = a.URGENCY.toLowerCase();
        const urgencyB = b.URGENCY.toLowerCase();
        if (urgencyA < urgencyB) {
          return -1;
        }
        if (urgencyA > urgencyB) {
          return 1;
        }
        return 0;
      });
    }
    customFetch("manager/approvalist")
      .then((response) => setClients(sortByUrgency(response)))
      .catch((error) => console.log(error));
  }, []);

  const navigation = function (testid, billingid, test, category) {
    // replace all space with _
    let testname = test.replace(/\s/g, "_").toLowerCase();
    // format test to match pregnacy_test for pregnancy test
    const formattedTestName = function () {
      switch (testname) {
        case "pregnancy_test(urine)":
          return "pregnancy_test";
        case "estimated_sedimentation_rate_(esr)":
          return "esr";
        default:
          return testname;
      }
    };
    window.open(
      `/registration/result?billingid=${billingid}&&testid=${testid}&&test=${formattedTestName()}`
    );
  };

  const handleDecision = async function (client, decision, message) {
    setSplinter(false);
    if (decision == 'approve') {
      const pushData = await customPost('result/approve', 'POST', { ...client, decision, message });
      if (pushData?.status == 'success' && decision == 'approve') {
        //  remove item ffrom clients
        const getClient = clients.filter((item, index) => { return !(item.billingid == client?.billingid && client?.testid == item?.testid) })
        setClients(getClient)
      }
    }

    if (decision == 'decline') {
      setSplinter(true);
      setRejectionMessage({
        actionplan: '',
        declineMessage: ''
      })
      setActive({ billingid: client.billingid, testid: client.testid })
    }
  };


  const declineTest = async function (client) {
    // we want to ensure at all time the rejectionMessage object properties are filled.
    // setSplinter(true);
    const { billingid, testid } = client;
    setActive({ billingid, testid });
    // update the state of active after successful entry of the data
    const clearFields = function (data) {
      const { status, statusCode, message } = data;
      if (status == 'success' && statusCode == 200) {
        alert(message)
        setActive({ billingid: '', testid: '' });
        setRejectionMessage({ declineMessage: '', actionplan: '' });
        setSplinter(false);
        //  remove item ffrom clients
        const getClient = clients.filter((item, index) => { return !(item.billingid == client?.billingid && client?.testid == item?.testid) })
        setClients(getClient);
      }
    }
    // validate form data before sending the result
    await validateFormData({ ...client, decision: 'decline', message: rejectionMessage }, true, [], 'result/approve', clearFields)

  }



  return (
    <>
      <div className={splinter ? "client-results splinter" : "client-results"}>
        <div className="card m-2 mt-4  br-5">
          <div className="card-header">
            <strong className="btn btn-danger">Result awaiting approval</strong>
          </div>
          <div className="card-body p-0">
            {clients.map((client, index) => (
              <div
                key={index}
                className={
                  client.billingid == active.billingid &&
                    client.testid == active.testid
                    ? "client-card active-card"
                    : "client-card"
                }
              >
                <div className="client-info">
                  <p>
                   {client.declineMessage &&  
                   <Tooltip arrow 
                    sx={{
                      bgcolor:'white',
                      color:'black',
                      width:'500px',
                      padding:0
                    }}
                    title={<Tip body={client.declineMessage} header={'previously declined'}/>}>
                      <span
                        className={client.declineMessage != null && 'show-previous-decline '}
                      >{client.billingid}
                      </span>
                    </Tooltip>}
                    {
                      !client.declineMessage && client.billingid
                    }
                  </p>
                  <p>{client.fullname}</p>
                  <p>{client.NAME}</p>
                </div>
                <div>
                  <button
                    style={{ marginRight: "10px" }}
                    className="btn btn-success"
                    onClick={() => handleDecision(client, "approve", null)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDecision(client, 'decline', null)}
                  >
                    Decline
                  </button>
                  <IconButton
                    component="a"
                    rel="noopener noreferrer"
                    onClick={() =>
                      navigation(client.testid, client.billingid, client.NAME)
                    }
                  >
                    <Launch />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
        {splinter && (
          <div className="splinter-section">
            <div className="card mt-4 br-5" style={{ marginRight: "20px" }}>
              <div className="card-header bg-light">
                <strong>Reason for decline</strong>
              </div>
              <div className="card-body">
                <textarea
                  row={5}
                  value={rejectionMessage.declineMessage}
                  className="form-control"
                  onChange={(e) =>
                    handleComments(e, rejectionMessage, "declineMessage", setRejectionMessage)
                  }
                />
              </div>
              <div className="card-header border bg-light">
                <label>
                  <strong>action</strong>
                </label>
              </div>
              <div className="card-body">
                <textarea
                  row={4}
                  value={rejectionMessage.actionplan}
                  onChange={(e) =>
                    handleComments(e, rejectionMessage, "actionplan", setRejectionMessage)
                  }
                  className="form-control"
                />
              </div>
              <div className="card-footer">
                <button className="btn btn-danger" onClick={() => declineTest(active)}>execute</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
