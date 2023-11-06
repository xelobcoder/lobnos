"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { getDataAndUpdateState } from '../Auth/customFetch';
import { BarChart, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';



export default function PerformanceChartGeneral({ target, type, show, title, subtarget,branchid }) {
  const [data, setData] = useState([]);

  const getAndTransform = useCallback(async () => {
    await getDataAndUpdateState(setData, `sales/summary/general?target=${target}&&branch=${branchid}`);
  }, [target,branchid])

  useEffect(() => {
    getAndTransform();
  }, [target, getAndTransform]);



  return (
    <>
      <div className='bg-white px-2'>
        {data.length == 0 ? (<h4 className='alert alert-danger'>
          No Data Available to display chart
        </h4>) :
          (
            <>
              <h6 className='text-secondary'>{title}</h6>
              {type === 'Bar' ?
                (
                  <ResponsiveContainer width='100%' height={400}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={subtarget} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={show} fill={show == 'salesAmount' ? "#198cf0" : "#82ca9d"} />
                    </BarChart>
                  </ResponsiveContainer>
                )
                :
                (<ResponsiveContainer width='100%' height={400} >
                  <LineChart data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis  dataKey={subtarget} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={show} stroke={show == 'salesAmount' ? "#8884d8" : "#82ca9d"} />
                  </LineChart>
                </ResponsiveContainer>)}

            </>
          )
        }
      </div>
    </>
  );
}
