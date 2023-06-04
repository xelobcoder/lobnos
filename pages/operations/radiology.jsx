import React, { useMemo } from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core';
import ReactDOM from 'react-dom';
import { PDFViewer } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Header from '../../components/header';
const PDF_VIEWER = dynamic(() => import('../../components/accessories/pdfView'), {
  ssr: false
})


export default function RADIOLOGY_PAGE() {
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);


  }, [])



  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '50% auto' }}>
        <div>

        </div>
        <div>
          <PDF_VIEWER />
        </div>
      </div>
    </>
  )
}


RADIOLOGY_PAGE.getLayout = function (page) {
  return (
    <>
      <div>
        {page}
      </div>
    </>
  );
};