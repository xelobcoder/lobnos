import React, { useEffect, useState, useCallback } from 'react'
import { customFetch } from '../Auth/customFetch';
import { useRouter } from 'next/navigation';


export default function TopPerforming({ category, count, from, to }) {
  const [data, setData] = useState([]);
  const router = useRouter();

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
              <th>{category}</th>
              <th>total sales</th>
              <th>commission rate</th>
              <th>commission</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {
              data.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.totalSales}</td>
                    <td>{item.commissionRate}</td>
                    <td>{item.commissionEarned}</td>
                    <td>
                      <button
                        onClick={(ev) => { router.push(`/dashboard/organization/details?id=${item.id}&&organizationame=${item.name}`) }} className='btn btn-warning btn-sm text-sm '>
                        view detail
                      </button>
                    </td>
                  </tr>)
              })
            }
          </tbody>
        </table>
      </div>
    </>
  )
}
