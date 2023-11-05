"use client"
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import TopPerforming from '../../../components/salesSummary/topPerforming';
import DailySalesListView from '../../../components/salesSummary/dailySalesListView';
import { Typography } from '@mui/material';
import DashBoardLayoutSales from '../../../components/salesSummary/DashBoardLayout';
import { useEffect } from 'react';
import { getBranches, customFetch } from '../../../components/Auth/customFetch';
import PerformanceChartGeneral from '../../../components/salesSummary/PerformanceChartGeneral';


export default function Sales() {
  const [branches, setBranches] = useState([]);
  useEffect(() => { getBranches(setBranches) }, []);

  const year = new Date().getFullYear();


  return (
    <>
      <DashBoardLayoutSales>
        {/* <div className='sales_summary mb-3 m-4'>
          <TopPerforming category={'organization'} count={5} />
          <TopPerforming category={'clinician'} count={5} />
        </div> */}
        {/* <div className='sales_summary mb-4 m-4'>
          <DailySalesListView />
        </div> */}
        <div className='col-3 mt-1 mb-1'>
          <select className='custom-select'>
            <option> select branch</option>
            <option value={'0'}>all</option>
            {branches.map((item, index) => { return <option key={item.branchid}>{item.name}</option> })}
          </select>
        </div>
        <div className='sales_summary' >
          <PerformanceChartGeneral target={'yearly'} subtarget='Year' title={'Annual sales performance chart'} />
          <PerformanceChartGeneral target={'monthly'} subtarget='Month' title={`${year} Monthly sales`} />
          <PerformanceChartGeneral target={'weekly'} subtarget='Week' title={'Month Weekly sales'} />
          <PerformanceChartGeneral target={'daily'} subtarget='Day' title={'Daily sales of the month'} />
        </div>

      </DashBoardLayoutSales>
    </>
  )
}
