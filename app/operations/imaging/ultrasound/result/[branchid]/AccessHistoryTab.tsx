'use client';

import React from 'react';
import AccessHistoryTable from '../../../../../../components/operations/Ultrasound/AccessHistoryTable';

interface AccessHistoryTabProps {
     employeeid: string;
     ascensionid?: string | null;
     shouldLoad: boolean;
}

export default function AccessHistoryTab({ employeeid, ascensionid, shouldLoad }: AccessHistoryTabProps) {
     return (
          <div>
               <div className="d-flex justify-content-between bg-secondary-subtle br-5 my-2 p-2">
                    <div>
                         <h5 className="d-flex my-2 mx-4 text-uppercase">Access Request History</h5>
                    </div>
               </div>
               <AccessHistoryTable employeeid={employeeid} ascensionid={ascensionid} shouldLoad={shouldLoad} />
          </div>
     );
}