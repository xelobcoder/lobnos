import { RiLineChartLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface MonthlyExpenseTrend {
     month: string;
     total_expenses: string;
     expense_count: number;
}

const Card = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) => (
     <div className="border rounded mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
          <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: 'var(--bs-border-color)' }}>
               <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
                    {icon}
                    {title}
               </h2>
          </div>
          <div className="p-3">{children}</div>
     </div>
)

export default function MonthlyExpenseTrend({ monthlyExpenseTrend }: { monthlyExpenseTrend: MonthlyExpenseTrend[] }) {
     if (!Array.isArray(monthlyExpenseTrend) || monthlyExpenseTrend.length === 0) {
          return null
     }

     return (
          <Card title="Monthly Expense Trend" icon={<RiLineChartLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Month</th>
                                   <th className="text-start">Total Expenses</th>
                                   <th className="text-start">Expense Count</th>
                              </tr>
                         </thead>
                         <tbody>
                              {monthlyExpenseTrend.map((trend, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{trend.month}</td>
                                        <td className="text-start">{trend.total_expenses ? currencyFormatter.format(Number(trend.total_expenses)) : 'N/A'}</td>
                                        <td className="text-start">{trend.expense_count}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
