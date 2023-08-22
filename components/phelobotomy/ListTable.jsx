import React from 'react';
import { Button } from '@mui/material';
import router from 'next/router';

export default function ListTable({ data, handleCollectSample }) {
  return (
    <>
      {data.length > 0 && (
        <div className='m-2'>
          <table id='custom-table'>
            <thead>
              <tr>
                <th>DATE</th>
                <th>BILLINGID</th>
                <th>FULLNAME</th>
                <th>AGE</th>
                <th>GENDER</th>
                <th>URGENCY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((item, index) => {
                  return (
                    <tr key={index} >
                      <td>{item.DATE.slice(0, 10)}</td>
                      <td>{item.BILLINGID}</td>
                      <td>{item.FULLNAME}</td>
                      <td>{item.AGE}</td>
                      <td>{item.GENDER}</td>
                      <td
                        className={
                          item.URGENCY == "emmergency"
                            ? "text-danger"
                            : item.URGENCY == "moderate"
                              ? "text-warning"
                              : "text-success"
                        }>
                        {item.URGENCY}
                      </td>
                      <td>
                        <Button
                          variant="contained"
                          size='small'
                          sx={{ marginRight: "5px" }}
                          onClick={(e) =>
                            router.push("/phelobotomy/receive")
                          }
                          color="primary"
                        >
                          receive
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size='small'
                          onClick={(e) => {
                            handleCollectSample(
                              item.BILLINGID,
                              item.PATIENTID
                            );
                          }}
                        >
                          pull sample
                        </Button>
                        {/* <Button
                          variant='contained'
                          size='small'
                          sx={{ marginLeft: "5px" }}
                          color='error'
                        >
                          Report
                        </Button> */}
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
