import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import { Typography } from '@mui/material';

export default function DailySalesListView() {
  const [data, setData] = useState([])
  const fetchYearly = async () => {
    const response = await customFetch(`sales/summary/general?target=daily`);
    const { status, statusCode, result } = response;
    if (status == "success" && statusCode == 200) {
      setData(result);
    }
  }

  useEffect(() => {
    fetchYearly();
  }, [])


  return (
    <>
      <div>
        <div>
          <Typography variant='h5' className='btn btn-success mb-1'>
            Days of the month
          </Typography>
        </div>
        <table id='custom-table'>
          <thead>
            <tr>
              <th>day</th>
              <th>date</th>
              <th>case count</th>
              <th>sales amount</th>
              <th>Amount Received</th>
              <th>discount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.Day}</td>
                  <td>{item.date.slice(0, 10)}</td>
                  <td>{item.totalCases}</td>
                  <td>{item.salesAmount}</td>
                  <td>{item.totalAmountReceived}</td>
                  <td>{item.discount}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
