import { RiBuildingLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface ExpensesByBranch {
     branchid: number;
     branch_name: string;
     total_amount: string;
     expense_count: number;
     percentage_of_total: string;
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

export default function ExpensesByBranch({ expensesByBranch }: { expensesByBranch: ExpensesByBranch[] }) {
     if (!Array.isArray(expensesByBranch) || expensesByBranch.length === 0) {
          return null
     }

     return (
          <Card title="Expenses by Branch" icon={<RiBuildingLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Branch ID</th>
                                   <th className="text-start">Branch Name</th>
                                   <th className="text-start">Total Expenses</th>
                                   <th className="text-start">Expense Count</th>
                                   <th className="text-start">Percentage of Total</th>
                              </tr>
                         </thead>
                         <tbody>
                              {expensesByBranch.map((expense) => (
                                   <tr key={expense.branchid}>
                                        <td className="text-start">{expense.branchid}</td>
                                        <td className="text-start">{expense.branch_name}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(expense.total_amount))}</td>
                                        <td className="text-start">{expense.expense_count}</td>
                                        <td className="text-start">{expense.percentage_of_total}%</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
