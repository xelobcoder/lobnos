import React from 'react';

export default function Sampling({ data, colorIndex }) {
  const color = {
    0: 'bg-secondary',
    1: 'bg-danger',
    2: 'bg-warning',
    3: 'bg-primary',
    4: 'bg-success',
    5: 'bg-success'
  }
  return (
    <div className={`btn ${color[colorIndex]} text-white p-2 my-2`} style={{ width: '95%' }}>
      <h6 className='text-uppercase '> {data.title}</h6>
      <h4>{data.value}</h4>
    </div>
  );
}
