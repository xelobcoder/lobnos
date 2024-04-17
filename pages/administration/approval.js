import { useContext, useEffect, useState } from "react";
import { customFetch, formatTest, handleDecision, printResultNavigator } from "../../components/Auth/customFetch";
import { IconButton } from "@mui/material";
import { Launch } from "@mui/icons-material";
import AuthContext from "../../components/Auth/useAuthentification";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Loader from "../../components/accessories/Loader";
import { useRouter } from "next/navigation";
export default function Approval() {
  const [clients, setClients] = useState([]);
  const [isloading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const { employeeid } = auth;



  useEffect(() => {
    setLoading(true);
    customFetch("manager/approvalist")
      .then((response) => setClients(response))
      .catch((error) => setClients([]))
      .finally(() => {
        setLoading(false)
      });
  }, []);

  const navigation = function (client) {
    const { billingid } = client;
    printResultNavigator(router, billingid, client, true);
  };


  const handleMessage = function (ev, client, target, index) {
    const value = ev.target.value;
    setClients((prev) => {
      const newClient = [...prev];
      newClient[index][target] = value;
      return newClient;
    })
  }



  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      if (clients.length == 0) {
        return <tr><td>No test for approval</td></tr>
      } else {
        return (
          <table className="billing-cart-table">
            <thead>
              <tr>
                <th>Billing ID</th>
                <th>Patient Name</th>
                <th>Test</th>
                <th>actions</th>
                <th>Decline message</th>
                <th>plan</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => {
                return (
                  <tr key={index}>
                    <td>{client.billingid}</td>
                    <td>{client.fullname}</td>
                    <td>{client.name}</td>
                    <td>
                      <button
                        style={{ marginRight: "10px" }}
                        className="btn btn-sm btn-success"
                        onClick={() => handleDecision(client, "approve", setClients, clients, employeeid)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDecision(client, 'decline', setClients, clients, employeeid)}
                      >
                        Decline
                      </button>
                      <IconButton
                        component="a"
                        rel="noopener noreferrer"
                        onClick={() =>
                          navigation(client)
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
        )
      }
    }
  }

  return (
    <FrontDeskLayout>
      <div className="mx-3 my-2">
        <div className="card">
          <div className="card-header">
            <h5>Result awaiting approval</h5>
          </div>
          <div className="card-body mx-3 my-2 p-0">
            {renderingView()}
          </div>
        </div>
      </div>
    </FrontDeskLayout>
  );
}
