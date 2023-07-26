import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import { EnergySavingsLeaf } from '@mui/icons-material';

export default function ReadyList({ readydata, changeLayout }) {
  const [active, setActive] = useState(null);
  return (
    <>
      <Box >
        <div className='card br-5'>
          <div className='card-header'>
            <input className='form-control' placeholder='search here using the billingID or fullname '/>
          </div>
          <div className='card-header  read-result-list '>
            <div>Billid</div>
            <div>fullname</div>
            <div>status</div>
            <div>completed</div>
            <div>view</div>

          </div>
          <div className='card-body p-0' id='read-body-card'>
            {readydata.length > 0 &&
              readydata.map((item, index) => {
                return (
                  <div key={index} className='read-result-list p-3' style={{ backgroundColor: `${active == index ? 'whitesmoke' : 'white'}` }}>
                    <div className="billing_id">{item.billingid}</div>
                    <div>{item.fullname}</div>
                    <div>
                      <div
                        className={`status ${item.status === 'Ready'
                            ? "ready_status"
                            : "pending_status"
                          }`}
                      >
                        {item.status}
                      </div>
                    </div>
                    <div>{item.readycount}/{item.testcount}</div>
                    <div className='btn btn-success' 
                    onClick={(e) => {
                      changeLayout('three', item.billingid);
                      setActive(index);
                    }}>
                      <EnergySavingsLeaf
                        className='view_icon text-white'
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </Box>
    </>
  );
}
