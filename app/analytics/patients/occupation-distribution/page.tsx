"use client";

import React from 'react';
import OccupationDistribution from '../../../../components/analytics/patients-analytics/components/OccupationDistribution';

export default function OccupationDistributionPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <OccupationDistribution />
                    </div>
               </div>
          </div>
     );
}