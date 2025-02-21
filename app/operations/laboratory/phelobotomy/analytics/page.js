"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../../components/Auth/customFetch';
import CollectionToDisputeToApprovedToRedrawnLast30daysHandler from '../../../../../components/phelobotomy/Analytics/CollectionToDisputeToApprovedToRedrawnLast30daysHandler';
import PhelobotomistSummaryTable from '../../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/PhelobotomistSummayTable';
import TestsCompletedVsInitiatedVrsUninitiated from '../../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/TestsCompletedVsInitiatedVrsUninitiated';
import MonthlyApprovalRateByMonthAndYear from '../../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/monthlyApprovalRateByMonthAndYear';
import ImportantAnalyticsRecorded from '../../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/importantAnalyticsRecorded';
import TotalTestCollectedByYearTableView from '../../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/TotalTestCollectedByYearTableView';


const PhelobotomyAnalyticsPage = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await customFetch('ascension/analytics/summary');
				setData(response);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div className="text-center">Loading...</div>;
	}

	if (!data) {
		return <div className="text-center">No data available.</div>;
	}

	return (
		<div>
			<TestsCompletedVsInitiatedVrsUninitiated value={data.testsCompletedVsInitiatedVrsUninitiated} />
			<section className=''>
				<CollectionToDisputeToApprovedToRedrawnLast30daysHandler />
			</section>
			<MonthlyApprovalRateByMonthAndYear data={data.monthlyApprovalRate} />
			{/* <section className='mx-4 d-flex col-12 my-5 bg-white heightedBorder p-2'>
					<div className='d-flex col-5 justify-content-between p-2'>
					<input type='date' className="custom-input" />
					<input type='date' className="custom-input mx-2" />
					</div>
					<div>
					<input type='number' className='custom-input my-2' placeholder='year' />
					</div>
          </section> */}
			<div>
				<PhelobotomistSummaryTable />
		
				<div className='d-flex-lg'>
					<div className='col-md-12 col-lg-12 my-2'>
						<ImportantAnalyticsRecorded data={data.timeBetweenCollectionStartAndEnd[0]} />
					</div>
					<div className='col-md-12 col-lg-12 my-2'>
						<TotalTestCollectedByYearTableView />
					</div>
				</div>
			</div>
		</div>
	);
};

export default PhelobotomyAnalyticsPage;
