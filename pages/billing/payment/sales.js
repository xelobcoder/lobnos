import React from 'react';
import dynamic from 'next/dynamic';
import TopPerforming from '../../../components/salesSummary/topPerforming';
import DailySalesListView from '../../../components/salesSummary/dailySalesListView';
import { Typography } from '@mui/material';

const Yearly = dynamic(() => import('../../../components/salesSummary/Yearly'), { ssr: false });


export default function Sales() {
  return (
    <>
      <div style={{ backgroundColor: 'whitesmoke' }}>
        <div className='d-flex mt-1' style={{ margin: '0px 20px 0px 20px' }}>
          <Typography variant='h5'>
            Month
          </Typography> 
           <select placeholder='select month' >
            <option>select month</option>
          </select>
          <input  placeholder='select year' />
          <select >
            <option> select branch</option>
          </select> 
        </div>
        <div className='sales_summary mb-3 m-4'>
          <TopPerforming category={'organization'} count={5} />
          <TopPerforming category={'clinician'} count={5} />
        </div>
        <div className='sales_summary mb-4 m-4'>
          <DailySalesListView />
        </div>
        <div className='sales_summary m-4 mb-3' >
          <Yearly target={'yearly'} headers={'Annual sales'} />
          <Yearly target={'monthly'} headers={'Year Monthly sales'} />
          <Yearly target={'weekly'} headers={'Month Weekly sales'} />
          <Yearly target={'daily'} headers={'Week daily sales'} />
        </div>
      </div>
    </>
  )
}
