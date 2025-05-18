"use client"
import { RiArrowUpSLine, RiArrowDownSLine, RiInformationLine } from "@remixicon/react";
import Link from "next/link";
import { useState } from 'react';
import { Modal } from 'react-bootstrap';

const ChangeIcon = (data) => {
    const { state, casesCount } = data;
    if (state === 'positive' && casesCount > 0) return <RiArrowUpSLine color="#43a047" />;
    if (state === "negative" && casesCount > 0) return <RiArrowDownSLine color="#e53935" />;
    return null;
};

export default function ResultAnalysisRow({ item, months, index }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const monthOptions = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
            {Array.isArray(months) && months.length > 0 && months.map((month, monthIndex) => {
                const data = item.data[monthIndex];
                return (
                    <td key={month} style={{ textAlign: "center", padding: "0.5rem 0.25rem" }}>
                        <Link href={`/analytics/resultanalysis/monthcasecount?testid=${item.testid}&&show=allcaseCount&&month=${monthIndex + 1}&&duration=month&&expandTarget=${item.testid}`}>
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
            <td>
                <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowModal(true)}
                >
                    Result  
                </button>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Month and Year</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <label className="form-label">Month</label>
                            <select 
                                className="form-select" 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            >
                                {monthOptions.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Year</label>
                            <select 
                                className="form-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                const url = `/analytics/resultanalysis/monthresultsvalues?testid=${item.testid}&show=resultvalues&duration=month&month=${selectedMonth}&year=${selectedYear}`;
                                window.location.href = url;
                            }}
                        >
                            View Results
                        </button>
                    </Modal.Footer>
                </Modal>
            </td>
        </tr>
    );
}

