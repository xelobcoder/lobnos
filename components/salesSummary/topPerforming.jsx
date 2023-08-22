import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import { Typography } from '@mui/material';

export default function TopPerforming({ category, count }) {
  const [data, setData] = useState([]);
  const getTopOrganization = async function () {
    const response = await customFetch(`${category}/performance/top?count=${count}`);
    const { status, result, statusCode } = response;
    statusCode == 200 && status == 'success' ? setData(result) : setData([])
  }

  useEffect(() => {
    getTopOrganization()
  }, [])


  return (
    <>
      <div>
        <div>
          <Typography variant='h5' className='btn btn-success mb-1'>
            Month Top performing {category}s
          </Typography>
        </div>
        <table id='custom-table'>
          <thead>
            <tr>
              <th>#</th>
              <th>{category}</th>
              <th>commission rate</th>
              <th>commission</th>
            </tr>
          </thead>
          <tbody>
            {
              data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.commissionRate}</td>
                    <td>{item.commissionEarned}</td>
                  </tr>)
              })
            }
          </tbody>
        </table>
      </div>
    </>
  )
}
