import React, { useEffect, useState, useCallback } from 'react'
import { customFetch } from '../Auth/customFetch';



export default function TopPerforming({ category, count, from, to }) {
  const [data, setData] = useState([]);

  const getTopOrganization = useCallback(async function () {
    const response = await customFetch(`${category}/performance/top?count=${count}&&from=${from}&&to=${to}`);
    const { status, result, statusCode } = response;
    statusCode == 200 && status == 'success' ? setData(result) : setData([])
  }, [category, count, from, to])

  useEffect(() => {
    getTopOrganization()
  }, [getTopOrganization])



  return (
    <>
      <div>
        <table className='table'>
          <thead>
            <tr>
              <th>#</th>
              <th>{category}</th>
              <th>total sales</th>
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
                    <td>{item.totalSales}</td>
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
