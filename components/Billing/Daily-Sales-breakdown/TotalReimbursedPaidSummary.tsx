import { RiHandCoinLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface TotalReimbursedPaid {
     total_reimbursed: string;
     expenses_paid_count: number;
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

export default function TotalReimbursedPaidSummary({ totalReimbursedPaid }: { totalReimbursedPaid: TotalReimbursedPaid[] }) {
     if (!Array.isArray(totalReimbursedPaid) || totalReimbursedPaid.length === 0) {
          return null
     }

     return (
          <Card title="Total Reimbursed & Paid Summary" icon={<RiHandCoinLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Total Reimbursed</th>
                                   <th className="text-start">Expenses Paid Count</th>
                              </tr>
                         </thead>
                         <tbody>
                              {totalReimbursedPaid.map((summary, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{currencyFormatter.format(Number(summary.total_reimbursed))}</td>
                                        <td className="text-start">{summary.expenses_paid_count}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
