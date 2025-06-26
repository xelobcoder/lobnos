"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import CollectionToDisputeToApprovedToRedrawnLast30daysHandler from '../../../../components/phelobotomy/Analytics/CollectionToDisputeToApprovedToRedrawnLast30daysHandler';
import PhelobotomistSummaryTable from '../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/PhelobotomistSummayTable';
import TestsCompletedVsInitiatedVrsUninitiated from '../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/TestsCompletedVsInitiatedVrsUninitiated';
import MonthlyApprovalRateByMonthAndYear from '../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/monthlyApprovalRateByMonthAndYear';
import ImportantAnalyticsRecorded from '../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/importantAnalyticsRecorded';
import TotalTestCollectedByYearTableView from '../../../../components/phelobotomy/Analytics/TemplatesComponentAnalytics/TotalTestCollectedByYearTableView';

interface AnalyticsData {
    testsCompletedVsInitiatedVrsUninitiated: {
        completed: number;
        initiated: number;
        uninitiated: number;
    };
    monthlyApprovalRate: {
        month: string;
        rate: number;
    }[];
    timeBetweenCollectionStartAndEnd: Array<{
        averageTime: number;
        totalCollections: number;
        date: string;
    }>;
}

const PhelobotomyAnalyticsPage: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
            <TestsCompletedVsInitiatedVrsUninitiated value={data.testsCompletedVsInitiatedVrsUninitiated as any} />
            <section>
                <CollectionToDisputeToApprovedToRedrawnLast30daysHandler />
            </section>
            <MonthlyApprovalRateByMonthAndYear />
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
