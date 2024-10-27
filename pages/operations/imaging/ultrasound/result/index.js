import { useContext, useEffect, useState } from 'react';
import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import Indicator from '../../../../../components/accessories/Reports/indicator';
import dynamic from 'next/dynamic';
import AuthContext from '../../../../../components/Auth/useAuthentification';
import { useSearchParams } from 'next/navigation';
import Loader from '../../../../../components/accessories/Loader';
import { ToastContainer, toast } from 'react-toastify';
import UltrasoundLayout from '../../../../../components/Layout/ImagingLayout';
import PreviewPatientInformation from '../../../../../components/petientsComponent/PreviewPatientInformation';
const MARKDOWN_EDITOR = dynamic(() => import('../../../../../components/accessories/markdownEditor'), { ssr: false })

export default function EnterResultUltrasound() {
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const [fields, setFields] = useState([]);
  const [impression, setImpression] = useState("");
  const [testname, setTestName] = useState("");
  const scan = useSearchParams().get("scan");
  const testid = useSearchParams().get("testid");
  let urlpatientid = useSearchParams().get("ptid");
  const patientid = urlpatientid ? urlpatientid.slice(50) : urlpatientid
  let urlbillingid = useSearchParams().get("csvid");
  const billingid = urlbillingid ? urlbillingid.slice(70) : urlbillingid;
  const [isLoading, setLoading] = useState(true);
  const ascensionid = useSearchParams().get("ascensionid");
  const [entered, setEnteredResult] = useState(false);
  const [count, setEditCount] = useState(0);



  const getAscensionEditCount = async () => {
    customFetch(`ascension/edit/count?csvid=${urlbillingid}&&ascensionid=${ascensionid}&&testid=${testid}&&ptid=${urlpatientid}`)
      .then((result) => {
        setEditCount(result?.count);
      })
      .catch((err) => console.log(err))
  }


  const handleResult = async function () {
    const myFields = fields.map((item, index) => { return { field: item.name, value: item.value } })
    const pushContent = await customPost(`result/entry/customtest`, 'POST', {
      csvid: urlbillingid,
      testid, patientid: parseInt(patientid),
      test: scan,
      ptid: urlpatientid,
      comments: impression,
      fields: myFields,
      employeeid: auth?.employeeid,
      isScan: true,
      target: "70,50"
    })
    const { status, statusCode, message } = pushContent;
    if (status == 'success' && statusCode == 200) {
      setEnteredResult(true); toast.success(message, { autoClose: 500 });
    } else {
      toast.error(message, { autoClose: 500 })
    }
  }


  useEffect(() => {
    setLoading(true);
    const gettingFields = async function () {
      try {
        const commentsFetch = customFetch(
          `testpanel/list/customtestrule/previous/comments?testid=${testid}&&csvid=${urlbillingid}&&ptid=${urlpatientid}`
        );

        const testResultFetch = customFetch(
          `testpanel/list/customtestrule/previous?testid=${testid}&&ptid=${urlpatientid}&&csvid=${urlbillingid}`
        );

        const [resultResponse, commentsResponse] = await Promise.all([testResultFetch, commentsFetch]);

        function updatesResultForm(data) {
          const { testname, result } = data;
          if (result && Array.isArray(result)) {
            setFields(result);
            const hasAnyValueEntered = result.some((item, index) => item?.value != "");
            setEnteredResult(hasAnyValueEntered);
          }
          testname && setTestName(testname);
        }

        function updatesCommentsForm(data) {
          setImpression(data.comments);
        }

        updatesResultForm(resultResponse);
        updatesCommentsForm(commentsResponse);
        setLoading(false);
        getAscensionEditCount();
      } catch (err) {
        console.log(err)
        setFields([]);
        setImpression("");
      }
      finally {
        const selectedItem = {
          ascensionid:parseInt(ascensionid),
          testid,
          value: new Date().toISOString(),
          employeeid,
          stage: 'resultEntryStart',
        };

        const { status } = await customPost("ascension/collection/update/stage", 'POST', selectedItem);

        if (status === true) {
          console.log('result entry logged!!!')
        }
      }
    };
    if (urlbillingid && urlpatientid && ascensionid) gettingFields();
  }, [urlbillingid, urlpatientid,ascensionid, scan])



  const handleFieldChange = (data, index) => {
    const previous = [...fields];
    previous[index]['value'] = data;
    setFields(previous);
  }


  if (isLoading) return <UltrasoundLayout><Loader /></UltrasoundLayout>;

  return (
    <UltrasoundLayout>
      <ToastContainer theme='colored' className={'text-sm'} position='top-center' />
      <PreviewPatientInformation patientid={patientid} />
      <div className='mx-3' >
        <div className='mt-4 d-flex justify-content-between'>
          <h4 className='text-uppercase'>{scan}</h4>
          <Indicator style={{ marginTop: '15px' }} resultEntered={entered} />
        </div>
        <div >
          <h4 className='d-flex justify-content-center text-uppercase'>{testname}</h4>
          <div>
            {Array.isArray(fields) && fields.length > 0 && fields.map((item, index) => {
              return (
                <div className='my-3' key={index}>
                  <div>{item.name}</div>
                  <MARKDOWN_EDITOR updatedata={(ev, data) => { handleFieldChange(data, index) }} initialData={item.value} />
                </div>
              )
            })}
            <h5>Impression</h5>
            <MARKDOWN_EDITOR updatedata={(ev, data) => { setImpression(data) }} initialData={impression || "Impression Here"} />
            <button onClick={(ev) => { handleResult() }} className='btn btn-primary btn-sm  mt-2'>
              save result
            </button>
          </div>
        </div>
      </div>
    </UltrasoundLayout>
  )
}
