import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {customPost, customFetch } from '../../../../../components/Auth/customFetch';
import { Preview, Send, ViewAgenda } from '@mui/icons-material';
import ScanPreview from '../../../../../components/operations/scanPreview';
import Indicator from '../../../../../components/accessories/Reports/indicator';
import ImagingSidebar from '../../../../../components/ImagingSidebar';
import dynamic from 'next/dynamic';
const  MARKDOWN_EDITOR = dynamic(  () => import('../../../../../components/accessories/markdownEditor'), { ssr: false })

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
    if (query?.result && query?.testid) {
      customFetch(`test/result/check?billingid=${query?.result}&&testname=scan&&testid=${query?.testid}`)
        .then((data) => {
          const { result, statusCode, records } = data;
          setEnteredResult(result);
          if (result && records.length > 0 && records[0]['content']) {
            setContent(records[0]['content'])
          }
        })
        .catch((err) => console.log(err))
    }
  }, [query?.result, query?.testid])

  return (
    <>
    <ImagingSidebar/>
      <div className={`scan-interface mt-2 ${view == true && !preview ? 'grid-view' : view && preview ? 'grid-2' : 'straight-view'}`} >
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
          <h4 className='text-center  text-uppercase'>{query?.scan}</h4>
          <div className='mt-5'>
            <MARKDOWN_EDITOR initialData={ '<h5>Type something here </h5>'} />
            <button onClick={(ev) => { handleResult() }} className='btn btn-primary  mt-2'>  save result <Send /></button>
            <button className='btn btn-primary  mt-2' style={{ marginLeft: '20px' }} onClick={(ev) => { setPreview(!preview) }}>
              preview result <Preview />
            </button>
          </div>
        </div>
      </div>
      <div className='viewicon' onClick={(ev) => { setView(!view) }}>
        <ViewAgenda />
      </div>
    </>
  )
}
