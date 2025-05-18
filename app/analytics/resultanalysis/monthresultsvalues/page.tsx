"use client"
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

interface TestResult {
    id: number;
    field: string;
    ascensionid: number;
    billingid: number;
    patientid: number;
    testid: number;
    value: string;
    originalvalue: string;
    created_on: string;
    updated_on: string;
    employeeid: number;
    entrymode: string | null;
    fieldid: number;
}

interface GroupedData {
    [key: string]: TestResult[];
}


const LazyMonthResultValuesComponent = React.lazy(() => import("../../../../lib/resultanalaysis/MonthResultValuesComp"));
const LazyTestValueChartModal = React.lazy(() => import("../../../../lib/resultanalaysis/TestValueChartModal"));

export default function ResultValuesAnalysisTest() {
    const [response, setResponse] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [groupedData, setGroupedData] = useState<GroupedData>({});
    const [groupingField, setGroupingField] = useState<string>("ascensionid");
    const [selectedField, setSelectedField] = useState<TestResult>({} as TestResult);
    const [showChartModal, setShowChartModal] = useState<boolean>(false);
    const employeeid = useApplication().user.employeeid

    const searchParams = useSearchParams();
    const testid = searchParams?.get('testid');
    const show = searchParams?.get('show');
    const duration = searchParams?.get('duration');
    const month = searchParams?.get('month');

    const currentMonth = parseInt(month || '') || new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthResultShow = duration && duration === "month" && show === "resultvalues";

    const groupData = (data: TestResult[], field: string) => {
        return data.reduce((acc: GroupedData, curr: TestResult) => {
            const key = field === 'created_on' 
                ? new Date(curr[field]).toLocaleDateString()
                : curr[field].toString();
            
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(curr);
            return acc;
        }, {});
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (monthResultShow) {
                    const data = await customFetch(
                        `result/analysis/test/resultvalues?employeeid=${employeeid}&&testid=${testid}&&month=${currentMonth}&&year=${currentYear}`
                    );
                    setResponse(data);
                    const grouped = groupData(data, groupingField);
                    setGroupedData(grouped);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [testid, show, duration, currentMonth, currentYear, monthResultShow]);

    const handleGroupingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newGroupingField = event.target.value;
        setGroupingField(newGroupingField);
        const grouped = groupData(response, newGroupingField);
        setGroupedData(grouped);

    };

    if (loading) return <div>Loading...</div>;
    if (response.length === 0) return <div className="alert alert-warning">No data available</div>;

    return (
        <Suspense fallback={<div>Loading Chart...</div>}>
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label className="form-label">Group Results By:</label>
                            <select 
                                className="custom-select"
                                value={groupingField}
                                onChange={handleGroupingChange}
                            >
                                <option value="ascensionid">Ascension ID</option>
                                <option value="created_on">Date</option>
                                <option value="field">Test Field</option>
                                <option value="billingid">Billing ID</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {Object.entries(groupedData).map(([groupKey, data]) => (
                        <div key={groupKey} className="mb-4">
                            <div >
                                <h5 className="mb-0 pls-label bg-secondary-subtle p-3 br-5">
                                    {groupingField === 'created_on' ? 'Date' : 
                                     groupingField === 'field' ? 'Test Field' :
                                     groupingField === 'billingid' ? 'Billing ID' : 
                                     'Ascension ID'}: {groupKey}
                                </h5>
                            </div>
                            <div>
                                <LazyMonthResultValuesComponent 
                                    data={data} 
                                    onFieldClick={(field) => {
                                        setSelectedField(field);
                                        setShowChartModal(true);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            
                
                <LazyTestValueChartModal
                    show={showChartModal}
                    onHide={() => setShowChartModal(false)}
                    constraints={{
                        testid: parseInt(testid || ''),
                        fieldid: selectedField.fieldid,
                        year: currentYear,
                        field: selectedField.field,
                        employeeid,
                        month: currentMonth
                    }}
                />
            </div>
        </Suspense>
    );
}
