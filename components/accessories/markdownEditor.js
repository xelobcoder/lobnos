import React, { useRef, useState, useEffect } from 'react';


export default function MARKDOWN_EDITOR() {

  return (
    <>
      <div className='mb-2'>
        <textarea style={{resize:'none'}} className='form-control' rows={5} placeholder='comments here' defaultValue='place your comments here'/>
      </div>
    </>
  );
}