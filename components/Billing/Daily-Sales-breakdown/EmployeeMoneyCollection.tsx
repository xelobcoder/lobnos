import { RiGroupLine } from '@remixicon/react'
import React from 'react'

import { currencyFormatter } from '../../Auth/customFetch'

interface EmployeeCashCollection {
     username: string;
     total_transactions: number;
     total_amount: string;
     payment_date: string;
}


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


export default function EmployeeMoneyCollection({ employeesWhoCollectedCash }: { employeesWhoCollectedCash: EmployeeCashCollection[] }) {
     return (
          <Card title="Employee Cash Collection Summary" icon={<RiGroupLine />}>
               {Array.isArray(employeesWhoCollectedCash) && employeesWhoCollectedCash.length > 0 ? (
                    <div className="table-responsive">
                         <table className="table table-hover table-striped">
                              <thead className="table-light">
                                   <tr>
                                        <th className="text-start">Payment Date</th>
                                        <th className="text-start">Employee</th>
                                        <th className="text-start">Transactions</th>
                                        <th className="text-start">Total Amount</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {employeesWhoCollectedCash.map((employee: EmployeeCashCollection, index: number) => (
                                        <tr key={index}>
                                             <td className="text-start">
                                                  {new Date(employee.payment_date).toLocaleDateString()}
                                             </td>
                                             <td className="text-start">{employee.username}</td>
                                             <td className="text-start">
                                                  {employee.total_transactions}
                                             </td>
                                             <td className="text-start">
                                                  {currencyFormatter.format(Number(employee.total_amount))}
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               ) : (
                    <div className='bg-secondary d-flex flex-column align-items-center justify-content-center p-4 rounded' style={{ opacity: 0.8 }}>
                         <RiGroupLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                         <p>No cash collection data available for the selected period.</p>
                    </div>
               )}
          </Card>
     )
}
