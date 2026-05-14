import { RiFileList3Line } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface ExpenseApprovalStatusSummary {
     status: string;
     expense_count: number;
     total_amount: string;
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

export default function ExpenseApprovalStatusSummary({ expenseApprovalStatusSummary }: { expenseApprovalStatusSummary: ExpenseApprovalStatusSummary[] }) {
     if (!Array.isArray(expenseApprovalStatusSummary) || expenseApprovalStatusSummary.length === 0) {
          return null
     }

     return (
          <Card title="Expense Approval Status Summary" icon={<RiFileList3Line />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Status</th>
                                   <th className="text-start">Count</th>
                                   <th className="text-start">Total Amount</th>
                              </tr>
                         </thead>
                         <tbody>
                              {expenseApprovalStatusSummary.map((summary, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{summary.status}</td>
                                        <td className="text-start">{summary.expense_count}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(summary.total_amount))}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
