import { RiTestTubeLine } from '@remixicon/react';
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch';


    const Card = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
        <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
            <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
                <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    {icon}
                    {title}
                </h2>
            </div>
            <div className="p-3">
                {children}
            </div>
        </div>
    );

export default function DailyTestsTransactions({ aggregatedTestData ,ultrasoundTests,labTests}: { aggregatedTestData: any[], ultrasoundTests: any[], labTests: any[] }) {
    const summarizeTests = (tests: any[]) => tests.reduce((summary, test) => {
        summary.total_cost += Number(test.total_cost) || 0;
        summary.total_count += Number(test.test_count) || 0;
        summary.total_payable += Number(test.accrued_revenue) || 0;
        summary.total_paid += Number(test.actual_revenue) || 0;
        summary.total_discount += Number(test.total_discount) || 0;
        summary.total_outstanding += Number(test.total_outstanding) || 0;
        summary.total_refunds += Number(test.total_refunds) || 0;
        return summary;
    }, {
        total_cost: 0,
        total_count: 0,
        total_payable: 0,
        total_paid: 0,
        total_discount: 0,
        total_outstanding: 0,
        total_refunds: 0,
    });

    const renderCategorySummary = (label: string, summary: any) => (
        <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Cost</div>
                <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(summary.total_cost)}</div>
            </div>
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Payable</div>
                <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(summary.total_payable)}</div>
            </div>
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Paid</div>
                <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(summary.total_paid)}</div>
            </div>
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Discount</div>
                <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(summary.total_discount)}</div>
            </div>
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Refunds</div>
                <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(summary.total_refunds)}</div>
            </div>
            <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '160px' }}>
                <div className="small text-secondary fw-semibold"> Total Cases</div>
                <div className="fs-6 fw-bold text-body-emphasis">{summary.total_count}</div>
            </div>
        </div>
    );

    return (
        <Card title="Daily Test Transaction Details" icon={<RiTestTubeLine />}>
            {Array.isArray(aggregatedTestData) && aggregatedTestData.length > 0 ? (
                <div>
                    {/* Ultrasound Section */}
                    {ultrasoundTests.length > 0 && (
                        <div className="mb-5">
                            <h5 className="fw-semibold mb-3 pb-2 border-bottom" style={{ color: 'var(--pls-accent)' }}>
                                <RiTestTubeLine size={18} className="me-2" />
                                Ultrasound Services
                            </h5>
                            {renderCategorySummary('Ultrasound', summarizeTests(ultrasoundTests))}
                            <div className="table-responsive">
                                <table className="table table-hover table-striped table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-start">Test Name</th>
                                            <th className="text-start">Total Cost</th>
                                            <th className="text-start">Total Count</th>
                                            <th className="text-start">Total Payable</th>
                                            <th className="text-start">Total Paid</th>
                                            <th className="text-start">Total Discount</th>
                                            <th className="text-start">Total Outstanding</th>
                                            <th className="text-start">Total Refunds</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ultrasoundTests.map((test: any, index: number) => (
                                            <tr key={`ultrasound-${test.test_panel_name}-${index}`}>
                                                <td className="text-start">{test.test_panel_name}</td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.total_cost))}
                                                </td>
                                                <td className="text-start">{test.test_count}</td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.accrued_revenue))}
                                                </td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.actual_revenue))}
                                                </td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.total_discount))}
                                                </td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.total_outstanding))}
                                                </td>
                                                <td className="text-start">
                                                    {currencyFormatter.format(Number(test.total_refunds))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Laboratory Section */}
                    {Object.keys(labTests).length > 0 && (
                        <div>
                            <h5 className="fw-semibold mb-3 pb-2 border-bottom" style={{ color: 'var(--pls-accent)' }}>
                                <RiTestTubeLine size={18} className="me-2" />
                                Laboratory Tests
                            </h5>
                            {Object.entries(labTests).map(([department, tests]) => {
                                const summary = summarizeTests(tests as any[]);
                                return (
                                    <div key={department} className="mb-4">
                                        <h6 className="fw-bold mb-2 ps-3" style={{ color: 'var(--bs-secondary-color)' }}>
                                          {department}
                                        </h6>
                                        {renderCategorySummary(department, summary)}
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped table-sm">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="text-start">Test Name</th>
                                                        <th className="text-start">Total Cost</th>
                                                        <th className="text-start">Total Count</th>
                                                        <th className="text-start">Total Payable</th>
                                                        <th className="text-start">Total Paid</th>
                                                        <th className="text-start">Total Discount</th>
                                                        <th className="text-start">Total Outstanding</th>
                                                        <th className="text-start">Total Refunds</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(tests as any[]).map((test: any, index: number) => (
                                                        <tr key={`lab-${test.test_panel_name}-${index}`}>
                                                            <td className="text-start">{test.test_panel_name}</td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.total_cost))}
                                                            </td>
                                                            <td className="text-start">{test.test_count}</td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.accrued_revenue))}
                                                            </td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.actual_revenue))}
                                                            </td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.total_discount))}
                                                            </td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.total_outstanding))}
                                                            </td>
                                                            <td className="text-start">
                                                                {currencyFormatter.format(Number(test.total_refunds))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className='bg-secondary d-flex flex-column align-items-center justify-content-center p-4 rounded' style={{ opacity: 0.8 }}>
                    <RiTestTubeLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p>No test transaction data available for the selected period.</p>
                </div>
            )}
        </Card>
    )
}
