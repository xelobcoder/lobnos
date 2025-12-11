"use client";

import React from 'react';
import Dashboards from '../../../../components/analytics/patients-analytics/components/Dashboards';

export default function DashboardsPage() {
     return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <Dashboards />
                    </div>
               </div>
          </div>
     );
}