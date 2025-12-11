"use client";

import React from 'react';
import MaritalStatus from '../../../../components/analytics/patients-analytics/components/MaritalStatus';

export default function MaritalStatusPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <MaritalStatus />
                    </div>
               </div>
          </div>
     );
}