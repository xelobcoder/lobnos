import { RiFileList3Line } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface ExpensePaymentsFullListItem {
     payment_id: number;
     expense_name: string;
     merchant_name: string;
     claimed_amount: number;
     paid_amount: string;
     payment_date: string;
     method: string;
     status: string;
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

export default function ExpensePaymentsFullList({ expensePaymentsFullList }: { expensePaymentsFullList: ExpensePaymentsFullListItem[] }) {
     if (!Array.isArray(expensePaymentsFullList) || expensePaymentsFullList.length === 0) {
          return null
     }

     return (
          <Card title="Expense Payments Full List" icon={<RiFileList3Line />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Payment Date</th>
                                   <th className="text-start">Expense Name</th>
                                   <th className="text-start">Merchant</th>
                                   <th className="text-start">Claimed Amount</th>
                                   <th className="text-start">Paid Amount</th>
                                   <th className="text-start">Method</th>
                                   <th className="text-start">Status</th>
                              </tr>
                         </thead>
                         <tbody>
                              {expensePaymentsFullList.map((payment) => (
                                   <tr key={payment.payment_id}>
                                        <td className="text-start">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                        <td className="text-start">{payment.expense_name}</td>
                                        <td className="text-start">{payment.merchant_name}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(payment.claimed_amount))}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(payment.paid_amount))}</td>
                                        <td className="text-start">{payment.method}</td>
                                        <td className="text-start">{payment.status}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
