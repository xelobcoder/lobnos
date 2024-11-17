import CompanyHeaders from '../../../components/ResultView/CompanyHeaders';
import { readyToPrint } from '../../../components/Auth/customFetch';
import PersonalInformation from '../../../components/ResultView/PersonalInformation';
import { useSearchParams } from 'next/navigation';
import UseResultEntryScientist from '../../../components/ResutlUI/UseResultEntryFormat';
import UseDisclaimer from '../../../components/ResutlUI/useDisclaimer';
import UseScanResultTemplate from '../../../components/ResutlUI/useScanTemplate';
import VersionFooter from '../../../components/accessories/VersionFooter';

export default function UltrasoundScanReportView() {
        const testid = useSearchParams().get('testid');
        const billingid = useSearchParams().get('billingid');
        const test = useSearchParams().get('test');
        const patientid = useSearchParams().get('patientid');



        return (
                <div className='result_page'>
                        <div className='result'>
                                {/* <div>
                                        <CompanyHeaders billingid={billingid} />
                                        <PersonalInformation patientid={patientid} billingid={billingid} />
                                        <section>
                                                <UseScanResultTemplate testid={testid} test={test} billingid={billingid} patientid={patientid} />
                                        </section>
                                </div>
                                <div>
                                        <UseResultEntryScientist testid={testid} billingid={billingid} />
                                        <UseDisclaimer patientid={patientid} />
                                        <VersionFooter/>
                                </div> */}
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