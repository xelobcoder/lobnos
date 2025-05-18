"use client"
import { customFetch } from "../../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../../lib/resultanalaysis/RowAnalysis";
import { useEffect, useState } from "react";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { RiFlaskLine, RiCalendar2Line } from "@remixicon/react";


type MonthData = {
    state: "positive" | "negative" | string;
    casesCount: number;
    change: number | string;
};

type ResultItem = {
    testid: string | number;
    testname: string;
    data: MonthData[];
};

export default function ResultAnalysisAllTestView() {
    const [resultData, setResultData] = useState<ResultItem[]>([]);
    const { employeeid } = useApplicationSettings().applicationsettings.user;

    const getData = async function () {
        const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}`);
        setResultData(response);
    };

    const months: string[] = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];

    useEffect(() => {
        if (employeeid) getData()
    }, [employeeid]);

    return (
        <div className="table-container" style={{
            maxHeight: '100vh',
            overflowY: 'auto',
            background: "#f8fafc",
            padding: 16
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18
            }}>
                <span>
                    <RiFlaskLine size={28} style={{ color: "#1976d2", verticalAlign: "middle" }} />
                </span>
                <h2 style={{
                    fontWeight: 700,
                    color: "#1976d2",
                    letterSpacing: 0.5,
                    fontSize: "1.5rem",
                    margin: 0,
                    display: "flex",
                    alignItems: "center"
                }}>
                    Yearly Test Result Analysis
                </h2>
                <span>
                    <RiCalendar2Line size={26} style={{ color: "#90caf9", verticalAlign: "middle", marginLeft: 8 }} />
                </span>
            </div>
            <table className="table ttable billing-cart-table" style={{
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                fontSize: "1rem"
            }}>
                <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                        <th style={{ minWidth: 80 }}>Test ID</th>
                        <th style={{ minWidth: 160, display: "flex", alignItems: "center", gap: 6 }}>
                            <RiFlaskLine size={18} style={{ verticalAlign: "middle", color: "#1976d2" }} /> Test
                        </th>
                        {months.map(month => (
                            <th key={month} className="month-header" style={{ minWidth: 70, textAlign: "center" }}>
                                <RiCalendar2Line size={16} style={{ verticalAlign: "middle", color: "#90caf9" }} />
                                <span style={{ marginLeft: 4 }}>{month.slice(0, 3)}</span>
                            </th>
                        ))}
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(resultData) && resultData.length > 0 && resultData.map((item, index) => (
                        <ResultAnalysisRow key={index} index={index} months={months} item={item} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
