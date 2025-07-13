"use client";

import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';

// Import all analytics components directly
import AgeDistribution from '../../../components/analytics/patients-analytics/components/AgeDistribution';
import GenderDistribution from '../../../components/analytics/patients-analytics/components/GenderDistribution';
import MaritalStatus from '../../../components/analytics/patients-analytics/components/MaritalStatus';
import PatientRegistrationOverTime from '../../../components/analytics/patients-analytics/components/PatientRegistrationOverTime';
import ActivationStatus from '../../../components/analytics/patients-analytics/components/ActivationStatus';
import OccupationDistribution from '../../../components/analytics/patients-analytics/components/OccupationDistribution';
import MissingDataAnalysis from '../../../components/analytics/patients-analytics/components/MissingDataAnalysis';
import DuplicateRecords from '../../../components/analytics/patients-analytics/components/DuplicateRecords';
import CombinedAttributes from '../../../components/analytics/patients-analytics/components/CombinedAttributes';
import HighValuePatients from '../../../components/analytics/patients-analytics/components/HighValuePatients';
import Dashboards from '../../../components/analytics/patients-analytics/components/Dashboards';


interface RouteOption {
    endpoint: string;
    description: string;
}

const Page: React.FC = () => {
    

    return (
      <div>
        <div className="container-fluid bg-light">
          <div className="row g-4">
            <div className="col-12 mb-3">
              <Dashboards />
            </div>
            <div className="col-md-6">
              <AgeDistribution />
            </div>
            <div className="col-md-6">
              <GenderDistribution />
            </div>
            <div className="col-md-6">
              <MaritalStatus />
            </div>
            <div className="col-md-6">
              <MissingDataAnalysis />
            </div>
            <div className="col-md-12">
              <PatientRegistrationOverTime />
            </div>
            <div className="col-md-6">
              <ActivationStatus />
            </div>
            <div className="col-md-6">
              <OccupationDistribution />
            </div>
            
            <div className="col-md-6">
              <DuplicateRecords />
            </div>
          </div>
        </div>
      </div>
    );
};

export default Page;
