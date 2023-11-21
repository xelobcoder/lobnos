import React from 'react';

export default function Sampling({ data, colorIndex }) {
  return (
    <div className={`my-2 border br-5`} style={{display:'grid',gridTemplateColumns:'100%'}}>
      <span style={{backgroundColor:''}} className='modal-color p-2 text-capitalize lims-text-color border-bottom'> {data.title}</span>
      <span className='text-center fw-bold' style={{fontSize:'40px'}}>{data.value}</span>
    </div>
  );
}
