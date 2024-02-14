import { useContext, useEffect, useState } from 'react';
import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import Indicator from '../../../../../components/accessories/Reports/indicator';
import dynamic from 'next/dynamic';
import Header from '../../../../../components/header';
import AuthContext from '../../../../../components/Auth/useAuthentification';
import { useSearchParams } from 'next/navigation';
import ScanPreview from '../../../../../components/operations/scanPreview';
import Loader from '../../../../../components/accessories/Loader';
import { Form } from 'react-bootstrap';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false })

export default function EnterResultUltrasound() {
  const { auth } = useContext(AuthContext);
  const [content, setContent] = useState('<h5>Type something here </h5>');
  const scan = useSearchParams().get("scan");
  const fullname = useSearchParams().get("fullname");
  const testid = useSearchParams().get("testid");
  const patientid = useSearchParams().get("patientid");
  const billingid = useSearchParams().get("billingid");
  const [isLoading, setLoading] = useState(true);
  const [entered, setEnteredResult] = useState(false);
  const [previewReport, setPreview] = useState(false);


  const handleResult = async function () {
    const pushContent = await customPost(`test/result/enter`, 'POST', { billingid, testid, patientid, scan, testname: 'scan', content, sonographer: auth?.employeeid })
    const { status, statusCode, message } = pushContent;
    alert(message);
    if (status == 'success' && statusCode == 200) { setEnteredResult(true) }
  }


  const handlePreview = (value) => { setPreview(value) }

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true);
      customFetch(`test/result/check?billingid=${billingid}&&testname=scan&&testid=${testid}`)
        .then((data) => {
          const { result, statusCode, records } = data;
          setEnteredResult(result);
          if (result && records.length > 0 && records[0]['content']) {
            setContent(records[0]['content'])
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setContent("");
        })
    }
  }, [billingid, testid])


  const rendering = () => {
    if (isLoading) return <Loader />
    else {
      return (
        <div className='mt-3'>
          <MARKDOWN_EDITOR updatedata={(ev, data) => { setContent(data) }} initialData={content} />
          <button onClick={(ev) => { handleResult() }} className='btn btn-primary btn-sm  mt-2'>
            save result
          </button>
          <button className='btn btn-primary  btn-sm mt-2' style={{ marginLeft: '20px' }}>
            preview result
          </button>
        </div>
      )
    }
  }

  return (
    <>
      <Header />
      <div className='mx-3' >
        <div>
          <div className='d-flex justify-content-between'>
            <h4>Personal Information</h4>
            <div className='d-flex'>
              <span className='mt-2 mx-2'> Preview Report </span>
              <Form.Check type='switch' onChange={(ev) => { handlePreview(ev.target.checked) }} style={{ fontSize: '25px' }} />
            </div>
          </div>
          <div className='list-group border-secondary'>
            <div className='list-group-item text-capitalize'>
              Fullname:{fullname}
            </div>
            <div className='list-group-item text-capitalize'>
              patientid: {patientid}
            </div>
            <div className='list-group-item text-capitalize'>
              serviceid: {billingid}
            </div>
          </div>
        </div>
        <div>
          <div className='mt-4 d-flex justify-content-between'>
            <h4 className='text-uppercase'>{scan}</h4>
            <Indicator style={{ marginTop: '15px' }} resultEntered={entered} />
          </div>
          <div className={!previewReport ? '' : 'grid-50'}>
            <div>
              {rendering()}
            </div>
            <div>
              {content && previewReport && <ScanPreview content={content} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
