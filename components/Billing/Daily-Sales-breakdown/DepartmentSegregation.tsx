import { RiTestTubeLine } from '@remixicon/react';
import { currencyFormatter } from '../../Auth/customFetch';

const Card = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) => (
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

interface DepartmentSegregationDetail {
    test_name: string;
    total_cost: number;
    total_count: number;
    total_earned_revenue: number;
    total_cash_collected: number;
    total_discount: number;
    total_outstanding: number;
    total_refunded: number;
}

interface DepartmentSegregationItem {
    department: string;
    total_cost: number;
    total_count: number;
    total_earned_revenue: number;
    total_cash_collected: number;
    total_discount: number;
    total_outstanding: number;
    total_refunded: number;
    breakdown: DepartmentSegregationDetail[];
}

export default function DepartmentSegregation({ departmentSegregation }: { departmentSegregation: DepartmentSegregationItem[] }) {
    return (
        <Card title="Department Segregation" icon={<RiTestTubeLine />}>
            {departmentSegregation.length > 0 ? (
                <div>
                    {departmentSegregation.map((department) => (
                        <div key={department.department} className="mb-5">
                            <div className="border rounded p-3 mb-3" style={{ backgroundColor: 'var(--bs-body-tertiary)' }}>
                                <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 align-items-start align-items-sm-center">
                                    <div>
                                        <h5 className="fs-6 fw-semibold mb-1">{department.department}</h5>
                                        <p className="small text-secondary mb-1">{department.breakdown.length} service{department.breakdown.length === 1 ? '' : 's'} included</p>
                                        <p className="small text-secondary mb-0">Total Cases: <span className="fw-semibold text-body-emphasis">{department.total_count}</span></p>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '170px' }}>
                                            <div className="small text-secondary fw-semibold">Total Cost</div>
                                            <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(department.total_cost)}</div>
                                        </div>
                                        <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '170px' }}>
                                            <div className="small text-secondary fw-semibold">Total Paid</div>
                                            <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(department.total_cash_collected)}</div>
                                        </div>
                                        <div className="border rounded px-3 py-2 bg-white" style={{ minWidth: '170px' }}>
                                            <div className="small text-secondary fw-semibold">Total Refunds</div>
                                            <div className="fs-6 fw-bold text-body-emphasis">{currencyFormatter.format(department.total_refunded)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover table-striped table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-start">Service / Test</th>
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
                                        {department.breakdown.map((item) => (
                                            <tr key={`${department.department}-${item.test_name}`}>
                                                <td className="text-start fw-semibold">{item.test_name}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_cost)}</td>
                                                <td className="text-start  text-body-emphasis">{item.total_count}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_earned_revenue)}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_cash_collected)}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_discount)}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_outstanding)}</td>
                                                <td className="text-start  text-body-emphasis">{currencyFormatter.format(item.total_refunded)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-secondary d-flex flex-column align-items-center justify-content-center p-4 rounded" style={{ opacity: 0.8 }}>
                    <RiTestTubeLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p>No department data available for the selected period.</p>
                </div>
            )}
        </Card>
    );
}
