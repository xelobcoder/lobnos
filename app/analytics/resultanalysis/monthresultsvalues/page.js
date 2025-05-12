"use client"
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import ResultAnalysisDasboardLayout from "../../../../components/salesSummary/ResultAnalysisDasboard";

const LazyMonthResultValuesComponent = React.lazy(() => import("../../../../lib/resultanalaysis/MonthResultValuesComp"));

export default function ResultValuesAnalysisTest() {
    const [response, setResponse] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const testid = searchParams.get('testid');
    const show = searchParams.get('show');
    const duration = searchParams.get('duration');
    const month = searchParams.get('month');
    const isGroupedByDate = searchParams.get('isGroupedByDate') || 1;

    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthResultShow = duration && duration === "month" && show === "resultvalues";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (monthResultShow) {
                    const data = await customFetch(
                        `result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}&&year=${currentYear}`
                    );
                    setResponse(data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [testid, show, duration, currentMonth, currentYear, monthResultShow]);

    if (loading) return <div>Loading...</div>;
    if (response.length === 0) return <div className="alert alert-warning">No data available</div>;

    if (isGroupedByDate === 1) {
        const uniqueDates = new Set(response.map((item) => new Date(item.created_on).toLocaleDateString()));
    }

    return (
        <ResultAnalysisDasboardLayout>
            <Suspense fallback={<div>Loading Chart...</div>}>
                <LazyMonthResultValuesComponent data={response} />
            </Suspense>
        </ResultAnalysisDasboardLayout>
    );
}
