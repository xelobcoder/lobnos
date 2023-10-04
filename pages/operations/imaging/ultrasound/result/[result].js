import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import { modulex, formats, customPost, customFetch } from '../../../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import { Preview, Send, ViewAgenda } from '@mui/icons-material';
import ScanPreview from '../../../../../components/operations/scanPreview';
import Indicator from '../../../../../components/accessories/Reports/indicator';
export default function EnterResultUltrasound() {
  const [content, setContent] = useState('');
  const [entered, setEnteredResult] = useState(false);
  const [preview, setPreview] = useState(false);
  const [view, setView] = useState(true);
  const query = useRouter().query;

  const handleResult = async function () {
    const pushContent = await customPost(`test/result/enter`, 'POST', { billingid: query?.result, ...query, testname: 'scan', content, sonographer: 'Tiifu Hamza Kojo Boronson' })
    const { status, statusCode, message } = pushContent;
    alert(message);
    if (status == 'success' && statusCode == 200) { setEnteredResult(true) }
  }


  useEffect(() => {
    customFetch(`test/result/check?billingid=${result}&&testname=scan&&testid=${query?.testid}`)
      .then((data) => {
        const { result, statusCode, records } = data;
        setEnteredResult(result);
        if (result && records.length > 0 && records[0]['content']) {
          setContent(records[0]['content'])
        }
      })
      .catch((err) => console.log(err))
  }, [])

  return (
    <>
      <div className={`mt-2 ${view == true && !preview ? 'grid-view' : view && preview ? 'grid-2' : 'straight-view'}`} >
        {!preview ? (
          <div>
            <h4>Personal Information</h4>
            <div className='list-group'>
              <div className='list-group-item text-capitalize'>
                Fullname:{query?.fullname}
              </div>
              <div className='list-group-item text-capitalize'>
                patientid: {query?.patientid}
              </div>
              <div className='list-group-item text-capitalize'>
                serviceid: {query?.result}
              </div>
            </div>
          </div>
        ) : <div> <ScanPreview content={content} /></div>}
        {/* end of first-- */}
        <div>
          <div className='mt-4'>
            <Indicator resultEntered={entered} />
          </div>
          <h2 className='text-center mt-2 text-uppercase'>{query?.scan}</h2>
          {ReactQuill ? (
            <ReactQuill
              theme="snow"
              value={content}
              modules={modulex}
              style={{ height: '70vh' }}
              formats={formats}
              onChange={setContent}
              placeholder="Write something here..."
            />
          ) : (
            'Loading...'
          )}
          <div className='mt-5'>
            <Button onClick={(ev) => { handleResult() }} variant='contained' className='mt-5'>  save result <Send /></Button>
            <Button variant='contained' className='mt-5' style={{ marginLeft: '20px' }} onClick={(ev) => { setPreview(!preview) }}>
              preview result <Preview />
            </Button>
          </div>
        </div>
      </div>
      <div className='viewicon' onClick={(ev) => { setView(!view) }}>
        <ViewAgenda />
      </div>
    </>
  )
}
