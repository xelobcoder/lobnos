"use client";

import React from 'react';
import PatientRegistrationOverTime from '../../../../components/analytics/patients-analytics/components/PatientRegistrationOverTime';

export default function PatientRegistrationOverTimePage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <PatientRegistrationOverTime />
                    </div>
               </div>
          </div>
     );
}