import { RiFlaskLine, RiCalendar2Line } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../../lib/resultanalaysis/RowAnalysis";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { UserPayload, verifyPrimeToken } from "../../../../middleware";

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

export default async function ResultAnalysisAllTestView() {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('PLS-SESSION')?.value;
 
    let employeeid;
    if (sessionToken) {
        try {
            const {payload,isValid} = await verifyPrimeToken(sessionToken) as unknown as {payload:UserPayload , isValid:boolean}
            if(isValid && payload){
                employeeid = payload?.user?.employeeid;
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            throw new Error('Unauthorized');
        }
    }

    if (!employeeid) {
        throw new Error('Unauthorized: Employee ID not found');
    }

    const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid}`);
    const resultData: ResultItem[] = Array.isArray(response) && response.length > 0 ? response : [];

    const months: string[] = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];

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
