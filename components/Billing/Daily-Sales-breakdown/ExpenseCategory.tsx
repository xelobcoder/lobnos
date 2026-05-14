import { RiBarChartGroupedLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'



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


interface AllExpenseCategory {
    category: string;
    expense_count: number;
    total_amount: string;
    percentage_of_total: string;
}

export default function ExpenseCategory({ allExpenseCategories }: { allExpenseCategories: AllExpenseCategory[] }) {
     return (
          <div>
               {Array.isArray(allExpenseCategories) && allExpenseCategories.length > 0 && (
                    <Card title="Expense Categories" icon={<RiBarChartGroupedLine />}>
                         <div className="table-responsive">
                              <table className="table table-hover table-striped">
                                   <thead className="table-light">
                                        <tr>
                                             <th className="text-start">Category</th>
                                             <th className="text-start">Expense Count</th>
                                             <th className="text-start">Total Amount</th>
                                             <th className="text-start">Percentage of Total</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {allExpenseCategories.map((category: AllExpenseCategory, index: number) => (
                                             <tr key={index}>
                                                  <td className="text-start">{category.category}</td>
                                                  <td className="text-start">{category.expense_count}</td>
                                                  <td className="text-start">
                                                       {currencyFormatter.format(Number(category.total_amount))}
                                                  </td>
                                                  <td className="text-start">{category.percentage_of_total}%</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </Card>
               )}
          </div>
     )
}
