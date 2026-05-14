import { RiHandCoinLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface ExpensePaymentsSummary {
     status: string;
     method: string;
     payments_made: number;
     unique_expenses_reimbursed: number;
     total_reimbursed_amount: string;
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

export default function ExpensePaymentsSummary({ expensePaymentsSummary }: { expensePaymentsSummary: ExpensePaymentsSummary[] }) {
     if (!Array.isArray(expensePaymentsSummary) || expensePaymentsSummary.length === 0) {
          return null
     }

     return (
          <Card title="Expense Payments Summary" icon={<RiHandCoinLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Status</th>
                                   <th className="text-start">Method</th>
                                   <th className="text-start">Payments Made</th>
                                   <th className="text-start">Unique Expenses Reimbursed</th>
                                   <th className="text-start">Total Reimbursed Amount</th>
                              </tr>
                         </thead>
                         <tbody>
                              {expensePaymentsSummary.map((summary, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{summary.status}</td>
                                        <td className="text-start">{summary.method}</td>
                                        <td className="text-start">{summary.payments_made}</td>
                                        <td className="text-start">{summary.unique_expenses_reimbursed}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(summary.total_reimbursed_amount))}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
