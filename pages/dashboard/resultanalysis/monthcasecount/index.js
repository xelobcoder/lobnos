import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import CaseCountAreaChart from "../../../../lib/resultanalaysis/MonthCaseCountChart";
import ResultAnalysisDasboardLayout from "../../../../components/salesSummary/ResultAnalysisDasboard";

export default function ResultAnalysisTest() {
    const [response, setResponse] = useState([]);
    const [dayHeaders, setDayHeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const testid = searchParams.get('testid');
    const show = searchParams.get('show');
    const duration = searchParams.get('duration');
    const expandedTarget = searchParams.get('expandedTarget');
    const month = searchParams.get('month');

    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthCasesShow = duration && duration === "month" && show === "allcaseCount";
    const monthResultShow = duration && duration === "month" && show === "resultvalues";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let data = [];
                if (monthCasesShow) {
                    data = await customFetch(`result/analysis/test/month?employeeid=3&&testid=${testid}&&month=${currentMonth}`);
                    if (data && Array.isArray(data) && data.length > 0) {
                        setDayHeaders(data.map((item) => item.day));
                    }
                } else if (monthResultShow) {
                    data = await customFetch(`result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}`);
                }
                setResponse(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [testid, show, duration, currentMonth]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultAnalysisDasboardLayout>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {monthCasesShow && (
                            <div>
                                <h5 className="text-center">{currentMonth}/{currentYear}</h5>
                                <hr />
                                <table className="table ttable">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            {dayHeaders.map((item, index) => (
                                                <th key={index}>{item}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Case Count</td>
                                            {dayHeaders.map((item, index) => {
                                                const matched = response.find((it) => it.day === item);
                                                return matched ? <td key={index}>{matched.caseCount}</td> : <td key={index}>-</td>;
                                            })}
                                        </tr>
                                    </tbody>
                                </table>

                                <h5 className="text-center">Chart</h5>
                                <CaseCountAreaChart data={response} />
                            </div>
                        )}
                    </>
                )}
            </ResultAnalysisDasboardLayout>
        </Suspense>
    );
}
