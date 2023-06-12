import React, { useEffect, useState } from 'react';
import { customFetch } from '../../components/Auth/customFetch';
import { IconButton } from '@mui/material';
import { Launch } from '@mui/icons-material';



export default function Approval() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    customFetch('manager/approvalist')
      .then((response) => setClients(response))
      .catch((error) => console.log(error))
  }, [])

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
                <p>Name: {client.NAME}</p>
                <p>Test ID: {client.testid}</p>
              </div>
              <div className="action-buttons">
                <button style={{ marginRight: '10px' }}>Approve</button>
                <button>Decline</button>
                <IconButton
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
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
