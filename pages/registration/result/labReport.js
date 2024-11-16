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
import { PrintOutDummyData } from './_dummydata';
import UseCustomResultTemplatingPrintOut from './UseCustomResultTemplatingPrintOut';
import UseCustomResultCommentsTemplatingPrintOut from './useCustomResultCommentsTemplatingPrintOut';

export default function RESULT_FOR_PRINTING() {
	const [loader, setLoader] = useState(false);
	const serachParams = useSearchParams();
	const testid = serachParams.get('testid');
	const billingid = serachParams.get('billingid');
	const ascensionid = serachParams.get('ascensionid');
	const test = serachParams.get('test');
	const patientid = serachParams.get('patientid');








	useEffect(() => {
		const hasRequiredValues = ascensionid && testid && billingid && patientid;

		if (hasRequiredValues) 
		{
			const url_destination_endpoint = `printout/ascension/getResult?ascensionid=${ascensionid}&&testid=${testid}`
		}
	}, [patientid,testid,ascensionid,billingid])



	return (
		<>
			<ApplicationHeader />
			<div className='single_result_page'>
				<div className='_sresult bg-white p-3'>
					{PrintOutDummyData.resultsettings.letterHeading == 1 && <CompanyHeaders companyInfo={PrintOutDummyData.companyInfo} />}
					<PersonalInformation PersonalInformation={PrintOutDummyData.patientInformation} billingid={billingid} />
					<UseCustomResultTemplatingPrintOut result={PrintOutDummyData.records} testname={PrintOutDummyData.testname} />
					<UseCustomResultCommentsTemplatingPrintOut comments={PrintOutDummyData.comments} />
					<UseClinicalLiteratureReview literature={PrintOutDummyData.literatureReview} />
					<UseResultEntryScientist validators={PrintOutDummyData.validators} enteredOn={PrintOutDummyData.enteredOn} lastupdatedon={PrintOutDummyData.lastupdatedon} resultentry={PrintOutDummyData.resultentry} />
					<UseDisclaimer patientid={PrintOutDummyData.patientInformation.patientid} />
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
