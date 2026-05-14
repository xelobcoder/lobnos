import { RiBarChartGroupedLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface TotalExpensesPeriodComparison {
     period: string;
     total_expenses: string | null;
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

export default function ExpensePeriodComparison({ totalExpensesPeriodComparison }: { totalExpensesPeriodComparison: TotalExpensesPeriodComparison[] }) {
     if (!Array.isArray(totalExpensesPeriodComparison) || totalExpensesPeriodComparison.length === 0) {
          return null
     }

     return (
          <Card title="Expense Period Comparison" icon={<RiBarChartGroupedLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Period</th>
                                   <th className="text-start">Total Expenses</th>
                                   <th className="text-start">Expense Count</th>
                              </tr>
                         </thead>
                         <tbody>
                              {totalExpensesPeriodComparison.map((comparison, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{comparison.period}</td>
                                        <td className="text-start">{comparison.total_expenses ? currencyFormatter.format(Number(comparison.total_expenses)) : 'N/A'}</td>
                                        <td className="text-start">{comparison.expense_count}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
