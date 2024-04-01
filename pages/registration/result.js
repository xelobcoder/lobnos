import { useState, useEffect } from 'react';
import CompanyHeaders from '../../components/ResultView/CompanyHeaders';
import CompanyFooter from '../../components/ResultView/CompanyFooter';
import { readyToPrint } from '../../components/Auth/customFetch';
import SamplingInformationResult from '../../components/ResultView/SamplingInformationResult';
import PersonalInformation from '../../components/ResultView/PersonalInformation';
import { useSearchParams } from 'next/navigation';
import UseCustomResultTemplating from '../../components/ResutlUI/useCustomResultTemplating';
import UseResultCommentSingle from '../../components/ResutlUI/useResultCommentSingle';


export default function RESULT_FOR_PRINTING() {
  const [headers, setHeaders] = useState([]);
  const testid = useSearchParams().get('testid');
  const billingid = useSearchParams().get('billingid');
  const test = useSearchParams().get('test');
  const patientid = useSearchParams().get('patientid');





  useEffect(() => {
    const handleKeyPress = async function (event) {
      if (event.ctrlKey && event.key === 'p') {
        await readyToPrint(billingid, testid);
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  })




  return (
    <div className='result_page'>
      <div className='result'>
        <CompanyHeaders billingid={billingid} />
        <PersonalInformation patientid={patientid} billingid={billingid} />
        <SamplingInformationResult billingid={billingid} testid={testid} />
        <UseCustomResultTemplating testid={testid} test={test} billingid={billingid} patientid={patientid} />
        <UseResultCommentSingle billingid={billingid} testid={testid} />
        <CompanyFooter details={headers} />
      </div>
      <div>
      </div>
      <div className='print-section'>
        <button style={{ position: 'absolute', top: 20, left: '40px' }} className='btn btn-success btn-sm'
          onClick={() => readyToPrint(billingid, testid)}>
          print result
       </button>
      </div>
    </div>
  )
}
