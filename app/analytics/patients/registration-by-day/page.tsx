"use client";

import React from 'react';
import RegistrationByDayOfWeek from '../../../../components/analytics/patients-analytics/components/RegistrationByDayOfWeek';

export default function RegistrationByDayOfWeekPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <RegistrationByDayOfWeek />
                    </div>
               </div>
          </div>
     );
}