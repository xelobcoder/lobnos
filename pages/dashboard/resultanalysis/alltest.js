import { customFetch } from "../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../lib/resultanalaysis/RowAnalysis";
import { useEffect, useState } from "react";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import ResultAnalysisDasboardLayout from "../../../components/salesSummary/ResultAnalysisDasboard";


export default function ResultAnalysisAllTestView() {
    const [resultData, setResultData] = useState([]);
    const{ employeeid} = useApplicationSettings().applicationsettings.user;

    const getData = async function () {
        const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}`);
        setResultData(response);
    }


    const months = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];


    useEffect(() => {
        if (employeeid) getData()
    }, [employeeid])


    return (
        <ResultAnalysisDasboardLayout>
            <div className="table-container" style={{maxHeight:'100vh',msOverflowY:'auto'}}>
                <table className="table ttable billing-cart-table">
                    <thead>
                        <tr>
                            <th>Test ID</th>
                            <th>test</th>
                            {months.map(month => (
                                <th key={month} className="month-header">{month.split("").slice(0, 3).join("")}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(resultData) && resultData.length > 0 && resultData.map((item, index) => (
                            <ResultAnalysisRow key={index} index={index} months={months} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </ResultAnalysisDasboardLayout>
    );
}
