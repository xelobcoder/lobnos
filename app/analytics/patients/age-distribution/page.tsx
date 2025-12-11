"use client";

import React from 'react';
import AgeDistribution from '../../../../components/analytics/patients-analytics/components/AgeDistribution';

export default function AgeDistributionPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <AgeDistribution />
                    </div>
               </div>
          </div>
     );
}