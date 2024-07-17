import { useState, useEffect } from 'react';
import CompanyHeaders from '../../../components/ResultView/CompanyHeaders';
import { defaultResultSettings, getResultSettings, readyToPrint } from '../../../components/Auth/customFetch';
import SamplingInformationResult from '../../../components/ResultView/SamplingInformationResult';
import PersonalInformation from '../../../components/ResultView/PersonalInformation';
import { useSearchParams } from 'next/navigation';
import UseCustomResultTemplating from '../../../components/ResutlUI/useCustomResultTemplating';
import UseResultCommentSingle from '../../../components/ResutlUI/useResultCommentSingle';
import UseClinicalLiteratureReview from '../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseResultEntryScientist from '../../../components/ResutlUI/UseResultEntryFormat';
import UseDisclaimer from '../../../components/ResutlUI/useDisclaimer';
import VersionFooter from '../../../components/accessories/VersionFooter';

export default function RESULT_FOR_PRINTING() {
  const [resultsettings, setResultSettings] = useState(defaultResultSettings);
  const [loader, setLoader] = useState(false);
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




  useEffect(() => {
    getResultSettings(setResultSettings, setLoader);
  }, [])




  return (
    <>
      <div className='single_result_page ui bg-secondary'>
      <div className='result bg-white'>
          <div className='result-top-section'>
          {resultsettings?.letterHeading == 1 && <CompanyHeaders billingid={billingid} />}
        <PersonalInformation patientid={patientid} billingid={billingid} />
          {resultsettings?.samplingInformation == 1 && <SamplingInformationResult billingid={billingid} testid={testid} />}
        <section>
          <UseCustomResultTemplating testid={testid} test={test} billingid={billingid} patientid={patientid} />
          <UseResultCommentSingle billingid={billingid} testid={testid} />
          <UseClinicalLiteratureReview testid={testid} />
          </section>
        </div>
          <div className='result-bottom-section'>
         <UseResultEntryScientist testid={testid} billingid={billingid} />
          <UseDisclaimer patientid={patientid} />
          <VersionFooter/>
        </div>
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
    </>
  )
}
