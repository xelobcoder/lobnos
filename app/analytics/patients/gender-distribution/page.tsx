"use client";

import React from 'react';
import GenderDistribution from '../../../../components/analytics/patients-analytics/components/GenderDistribution';

export default function GenderDistributionPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <GenderDistribution />
                    </div>
               </div>
          </div>
     );
}