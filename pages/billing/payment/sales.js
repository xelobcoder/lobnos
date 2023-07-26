import React from 'react';
import dynamic from 'next/dynamic';

const Yearly = dynamic(() => import('../../../components/salesSummary/Yearly'), { ssr: false });

export default function Sales() {
  return (
    <>
      <div className='sales_summary m-4 mb-3' >
        <Yearly target={'yearly'} headers={'Annual sales'} />
        <Yearly target={'monthly'} headers={'Year Monthly sales'} />
        <Yearly target={'weekly'} headers={'Month Weekly sales'} />
        <Yearly target={'daily'} headers={'Week daily sales'} />
      </div>
    </>
  )
}
