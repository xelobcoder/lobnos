import { RiArrowUpSLine, RiArrowDownSLine, RiInformationLine } from "@remixicon/react";
import Link from "next/link";

const ChangeIcon = (data) => {
    const { state, casesCount } = data;
    if (state === 'positive' && casesCount > 0) return <RiArrowUpSLine color="#43a047" />;
    if (state === "negative" && casesCount > 0) return <RiArrowDownSLine color="#e53935" />;
    return null;
};

export default function ResultAnalysisRow({ item, months, index }) {
    return (
        <tr
            key={index}
            style={{
                background: index % 2 === 0 ? "#fff" : "#f6f8fa",
                borderBottom: "1px solid #e0e7ef"
            }}
        >
            <td style={{ fontWeight: 500, color: "#374151" }}>{item.testid}</td>
            <td style={{ fontWeight: 600, color: "#1976d2", display: "flex", alignItems: "center", gap: 6 }}>
                {item.testname}
            </td>
            {months.map((month, monthIndex) => {
                const data = item.data[monthIndex];
                return (
                    <td key={month} style={{ textAlign: "center", padding: "0.5rem 0.25rem" }}>
                        <Link href={`/dashboard/resultanalysis/monthcasecount?testid=${item.testid}&&show=allcaseCount&&month=${monthIndex + 1}&&duration=month&&expandTarget=${item.testid}`}>
                            <div
                                className="data-item d-flex justify-content-between text-sm"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                    fontWeight: 500,
                                    color: data?.state === "positive" ? "#43a047" : data?.state === "negative" ? "#e53935" : "#888"
                                }}
                            >
                                <span>{data ? data.casesCount : 0}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    {ChangeIcon(data)}
                                    {data && data.casesCount !== 0 ? (
                                        <>
                                            <span style={{ marginLeft: 2 }}>{data.change}</span>
                                            <RiInformationLine size={15} color="#90caf9" title="Change from previous" style={{ marginLeft: 2, verticalAlign: "middle" }} />
                                        </>
                                    ) : null}
                                </span>
                            </div>
                        </Link>
                    </td>
                );
            })}
        </tr>
    );
}