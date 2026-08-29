"use client"
import { RiArrowUpSLine, RiArrowDownSLine, RiInformationLine, RiFlaskLine } from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { ButtonGroup, Modal } from 'react-bootstrap';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

const ChangeIcon = (data) => {
    const { state, casesCount } = data;
    if (state === 'positive' && casesCount > 0) return <RiArrowUpSLine color="#43a047" />;
    if (state === "negative" && casesCount > 0) return <RiArrowDownSLine color="#e53935" />;
    return null;
};

export default function ResultAnalysisRow({ item, months, index, year }) {
    const currentSelectedYear = year || new Date().getFullYear();
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentSelectedYear);
    const router = useRouter();

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
        <tr className="align-middle">
            <td className="fw-semibold" style={{ color: COLOR_ACCENT }}>
                <div className="d-flex align-items-center">
                    <RiFlaskLine size={16} style={{ color: COLOR_ACCENT, marginRight: '6px' }} />
                    <div>
                        <div style={{ fontSize: '0.875rem' }}>{item.testname}</div>
                        <div className="small text-muted">({item.testid})</div>
                    </div>
                </div>
            </td>
            {Array.isArray(months) && months.length > 0 && months.map((month, monthIndex) => {
                const data = item.data[monthIndex];
                return (
                    <td key={month} className="text-center p-2">
                        <Link
                            href={`/analytics/resultanalysis/monthcasecount?testid=${item.testid}&&show=allcaseCount&&month=${monthIndex + 1}&&duration=month&&expandTarget=${item.testid}&year=${currentSelectedYear}`}
                            className="text-decoration-none"
                        >
                            <div
                                className="d-flex flex-column align-items-center justify-content-center p-2 rounded"
                                style={{
                                    minHeight: '40px',
                                    backgroundColor: data?.state === "positive" ? 'rgba(67, 160, 71, 0.1)' :
                                        data?.state === "negative" ? 'rgba(229, 57, 53, 0.1)' : 'transparent',
                                    border: data?.casesCount > 0 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <span className="fw-semibold" style={{
                                    color: data?.state === "positive" ? "#43a047" :
                                        data?.state === "negative" ? "#e53935" : COLOR_TEXT_MUTED,
                                    fontSize: '0.9rem'
                                }}>
                                    {data ? data.casesCount : 0}
                                </span>
                                {data && data.casesCount !== 0 && (
                                    <div className="d-flex align-items-center mt-1" style={{ fontSize: '0.75rem' }}>
                                        {ChangeIcon(data)}
                                        <span className="ms-1" style={{
                                            color: data?.state === "positive" ? "#43a047" :
                                                data?.state === "negative" ? "#e53935" : COLOR_TEXT_MUTED
                                        }}>
                                            {data.change}
                                        </span>
                                        <RiInformationLine
                                            size={12}
                                            style={{
                                                color: COLOR_TEXT_MUTED,
                                                marginLeft: '2px',
                                                cursor: 'help'
                                            }}
                                            title="Change from previous month"
                                        />
                                    </div>
                                )}
                            </div>
                        </Link>
                    </td>
                );
            })}
            <td className="text-center">
                <div className="btn-group btn-group-sm">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setShowModal(true)}
                        title="Monthly Results"
                    >
                        M
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={(ev) => { router.push(`/analytics/resultanalysis/yearmonthcasescount/${item.testid}`) }}
                        title="Yearly Cases Count"
                    >
                        Y
                    </button>
                    <button
                        className="btn btn-outline-info"
                        onClick={(ev) => { router.push(`/analytics/resultanalysis/fieldvalues/selector?testid=${item.testid}&&testname=${encodeURIComponent(item.testname)}`) }}
                        title="Field Value Analytics"
                    >
                        F
                    </button>
                </div>

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

