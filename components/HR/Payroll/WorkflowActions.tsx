import React from 'react';
import {
     RiCheckboxCircleLine,
     RiLockLine,
     RiBankCardLine,
     RiRefreshLine,
     RiLoader4Line
} from '@remixicon/react';

interface WorkflowActionsProps {
     status: 'draft' | 'calculated' | 'approved' | 'locked' | 'paid';
     periodId: number;
     onApprove?: () => void;
     onLock?: () => void;
     onMarkPaid?: () => void;
     handleRevert?: (targetStatus: 'draft' | 'calculated' | 'approved' | 'locked') => void;
     onRecalculate?: () => void;
     loading?: boolean;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
     status,
     periodId,
     onApprove,
     onLock,
     onMarkPaid,
     handleRevert,
     onRecalculate,
     loading = false
}) => {
     const canApprove = status === 'calculated';
     const canLock = status === 'approved';
     const canMarkPaid = status === 'locked';
     const canRecalculate = status !== 'paid';

     if (status === 'paid') {
          return (
               <div className="alert alert-success d-flex align-items-center">
                    <RiBankCardLine size={20} className="me-2" />
                    <span>This payroll period has been paid and is now read-only.</span>
               </div>
          );
     }

     return (
          <div className="d-flex flex-wrap gap-2">
               {canApprove && onApprove && (
                    <button
                         className="btn btn-success d-flex align-items-center"
                         onClick={onApprove}
                         disabled={loading}
                    >
                         {loading ? (
                              <RiLoader4Line size={18} className="me-1 animate-spin" />
                         ) : (
                              <RiCheckboxCircleLine size={18} className="me-1" />
                         )}
                         Approve Payroll
                    </button>
               )}

               {canLock && onLock && (
                    <button
                         className="btn btn-warning d-flex align-items-center"
                         onClick={onLock}
                         disabled={loading}
                    >
                         {loading ? (
                              <RiLoader4Line size={18} className="me-1 animate-spin" />
                         ) : (
                              <RiLockLine size={18} className="me-1" />
                         )}
                         Lock Period
                    </button>
               )}

               {canMarkPaid && onMarkPaid && (
                    <button
                         className="btn btn-primary d-flex align-items-center"
                         onClick={onMarkPaid}
                         disabled={loading}
                    >
                         {loading ? (
                              <RiLoader4Line size={18} className="me-1 animate-spin" />
                         ) : (
                              <RiBankCardLine size={18} className="me-1" />
                         )}
                         Mark as Paid
                    </button>
               )}

               {canRecalculate && onRecalculate && (
                    <button
                         className="btn btn-outline-secondary d-flex align-items-center"
                         onClick={onRecalculate}
                         disabled={loading}
                    >
                         {loading ? (
                              <RiLoader4Line size={18} className="me-1 animate-spin" />
                         ) : (
                              <RiRefreshLine size={18} className="me-1" />
                         )}
                         Recalculate
                    </button>
               )}

               {handleRevert && (
                    <>
                         <button
                              className="btn btn-outline-secondary d-flex align-items-center"
                              onClick={() => handleRevert('draft')}
                              disabled={loading}
                         >
                              Reverse to Draft
                         </button>
                         <button
                              className="btn btn-outline-secondary d-flex align-items-center"
                              onClick={() => handleRevert('calculated')}
                              disabled={loading}
                         >
                              Reverse to Calculated
                         </button>
                         <button
                              className="btn btn-outline-secondary d-flex align-items-center"
                              onClick={() => handleRevert('approved')}
                              disabled={loading}
                         >
                              Reverse to Approved
                         </button>
                    </>
               )}
          </div>
     );
};
