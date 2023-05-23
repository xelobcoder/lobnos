import React from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core';
import ReactDOM from 'react-dom';
import { PDFViewer } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Header from '../../components/header';
const PDF_VIEWER = dynamic(() => import('../../components/accessories/pdfView'), {
  ssr: false
})
const url = './transcript_2.pdf'
export default function RADIOLOGY_PAGE() {
  const [client, setClient] = useState(false);
  useEffect(() => { setClient(true) }, [])

  return (
    <>
      <PDF_VIEWER />
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