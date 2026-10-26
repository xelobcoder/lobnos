import { RiLineChartLine } from '@remixicon/react'
import React from 'react'
import { currencyFormatter } from '../../Auth/customFetch'

interface DailyNightAdjustmentImpact {
     report_date: string;
     earned_revenue: string;
     total_night_adjustment_payable: string;
     total_normal_payable: string;
     night_adjustment_cases_count: number;
     normal_cases_count: number;
     total_cases: number;
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

export default function NightAdjustmentImpact({ dailyNightAdjustmentImpact }: { dailyNightAdjustmentImpact: DailyNightAdjustmentImpact[] }) {
     return (
          <Card title="Time Based Adjustment Impact Analysis" icon={<RiLineChartLine />}>
               {Array.isArray(dailyNightAdjustmentImpact) && dailyNightAdjustmentImpact.length > 0 ? (
                    <div className="table-responsive">
                         <table className="table table-hover table-striped">
                              <thead className="table-light">
                                   <tr>
                                        <th className="text-start">Report Date</th>
                                        <th className="text-start">Earned Revenue(total payable)</th>
                                        <th className="text-start">Total Time Based Adjustment Payable</th>
                                        <th className="text-start">Total Normal Payable</th>
                                        <th className="text-start">Time Based Adjustment Cases</th>
                                        <th className="text-start">Normal Cases</th>
                                        <th className="text-start">Total Cases</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {dailyNightAdjustmentImpact.map((adjustment, index) => (
                                        <tr key={index}>
                                             <td className="text-start">{new Date(adjustment.report_date).toLocaleDateString()}</td>
                                             <td className="text-start">{currencyFormatter.format(Number(adjustment.earned_revenue))}</td>
                                             <td className="text-start">{currencyFormatter.format(Number(adjustment.total_night_adjustment_payable))}</td>
                                             <td className="text-start">{currencyFormatter.format(Number(adjustment.total_normal_payable))}</td>
                                             <td className="text-start">{adjustment.night_adjustment_cases_count}</td>
                                             <td className="text-start">{adjustment.normal_cases_count}</td>
                                             <td className="text-start">{adjustment.total_cases}</td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               ) : (
                    <div className='bg-secondary d-flex flex-column align-items-center justify-content-center p-4 rounded' style={{ opacity: 0.8 }}>
                         <RiLineChartLine size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                         <p>No time-based adjustment data available for the selected period.</p>
                    </div>
               )}
          </Card>
     )
}
