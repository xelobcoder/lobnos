"use client";

import React from 'react';
import MissingDataAnalysis from '../../../../components/analytics/patients-analytics/components/MissingDataAnalysis';

export default function MissingDataAnalysisPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <MissingDataAnalysis />
                    </div>
               </div>
          </div>
     );
}