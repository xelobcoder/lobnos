import { useState, useEffect } from 'react';
import CompanyHeaders from '../../../components/ResultView/CompanyHeaders';
import PersonalInformation from '../../../components/ResultView/PersonalInformation';
import { useSearchParams } from 'next/navigation';
import UseClinicalLiteratureReview from '../../../components/ResutlUI/UseClinicalLiteratureReview';
import UseResultEntryScientist from '../../../components/ResutlUI/UseResultEntryFormat';
import UseDisclaimer from '../../../components/ResutlUI/useDisclaimer';
import VersionFooter from '../../../components/accessories/VersionFooter';
import ApplicationHeader from '../../../components/Layout/HeaderNav';
import UseCustomResultTemplatingPrintOut from '../../../components/ResutlUI/ResultPrintOut/UseCustomResultTemplatingPrintOut';
import UseCustomResultCommentsTemplatingPrintOut from '../../../components/ResutlUI/ResultPrintOut/useCustomResultCommentsTemplatingPrintOut';
import { customFetch } from '../../../components/Auth/customFetch';

export default function RESULT_FOR_PRINTING() {
	const [loader, setLoader] = useState(true);
	const [resultData, setResultData] = useState(null);
	const searchParams = useSearchParams();
	const testid = searchParams.get('testid');
	const billingid = searchParams.get('csvid');
	const ascensionid = searchParams.get('ascensionId');
	const test = searchParams.get('testname');
	const patientid = searchParams.get('ptid');

	useEffect(() => {
		const fetchResultData = async () => {
			if (ascensionid && testid && billingid && patientid) {
				const url_destination_endpoint = `result/printout/ascension/getResult?csvid=${billingid}&&ptid=${patientid}&&target=70,50&&ascensionId=${ascensionid}&&testname=${test}&&testid=${testid}`;
				try {
					const response = await customFetch(url_destination_endpoint);
					if (response) {
						setResultData(response);
					}
				} catch (error) {
					console.error('Error fetching result data:', error);
				} finally {
					setLoader(false);
				}
			}
		};

		fetchResultData();
	}, [ascensionid, testid, billingid, patientid, test]);

	if (loader) {
		return <div>Loading...</div>;
	}

	const data = resultData || {};

	return (
		<>
			<ApplicationHeader />
			<div className='single_result_page'>
				<div className='_sresult bg-white p-3'>
					{data?.resultsettings?.letterHeading == 1 && <CompanyHeaders companyInfo={data.companyInfo} />}
					<PersonalInformation PersonalInformation={data.patientInformation} billingid={billingid} />
					<UseCustomResultTemplatingPrintOut result={data.records} testname={data.testname} />
					<UseCustomResultCommentsTemplatingPrintOut comments={data.comments} />
					<UseClinicalLiteratureReview literature={data.literatureReview} />
					<UseResultEntryScientist
						validators={data.validators}
						enteredOn={data.enteredOn}
						lastupdatedon={data.lastupdatedon}
						resultentry={data.resultentry}
					/>
					<UseDisclaimer patientid={data.patientInformation?.patientid} />
					<VersionFooter />
				</div>
			</div>
			<div className='print-section my-2'>
				<button
					style={{ position: 'absolute', top: '10vh', left: '90vw' }}
					className='btn btn-secondary p-2'
					onClick={() => { window.print() }}>
				</button>
			</div>
		</>
	);
}
