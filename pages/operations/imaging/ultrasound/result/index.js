import { useContext, useEffect, useState } from 'react';
import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import Indicator from '../../../../../components/accessories/Reports/indicator';
import dynamic from 'next/dynamic';
import AuthContext from '../../../../../components/Auth/useAuthentification';
import { useSearchParams } from 'next/navigation';
import ScanPreview from '../../../../../components/operations/scanPreview';
import Loader from '../../../../../components/accessories/Loader';
import { Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import ApplicationHeader from '../../../../../components/Layout/HeaderNav';
import UltrasoundLayout from '../../../../../components/Layout/ImagingLayout';
import PreviewPatientInformation from '../../../../../components/petientsComponent/PreviewPatientInformation';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false })

export default function EnterResultUltrasound() {
  const { auth } = useContext(AuthContext);
  const [content, setContent] = useState('<h5>Type something here </h5>');
  const scan = useSearchParams().get("scan");
  const fullname = useSearchParams().get("fullname");
  const testid = useSearchParams().get("testid");
  let patientid = useSearchParams().get("ptid");
  patientid = patientid ? patientid.slice(50) : patientid
  let billingid = useSearchParams().get("csvid");
  billingid = billingid ? billingid.slice(70) : billingid;
  const [isLoading, setLoading] = useState(true);
  const [entered, setEnteredResult] = useState(false);
  const [previewReport, setPreview] = useState(false);




  const handleResult = async function () {
    const pushContent = await customPost(`result/entry/customtest`, 'POST', {
      billingid: parseInt(billingid),
      testid, patientid: parseInt(patientid),
      test: scan,
      fields: [{ field: 'ultrasound', value: content }],
      employeeid: auth?.employeeid,
      isScan: true
    })
    const { status, statusCode, message } = pushContent;
    if (status == 'success' && statusCode == 200) {
      setEnteredResult(true); toast.success(message, { autoClose: 500 });
    } else {
      toast.error(message, { autoClose: 500 })
    }
  }


  const handlePreview = (value) => { setPreview(value) }

  useEffect(() => {
    setLoading(true);
    customFetch(`testpanel/list/customtestrule/previous?billingid=${billingid}&&testname=${scan}&&patientid=${patientid}&&target=70,50`)
      .then((data) => {
        if (Object.keys(data).length > 0 && data) {
          setContent(data.value)
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setContent("");
      })
  }, [billingid, patientid, scan])


  const rendering = () => {
    if (isLoading) return <Loader />
    else {
      return (
        <div className='mt-3'>
          <MARKDOWN_EDITOR updatedata={(ev, data) => { setContent(data) }} initialData={content} />
          <button onClick={(ev) => { handleResult() }} className='btn btn-primary btn-sm  mt-2'>
            save result
          </button>
        </div>
      )
    }
  }


  if (isLoading) return <UltrasoundLayout><Loader /></UltrasoundLayout>
  return (
    <>
      <ToastContainer />
      <UltrasoundLayout>
        <PreviewPatientInformation patientid={patientid}/>
        <div className='mx-3' >
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
      </UltrasoundLayout>
    </>
  )
}
