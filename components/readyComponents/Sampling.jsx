import React from 'react';

export default function Sampling({ data }) {
  return (
    <div className='btn btn-secondary p-2 m-2' style={{width: '95%'}}>
      <h4 className='text-uppercase'> {data.title}</h4>
      <h3>{data.value}</h3>
    </div>
  );
}
