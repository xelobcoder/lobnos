import { RiCashLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface AllIndividualExpense {
     expense_id: number;
     name: string;
     merchant_name: string;
     amount: number;
     expense_date: string;
     category: string;
     approval_status: string;
     submitted_by: string;
     branch_name: string;
     description: string;
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

export default function AllIndividualExpenses({ allIndividualExpenses }: { allIndividualExpenses: AllIndividualExpense[] }) {
     if (!Array.isArray(allIndividualExpenses) || allIndividualExpenses.length === 0) {
          return null
     }

     return (
          <Card title="All Individual Expenses" icon={<RiCashLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Expense ID</th>
                                   <th className="text-start">Name</th>
                                   <th className="text-start">Merchant Name</th>
                                   <th className="text-start">Amount</th>
                                   <th className="text-start">Expense Date</th>
                                   <th className="text-start">Category</th>
                                   <th className="text-start">Approval Status</th>
                                   <th className="text-start">Submitted By</th>
                                   <th className="text-start">Branch</th>
                                   <th className="text-start">Description</th>
                              </tr>
                         </thead>
                         <tbody>
                              {allIndividualExpenses.map((expense) => (
                                   <tr key={expense.expense_id}>
                                        <td className="text-start">{expense.expense_id}</td>
                                        <td className="text-start">{expense.name}</td>
                                        <td className="text-start">{expense.merchant_name}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(expense.amount))}</td>
                                        <td className="text-start">{new Date(expense.expense_date).toLocaleDateString()}</td>
                                        <td className="text-start">{expense.category}</td>
                                        <td className="text-start">{expense.approval_status}</td>
                                        <td className="text-start">{expense.submitted_by}</td>
                                        <td className="text-start">{expense.branch_name}</td>
                                        <td className="text-start">{expense.description}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
