import { RiGroupLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface OrganizationCommission {
     service_date: string;
     organization_name: string;
     organization_phone: string;
     organization_email: string;
     total_services: number;
     total_value: string;
     commission_percent: number;
     commission_earned: string;
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

export default function OrganizationCommissions({ OrganizationCommissions }: { OrganizationCommissions: OrganizationCommission[] }) {
     if (!Array.isArray(OrganizationCommissions) || OrganizationCommissions.length === 0) {
          return null
     }

     return (
          <Card title="Organization Commissions" icon={<RiGroupLine />}>
               <div className="table-responsive">
                    <table className="table table-hover table-striped">
                         <thead className="table-light">
                              <tr>
                                   <th className="text-start">Service Date</th>
                                   <th className="text-start">Organization</th>
                                   <th className="text-start">Contact</th>
                                   <th className="text-start">Services</th>
                                   <th className="text-start">Total Value</th>
                                   <th className="text-start">Commission %</th>
                                   <th className="text-start">Commission Earned</th>
                              </tr>
                         </thead>
                         <tbody>
                              {OrganizationCommissions.map((commission, index) => (
                                   <tr key={index}>
                                        <td className="text-start">{new Date(commission.service_date).toLocaleDateString()}</td>
                                        <td className="text-start">
                                             <div>
                                                  <strong>{commission.organization_name}</strong>
                                                  <br />
                                                  <small style={{ color: 'var(--bs-secondary-color)' }}>{commission.organization_email}</small>
                                             </div>
                                        </td>
                                        <td className="text-start">{commission.organization_phone}</td>
                                        <td className="text-start">{commission.total_services}</td>
                                        <td className="text-start">{currencyFormatter.format(Number(commission.total_value))}</td>
                                        <td className="text-start">{commission.commission_percent}%</td>
                                        <td className="text-start">{currencyFormatter.format(Number(commission.commission_earned))}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          </Card>
     )
}
