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
import ApplicationHeader from '../../../components/Layout/HeaderNav';
import { Print } from '@mui/icons-material';

export default function RESULT_FOR_PRINTING() {
	const [resultsettings, setResultSettings] = useState(defaultResultSettings);
	const [loader, setLoader] = useState(false);
	const testid = useSearchParams().get('testid');
	const billingid = useSearchParams().get('billingid');
	const ascensionid = useSearchParams().get('ascensionid');
	const test = useSearchParams().get('test');
	const patientid = useSearchParams().get('patientid');









	useEffect(() => {
		getResultSettings(setResultSettings, setLoader);
	}, [])




	return (
		<>
			<ApplicationHeader />
			<div className='single_result_page'>
				<div className='_sresult bg-white p-3'>
					{resultsettings?.letterHeading == 1 && <CompanyHeaders billingid={billingid} />}
					<PersonalInformation patientid={patientid} billingid={billingid} />
					<UseCustomResultTemplating testid={testid} test={test} billingid={billingid} patientid={patientid} />
					<UseResultCommentSingle billingid={billingid} testid={testid} />
					<UseClinicalLiteratureReview testid={testid} />
					<UseResultEntryScientist ascensionId={ascensionid} testid={testid} billingid={billingid} />
					<UseDisclaimer patientid={patientid} />
					<VersionFooter />
				</div>
			</div>
			<div className='print-section my-2' >
				<button style={{ position: 'absolute', top: '10vh', left: '90vw' }} className='btn  btn-secondary p-2'
					onClick={() => { window.print() }}>
					<Print />  print result
				</button>
			</div>
		</>
	)
}
