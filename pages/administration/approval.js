import { useContext, useEffect, useState } from "react";
import { customFetch, handleDecision } from "../../components/Auth/customFetch";
import { IconButton } from "@mui/material";
import { Launch } from "@mui/icons-material";
import AuthContext from "../../components/Auth/useAuthentification";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
export default function Approval() {
  const [clients, setClients] = useState([]);
  const { auth } = useContext(AuthContext);
  const { employeeid } = auth;



  useEffect(() => {
    customFetch("manager/approvalist")
      .then((response) => setClients(response))
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


  const handleMessage = function (ev, client, target, index) {
    const value = ev.target.value;
    setClients((prev) => {
      const newClient = [...prev];
      newClient[index][target] = value;
      return newClient;
    })
  }

  return (
    <FrontDeskLayout>
      <div className="mx-3 my-2">
        <div className="card">
          <div className="card-header">
            <h5>Result awaiting approval</h5>
          </div>
          <div className="card-body mx-3 my-2 p-0">
            <table className="billing-cart-table">
              <thead>
                <tr>
                  <th> Billing ID</th>
                  <th> Patient Name</th>
                  <th> Test</th>
                  <th>actions</th>
                  <th>Decline message</th>
                  <th>plan</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 && clients.map((client, index) => {
                  return (
                    <tr key={index}>
                      <td>{client.billingid}</td>
                      <td>{client.fullname}</td>
                      <td>{client.NAME}</td>
                      <td>
                        <button
                          style={{ marginRight: "10px" }}
                          className="btn btn-sm btn-success"
                          onClick={() => handleDecision(client, "approve", setClients, clients,employeeid)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDecision(client, 'decline', setClients, clients,employeeid)}
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
                      </td>
                      <td>
                        <textarea value={client.declineMessage} className="form-control" rows="2" onChange={(e) => { handleMessage(e, client, 'declineMessage', index) }}></textarea>
                      </td>
                      <td>
                        <textarea value={client.actionPlan} className="form-control" rows="2" onChange={(e) => { handleMessage(e, client, 'actionPlan', index) }}></textarea>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FrontDeskLayout>
  );
}
