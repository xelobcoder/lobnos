import React, { useEffect, useState } from 'react';
import { customFetch } from '../../components/Auth/customFetch';
import { IconButton } from '@mui/material';
import { Launch } from '@mui/icons-material';
import DisplayTest from '../../components/operations/DisplayTest';




export default function Approval() {
  const [clients, setClients] = useState([]);


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
    customFetch('manager/approvalist')
      .then((response) => setClients(sortByUrgency(response)))
      .catch((error) => console.log(error))
  }, [])


  const navigation = function (testid, billingid, test,category) {
    let testname = (test.replace(/\s/g, '_').toLowerCase());
    window.open(`/registration/result?billingid=${billingid}&&testid=${testid}&&test=${testname}`);
  }

  return (
    <>
      <div className="client-results">
        <h2>Client Results</h2>
        <div className="client-grid">
          {clients.map((client) => (
            <div key={client.billingid} className="client-card">
              <span
                className={`billing-id ${client.URGENCY.toLowerCase()}`}
              >
                {client.billingid}
              </span>
              <div className="client-info">
                <p>Full Name: {client.fullname}</p>
                <p>Test: {client.NAME}</p>
                <p>Test ID: {client.testid}</p>
              </div>
              <div className="action-buttons">
                <button style={{ marginRight: '10px' }}>Approve</button>
                <button>Decline</button>
                <IconButton
                  component="a"
                  rel="noopener noreferrer"
                  onClick={() => navigation(client.testid, client.billingid, client.NAME)}
                >
                  <Launch />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
