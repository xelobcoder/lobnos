"use client"
import React, { useEffect, useState } from 'react'
import { getDataAndUpdateState } from '../Auth/customFetch';
import Chart from 'react-google-charts';
import { useCallback } from 'react';



export default function PerformanceChartGeneral({ target, title, subtarget }) {
  const [data, setData] = useState([]);

  const getAndTransform = useCallback(async () => {
    const source = await getDataAndUpdateState(setData, `sales/summary/general?target=${target}`, true);
    if (Array.isArray(source) && source.length > 0) {
      let transform = source.map((item, index) => {
        return [`${item[subtarget]}`, item.salesAmount, item.totalCases];
      })
      setData([[`${subtarget}`, 'salesAmount', 'totalCases'], ...transform]);
    }
  }, [target, subtarget])

  const options = {
    chart: {
      title,
      subtitle: `${subtarget} total cases count and sales amount`,
    },
  };


  useEffect(() => {
    getAndTransform();
  }, [target, getAndTransform]);


  return (
    <>
      <div className='bg-white px-2'>
        {data.length > 0 ?
          (<Chart chartType='Bar' data={data} width={'90%'} height={'400px'} options={options} />)
          :
          <h1 className='alert alert-danger'>No data provided to display chart</h1>}
      </div>
    </>
  );
}
