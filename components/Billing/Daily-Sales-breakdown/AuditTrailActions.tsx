import { RiFileList3Line } from '@remixicon/react'
import React from 'react'

interface AuditTrailAction {
     action_type: string;
     count: number;
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

const StatCard = ({ label, value }: { label: string; value: number }) => (
     <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
          <div className="d-flex align-items-center mb-2">
               <div className="me-2 text-primary">
                    <RiFileList3Line size={20} />
               </div>
               <span className="fw-medium text-muted small">{label}</span>
          </div>
          <div className="fs-4 fw-bold text-primary">{value}</div>
     </div>
)

export default function AuditTrailActions({ auditTrailActions }: { auditTrailActions: AuditTrailAction[] }) {
     if (!Array.isArray(auditTrailActions) || auditTrailActions.length === 0) {
          return null
     }

     return (
          <Card title="Audit Trail Actions" icon={<RiFileList3Line />}>
               <div className="row g-3">
                    {auditTrailActions.map((action, index) => (
                         <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2">
                              <StatCard label={`${action.action_type} Actions`} value={action.count} />
                         </div>
                    ))}
               </div>
          </Card>
     )
}
